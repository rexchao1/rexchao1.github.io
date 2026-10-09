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
import { Environment, Mountain, type Mood } from './World';
import { Avatar } from './home/Avatar';
import { Baseball, Corkboard, Globe, Grill, Pennant, PetCorner, Pickleball, RecordPlayer } from './home/props';
import { PROJECTS, SPOTS, type Spot } from './content';
import { SPACE_CENTER, Space, SpaceLabels } from './space/Space';
import { BalloonLinks, Connect } from './connect/Connect';
import { Pinner } from './anchors';

type Placed = { id: string; at: [number, number, number]; rot: number; look: number; el: ReactNode };

/** Rex stands by home plate; his things are spread over the ballpark, the ski mountain out past the fence. */
export const REX: [number, number, number] = [1.0, 0, 2.7];

const PLACED: Placed[] = [
  { id: 'baseball', at: [0, 0, 2.2], rot: 0, look: 0.2, el: <Baseball /> },
  { id: 'ucla', at: [-7.2, 0, 0.6], rot: 0.5, look: 2.2, el: <Pennant /> },
  { id: 'friends', at: [-5.4, 0, -6.2], rot: 0.35, look: 1.3, el: <Corkboard /> },
  { id: 'globe', at: [5.0, 0, -6.4], rot: -0.3, look: 1.1, el: <Globe /> },
  { id: 'records', at: [7.4, 0, -0.6], rot: -0.9, look: 0.8, el: <RecordPlayer /> },
  { id: 'grill', at: [5.0, 0, 3.8], rot: -0.6, look: 0.9, el: <Grill /> },
  { id: 'pickleball', at: [2.6, 0, 5.6], rot: 0, look: 0.1, el: <Pickleball /> },
  { id: 'pets', at: [-4.8, 0, 4.4], rot: 0.5, look: 0.4, el: <PetCorner /> },
  { id: 'skis', at: [26, 0, -80], rot: -0.4, look: 14, el: <Mountain /> },
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
/** Turn of the home view around the island (phones: drifts on its own and follows a sideways drag). */
export const spin = { az: 0, held: false };

function Rig({ scene, pos, mood, show, idle }: { scene: number; pos: React.RefObject<number>; mood: React.RefObject<Mood>; show: React.RefObject<number>; idle: boolean }) {
  const { camera, size, pointer } = useThree();
  const v = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), la: new THREE.Vector3(), lb: new THREE.Vector3(), p: new THREE.Vector3(), l: new THREE.Vector3(), cur: new THREE.Vector3(0, 6, 12), look: new THREE.Vector3(0, 1, 0) }),
    [],
  );
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const portrait = aspect < 0.8;
    // phones get a wider lens
    const fov = portrait ? 50 : 36;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    if (portrait && idle && !spin.held && scene === 0) spin.az += dt * 0.12;
    // move pos toward the scene at a steady pace, eased per leg
    const d = scene - pos.current;
    pos.current += Math.sign(d) * Math.min(Math.abs(d), dt * 0.85);
    const P = pos.current;

    const C = SPACE_CENTER;
    let poses: Array<{ p: number[]; l: number[] }>;
    if (!portrait) {
      const homeD = Math.max(15.5, 8.4 / (tanH * aspect));
      const spaceD = Math.max(17, 8.8 / (tanH * aspect) + 1.5);
      const connD = Math.max(7.6, 3.4 / (tanH * aspect));
      poses = [
        { p: [0, 2.0 + homeD * 0.16, homeD], l: [0, 1.6, -4] },
        { p: [C.x, C.y + 2.2, C.z + spaceD], l: [C.x, C.y + 0.5, C.z] },
        { p: [REX[0] - 0.2, 2.3, REX[2] + connD], l: [REX[0] - 0.3, 2.35, REX[2]] },
      ];
    } else {
      // Phones: frame less width, look down more, and let the view circle the island instead.
      const homeD = 3.6 / (tanH * aspect);
      const az = Math.sin(spin.az) * 0.55; // sway side to side over the field
      const spaceD = 6.6 / (tanH * aspect);
      const connD = 2.6 / (tanH * aspect);
      poses = [
        { p: [Math.sin(az) * homeD * 0.8, homeD * 0.26, 2 + Math.cos(az) * homeD * 0.8], l: [Math.sin(az) * 1.2, 1.6, -5] },
        { p: [C.x, C.y + spaceD * 0.8, C.z + spaceD * 0.6], l: [C.x, C.y, C.z + 0.6] },
        { p: [REX[0] - 0.7, 3.6, REX[2] + connD], l: [REX[0] - 0.7, 0.3, REX[2]] },
      ];
    }
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
    mood.current.golden = THREE.MathUtils.clamp((P - 1.15) / 0.85, 0, 1);
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
      {PLACED.map((p) => (
        <Hot key={p.id} p={p} hovered={hovered} setHovered={setHovered} />
      ))}
      <group
        position={REX}
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
  const mood = useRef<Mood>({ night: 0, golden: 0 });
  const pos = useRef(0);
  const show = useRef(0);
  const sceneRef = useRef(0);
  const [portrait, setPortrait] = useState(() => innerWidth / innerHeight < 0.8);
  useEffect(() => {
    const on = () => setPortrait(innerWidth / innerHeight < 0.8);
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
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
    let touchX = 0;
    let sideways = false;
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
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      sideways = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null || sceneRef.current !== 0) return;
      const dx = e.touches[0].clientX - touchX;
      if (!sideways && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(e.touches[0].clientY - touchY)) sideways = true;
      if (sideways) {
        spin.held = true;
        spin.az -= dx * 0.008;
        touchX = e.touches[0].clientX;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      spin.held = false;
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (!sideways && Math.abs(dy) > 50) step(Math.sign(dy));
      touchY = null;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
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
            <Space hovered={hovered} setHovered={setHovered} active={scene === 1} portrait={portrait} />
            <group position={[REX[0], 0, REX[2] - 0.2]}>
              <Connect show={show} />
            </group>
            <EffectComposer multisampling={0} autoClear={false}>
              <Outline blur edgeStrength={4} visibleEdgeColor={0xfff3d6} hiddenEdgeColor={0x000000} width={1200} />
              <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.95} luminanceSmoothing={0.3} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <SMAA />
              <Vignette offset={0.3} darkness={0.5} />
            </EffectComposer>
          </Selection>
          <Rig scene={scene} pos={pos} mood={mood} show={show} idle={hovered === null} />
          <Pinner />
        </Canvas>
      </div>
      <SpaceLabels />
      <BalloonLinks />
      <header className="name">
        <h1>Rex Chao</h1>
        <p>CS at UCLA</p>
      </header>
      <p className="hint s0">{portrait ? 'Tap anything' : 'Hover anything'}</p>
      <div className="title s1">
        <h2>Things I've built</h2>
        <p>{portrait ? 'Tap a world' : 'Hover a world'}</p>
      </div>
      <div className="title s2">
        <h2>Say hi</h2>
        <p>{portrait ? 'Pick one' : 'Grab a balloon'}</p>
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
