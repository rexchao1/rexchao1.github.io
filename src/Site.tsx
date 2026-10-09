/**
 * The site: one WebGL world plus a few HTML overlays. Scene 1 (home) is Rex's island: his character and his things,
 * each hoverable, with a card in the corner.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Outline, Selection, Select, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { Environment, Island, type Mood } from './World';
import { Avatar } from './home/Avatar';
import { Baseball, Corkboard, Globe, Grill, Pennant, PetCorner, Pickleball, RecordPlayer, Skis } from './home/props';
import { SPOTS, type Spot } from './content';

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
  const lift = useRef<THREE.Group>(null);
  const on = hovered === p.id;
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

/** Camera: frames the island (pulls back on narrow screens) and drifts slightly with the pointer. */
function HomeCamera() {
  const { camera, size, pointer } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // keep about 5.4 m of island width in view
    const halfW = 5.0;
    const dist = Math.max(8.2, halfW / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect) + 1);
    const tx = pointer.x * 0.5;
    const ty = 3.0 + dist * 0.12 + pointer.y * 0.25;
    cam.position.x += (tx - cam.position.x) * 0.05;
    cam.position.y += (ty - cam.position.y) * 0.05;
    cam.position.z += (dist - cam.position.z) * 0.05;
    cam.lookAt(look);
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
          {s.shots > 0 && (
            <div className="shots" data-n={s.shots}>
              {Array.from({ length: s.shots }, (_, i) => (
                <div key={i} className="shot">
                  <span>photo</span>
                </div>
              ))}
            </div>
          )}
          <h2>{s.title}</h2>
          <p>{s.line}</p>
          {s.chips && (
            <ul className="chips">
              {s.chips.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  );
}

export function Site() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [waveKey, setWaveKey] = useState(0);
  const mood = useRef<Mood>({ night: 0, day: 0 });
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
  }, [hovered]);
  useEffect(() => {
    const t = window.setTimeout(() => setWaveKey(1), 900);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <>
      <div className="stage">
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ position: [0, 4, 9], fov: 36, near: 0.1, far: 900 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onPointerMissed={() => setHovered(null)}
        >
          <Environment mood={mood} />
          <Selection>
            <Home hovered={hovered} setHovered={setHovered} waveKey={waveKey} onMe={() => setWaveKey((k) => k + 1)} />
            <EffectComposer multisampling={0} autoClear={false}>
              <Outline blur edgeStrength={4} visibleEdgeColor={0xfff3d6} hiddenEdgeColor={0x000000} width={1200} />
              <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.95} luminanceSmoothing={0.3} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <SMAA />
              <Vignette offset={0.3} darkness={0.55} />
            </EffectComposer>
          </Selection>
          <HomeCamera />
        </Canvas>
      </div>
      <header className="name">
        <h1>Rex Chao</h1>
        <p>CS at UCLA</p>
      </header>
      <p className="hint">Hover anything</p>
      <Card spot={hovered ? SPOTS[hovered] : null} right={(PLACED.find((p) => p.id === hovered)?.at[0] ?? 1) < 0} />
    </>
  );
}
