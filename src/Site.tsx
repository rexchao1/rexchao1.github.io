/**
 * The site: one WebGL world plus a few HTML overlays, three scenes and a short snapping scroll between them.
 * 0 home (Rex's island, every thing hoverable), 1 projects (night space above the island), 2 connect (the island
 * in daylight, balloons). The camera and the sky follow `pos`, which eases toward the current scene.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Outline, Selection, Select, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { Environment, Island, type Mood } from './World';
import { Avatar } from './home/Avatar';
import { Baseball, Corkboard, Globe, Grill, Pennant, PetCorner, Pickleball, RecordPlayer, Skis } from './home/props';
import { PROJECTS, SPOTS, type Spot } from './content';
import { SPACE_CENTER, Space, SpaceLabels } from './space/Space';
import { BalloonLinks, Connect } from './connect/Connect';
import { Pinner } from './anchors';

type Placed = { id: string; at: [number, number, number]; rot: number; look: number; el: ReactNode };

const PLACED: Placed[] = [
  { id: 'ucla', at: [-3.5, 0, -2.5], rot: 0.35, look: 2.2, el: <Pennant /> },
  { id: 'friends', at: [-1.15, 0, -3.3], rot: 0.12, look: 1.3, el: <Corkboard /> },
  { id: 'globe', at: [1.25, 0, -3.0], rot: -0.1, look: 1.1, el: <Globe /> },
  { id: 'records', at: [3.4, 0, -2.1], rot: -0.6, look: 0.8, el: <RecordPlayer /> },
  { id: 'skis', at: [-3.7, 0, -0.2], rot: 0.7, look: 1.0, el: <Skis /> },
  { id: 'grill', at: [3.5, 0, 0.4], rot: -0.7, look: 0.9, el: <Grill /> },
  { id: 'baseball', at: [-2.5, 0, 1.9], rot: 0.5, look: 0.2, el: <Baseball /> },
  { id: 'pickleball', at: [-0.4, 0, 2.6], rot: 0, look: 0.1, el: <Pickleball /> },
  { id: 'pets', at: [2.4, 0, 2.3], rot: -0.55, look: 0.4, el: <PetCorner /> },
];

function Hot({ p, hovered, setHovered }: { p: Placed; hovered: string | null; setHovered: (id: string | null) => void }) {
  const on = hovered === p.id;
  const lift = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = lift.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 10);
    g.position.y += ((on ? 0.08 : 0) - g.position.y) * k;
    const s = g.scale.x + ((on ? 1.05 : 1) - g.scale.x) * k;
    g.scale.setScalar(s);
  });
  return (
    <group position={p.at} rotation={[0, p.rot, 0]}>
      <Select enabled={on}>
        <group
          ref={lift}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(p.id);
          }}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => {
            e.stopPropagation();
            setHovered(p.id);
          }}
        >
          {p.el}
        </group>
      </Select>
    </group>
  );
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Moves `pos` toward the scene, then places the camera and sets the sky mood from it. */
function Rig({ scene, pos, mood, show }: { scene: number; pos: React.RefObject<number>; mood: React.RefObject<Mood>; show: React.RefObject<number> }) {
  const { camera, size, pointer } = useThree();
  const v = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), la: new THREE.Vector3(), lb: new THREE.Vector3(), p: new THREE.Vector3(), l: new THREE.Vector3(), cur: new THREE.Vector3(0, 6, 12), look: new THREE.Vector3(0, 1, 0) }),
    [],
  );
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    // move pos toward the scene at a steady pace, eased per leg
    const d = scene - pos.current;
    pos.current += Math.sign(d) * Math.min(Math.abs(d), dt * 0.85);
    const P = pos.current;

    const homeD = Math.max(8.2, 5.0 / (tanH * aspect) + 1);
    const spaceD = Math.max(17, 8.8 / (tanH * aspect) + 1.5);
    const connD = Math.max(7.6, 3.4 / (tanH * aspect));
    const poses = [
      { p: [0, 3.0 + homeD * 0.12, homeD], l: [0, 0.9, 0] },
      { p: [SPACE_CENTER.x, SPACE_CENTER.y + 2.2, SPACE_CENTER.z + spaceD], l: [SPACE_CENTER.x, SPACE_CENTER.y + 0.5, SPACE_CENTER.z] },
      { p: [aspect < 0.8 ? -0.9 : 0.2, 2.0, connD], l: [aspect < 0.8 ? -0.9 : 0.1, 1.9, 0] },
    ];
    const i = Math.min(1, Math.floor(P));
    const t = ease(P - i);
    const A = poses[i], B = poses[i + 1];
    v.p.fromArray(A.p).lerp(v.b.fromArray(B.p), t);
    v.l.fromArray(A.l).lerp(v.lb.fromArray(B.l), t);
    // swing out in the middle of a leg so the move reads as a flight, not a slide
    const arc = Math.sin(t * Math.PI);
    v.p.z += arc * 6;
    v.p.x += pointer.x * 0.4;
    v.p.y += pointer.y * 0.2;
    v.cur.lerp(v.p, 1 - Math.exp(-dt * 6));
    v.look.lerp(v.l, 1 - Math.exp(-dt * 6));
    cam.position.copy(v.cur);
    cam.lookAt(v.look);

    mood.current.night = THREE.MathUtils.clamp(1 - Math.abs(P - 1) * 1.15, 0, 1);
    mood.current.day = THREE.MathUtils.clamp((P - 1.15) / 0.85, 0, 1);
    show.current = THREE.MathUtils.clamp((P - 1.5) * 2, 0, 1);
  });
  return null;
}

function Home({ hovered, setHovered, waveKey, onMe }: { hovered: string | null; setHovered: (id: string | null) => void; waveKey: number; onMe: () => void }) {
  const lookAt = useMemo(() => {
    const p = PLACED.find((x) => x.id === hovered);
    return p ? new THREE.Vector3(p.at[0], p.look, p.at[2]) : null;
  }, [hovered]);
  return (
    <group>
      <Island />
      {PLACED.map((p) => (
        <Hot key={p.id} p={p} hovered={hovered} setHovered={setHovered} />
      ))}
      <group
        position={[0, 0, 0.2]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered('me');
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation();
          onMe();
        }}
      >
        <Select enabled={hovered === 'me'}>
          <Avatar lookAt={lookAt} waveKey={waveKey} />
        </Select>
      </group>
    </group>
  );
}

function Card({ spot, right }: { spot: Spot | null; right: boolean }) {
  // Keep the last spot while fading out so the text does not vanish mid-fade.
  const [shown, setShown] = useState<Spot | null>(spot);
  useEffect(() => {
    if (spot) setShown(spot);
  }, [spot]);
  const s = spot ?? shown;
  return (
    <aside className={'card' + (spot ? ' on' : '') + (right ? ' right' : '')} aria-live="polite" style={{ ['--tint' as string]: s?.tint ?? '#2774AE' }}>
      {s && (
        <>
          {s.img && (
            <div className={'shotimg' + (s.tall ? ' tall' : '')}>
              <img src={s.img} alt="" />
            </div>
          )}
          {s.shots > 0 && (
            <div className="shots" data-n={s.shots}>
              {Array.from({ length: s.shots }, (_, i) => (
                <div key={i} className="shot">
                  <span>{s.id === 'posear' ? 'art coming' : 'photo'}</span>
                </div>
              ))}
            </div>
          )}
          <div className="txt">
            {s.tag && <p className="tag">{s.tag}</p>}
            <h2>{s.title}</h2>
            <p>{s.line}</p>
            {s.chips && (
              <ul className="chips">
                {s.chips.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

const SCENES = ['About', 'Projects', 'Say hi'];

export function Site() {
  const [scene, setScene] = useState(0);
  const [hovered, setHoveredRaw] = useState<string | null>(null);
  const [waveKey, setWaveKey] = useState(0);
  const mood = useRef<Mood>({ night: 0, day: 0 });
  const pos = useRef(0);
  const show = useRef(0);
  const sceneRef = useRef(0);
  sceneRef.current = scene;

  // Only the current scene's things react to the pointer.
  const setHovered = (id: string | null) => {
    if (id === null) return setHoveredRaw(null);
    const inScene = scene === 0 ? id in SPOTS : scene === 1 ? id in PROJECTS : false;
    if (inScene && Math.abs(pos.current - scene) < 0.05) setHoveredRaw(id);
  };

  const go = (n: number) => {
    const next = Math.max(0, Math.min(2, n));
    if (next === sceneRef.current) return;
    setHoveredRaw(null);
    setScene(next);
  };

  useEffect(() => {
    document.documentElement.dataset.scene = String(scene);
    if (scene === 2) {
      const first = window.setTimeout(() => setWaveKey((k) => k + 1), 1400);
      const again = window.setInterval(() => setWaveKey((k) => k + 1), 5200);
      return () => {
        window.clearTimeout(first);
        window.clearInterval(again);
      };
    }
  }, [scene]);

  // Short scroll: one wheel gesture, swipe or key press moves one scene.
  useEffect(() => {
    let lock = 0;
    let acc = 0;
    let touchY: number | null = null;
    const step = (dir: number) => {
      const now = performance.now();
      if (now < lock) return;
      lock = now + 1100;
      go(sceneRef.current + dir);
    };
    const onWheel = (e: WheelEvent) => {
      acc += e.deltaY;
      if (Math.abs(acc) > 40) {
        step(Math.sign(acc));
        acc = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) step(1);
      else if (['ArrowUp', 'PageUp'].includes(e.key)) step(-1);
      else return;
      e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) step(Math.sign(dy));
      touchY = null;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
  }, [hovered]);
  useEffect(() => {
    const t = window.setTimeout(() => setWaveKey(1), 900);
    return () => window.clearTimeout(t);
  }, []);

  const spot = hovered ? (SPOTS[hovered] ?? PROJECTS[hovered]) : null;
  const placed = PLACED.find((p) => p.id === hovered);
  const right = scene === 0 ? (placed?.at[0] ?? 1) < 0 : false;

  return (
    <>
      <div className="stage">
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ position: [0, 6, 12], fov: 36, near: 0.1, far: 900 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onPointerMissed={() => setHoveredRaw(null)}
        >
          <Environment mood={mood} />
          <Selection>
            <Home hovered={hovered} setHovered={setHovered} waveKey={waveKey} onMe={() => setWaveKey((k) => k + 1)} />
            <Space hovered={hovered} setHovered={setHovered} active={scene === 1} />
            <Connect show={show} />
            <EffectComposer multisampling={0} autoClear={false}>
              <Outline blur edgeStrength={4} visibleEdgeColor={0xfff3d6} hiddenEdgeColor={0x000000} width={1200} />
              <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.95} luminanceSmoothing={0.3} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <SMAA />
              <Vignette offset={0.3} darkness={0.5} />
            </EffectComposer>
          </Selection>
          <Rig scene={scene} pos={pos} mood={mood} show={show} />
          <Pinner />
        </Canvas>
      </div>
      <SpaceLabels />
      <BalloonLinks />
      <header className="name">
        <h1>Rex Chao</h1>
        <p>CS at UCLA</p>
      </header>
      <p className="hint s0">Hover anything</p>
      <div className="title s1">
        <h2>Things I've built</h2>
        <p>Hover a world</p>
      </div>
      <div className="title s2">
        <h2>Say hi</h2>
        <p>Grab a balloon</p>
      </div>
      <nav className="dots" aria-label="Sections">
        {SCENES.map((n, i) => (
          <button key={n} type="button" aria-current={scene === i ? 'true' : undefined} onClick={() => go(i)}>
            <span>{n}</span>
          </button>
        ))}
      </nav>
      {scene < 2 && (
        <button type="button" className="next" onClick={() => go(scene + 1)}>
          {scene === 0 ? 'See what I build' : 'Say hi'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      )}
      <Card spot={spot} right={right} />
    </>
  );
}
