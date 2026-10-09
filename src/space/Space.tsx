/**
 * Scene 2, high above the island in night space: Tooey is the big ringed planet in the middle, every other build is
 * a small world on one of two orbits, and the two internships are stations with their logos.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Anchor, hiddenAnchors, pin } from '../anchors';
import { Select } from '@react-three/postprocessing';
import * as THREE from 'three';
import photonLogo from '../assets/photon.png';
import studioLogo from '../assets/studioapp.png';

export const SPACE_CENTER = new THREE.Vector3(0, 70, -30);

type World = { id: string; name: string; ring: 0 | 1; phase: number; r: number; a: string; b: string; extra?: 'ears' | 'face' | 'ring' | 'moon' };

export const WORLDS: World[] = [
  { id: 'frontdesk', name: 'Front desk', ring: 0, phase: 0.2, r: 0.42, a: '#7fe0c4', b: '#e9fff7', extra: 'moon' },
  { id: 'fetch', name: 'Fetch', ring: 0, phase: 2.3, r: 0.38, a: '#ff5a4e', b: '#ffd0c4', extra: 'ring' },
  { id: 'animus', name: 'Animus', ring: 0, phase: 4.3, r: 0.46, a: '#f4f1ea', b: '#d9d4cc', extra: 'face' },
  { id: 'bruindesk', name: 'Bruin Desk', ring: 1, phase: 0.9, r: 0.44, a: '#2774AE', b: '#FFD100' },
  { id: 'catcart', name: 'CatCart', ring: 1, phase: 2.0, r: 0.4, a: '#ff9a3d', b: '#ffe2b8', extra: 'ears' },
  { id: 'laoshu', name: 'Laoshu', ring: 1, phase: 3.25, r: 0.36, a: '#d93a3a', b: '#ffcf5a' },
  { id: 'posear', name: 'PoseAR', ring: 1, phase: 4.6, r: 0.4, a: '#9b7bff', b: '#e6dcff', extra: 'moon' },
];
const RINGS = [
  { radius: 4.0, tilt: 0.32, speed: 0.07 },
  { radius: 6.0, tilt: 0.22, speed: 0.045 },
];

function bands(a: string, b: string, seed: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = a;
  g.fillRect(0, 0, 256, 128);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = b;
    g.globalAlpha = 0.18 + rnd() * 0.35;
    const y = rnd() * 128;
    g.fillRect(0, y, 256, 3 + rnd() * 12);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type HoverProps = { hovered: string | null; setHovered: (id: string | null) => void; active: boolean };

function hoverHandlers(id: string, setHovered: (id: string | null) => void, active: boolean) {
  return {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      if (!active) return;
      e.stopPropagation();
      setHovered(id);
    },
    onPointerOut: () => active && setHovered(null),
    onClick: (e: { stopPropagation: () => void }) => {
      if (!active) return;
      e.stopPropagation();
      setHovered(id);
    },
  };
}

/** Marks where a world's name sits. `hideBehind` hides it while the world passes behind Tooey. */
function Label({ id, y, hideBehind }: { id: string; y: number; hideBehind?: boolean }) {
  const anchor = useRef<THREE.Group>(null);
  const v = useMemo(() => ({ w: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  useFrame(({ camera }) => {
    if (!hideBehind || !anchor.current) return;
    // hidden when the line from the camera to this world passes through Tooey (radius 2) before reaching it
    anchor.current.getWorldPosition(v.w);
    v.d.copy(v.w).sub(camera.position);
    const len = v.d.length();
    v.d.divideScalar(len);
    v.c.copy(SPACE_CENTER).sub(camera.position);
    const along = v.c.dot(v.d);
    const miss = v.c.lengthSq() - along * along;
    const blocked = along > 0 && along < len - 0.3 && miss < 2.0 * 2.0;
    if (blocked) hiddenAnchors.add('lbl-' + id);
    else hiddenAnchors.delete('lbl-' + id);
  });
  return (
    <group ref={anchor} position={[0, y, 0]}>
      <Anchor id={'lbl-' + id} />
    </group>
  );
}

/** The names, as page HTML pinned to their worlds (render outside the canvas). */
export function SpaceLabels() {
  const all = [
    { id: 'tooey', text: 'Tooey', sub: 'Cofounder', big: true },
    ...WORLDS.map((w) => ({ id: w.id, text: w.name, sub: undefined, big: false })),
    { id: 'photon', text: 'Photon Commerce', sub: 'Intern', big: false },
    { id: 'studioapp', text: 'StudioApp.ai', sub: 'Intern', big: false },
  ];
  return (
    <div className="labels" aria-hidden="true">
      {all.map((l) => (
        <div key={l.id} ref={pin('lbl-' + l.id)} className={'label' + (l.big ? ' big' : '')}>
          {l.text}
          {l.sub && <small>{l.sub}</small>}
        </div>
      ))}
    </div>
  );
}

function Tooey({ hovered, setHovered, active }: HoverProps) {
  const body = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => bands('#ff7a45', '#ffe3c2', 3), []);
  const ringTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 8;
    const g = c.getContext('2d')!;
    for (let x = 0; x < 512; x++) {
      const v = 0.5 + 0.5 * Math.sin(x * 0.11) * Math.sin(x * 0.031);
      g.fillStyle = `rgba(255,${200 + v * 40},${150 + v * 60},${0.25 + v * 0.6})`;
      g.fillRect(x, 0, 1, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const ringGeo = useMemo(() => {
    const g = new THREE.RingGeometry(2.6, 3.6, 96, 1);
    // map u across the ring's width so the stripes run around it
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const r = Math.hypot(p.getX(i), p.getY(i));
      uv.setXY(i, (r - 2.6) / 1.0, 0.5);
    }
    return g;
  }, []);
  useFrame((_, dt) => {
    if (body.current) body.current.rotation.y += dt * 0.08;
  });
  const on = hovered === 'tooey';
  return (
    <group {...hoverHandlers('tooey', setHovered, active)}>
      <Select enabled={on}>
        <mesh ref={body}>
          <sphereGeometry args={[2.0, 64, 48]} />
          <meshStandardMaterial map={tex} roughness={0.7} emissive="#ff6a2a" emissiveIntensity={0.12} />
        </mesh>
        <mesh geometry={ringGeo} rotation={[-Math.PI / 2 + 0.38, 0, 0.12]}>
          <meshStandardMaterial map={ringTex} transparent side={THREE.DoubleSide} roughness={0.8} depthWrite={false} />
        </mesh>
      </Select>
      <Label id="tooey" y={-2.75} />
    </group>
  );
}

function Planet({ w, hovered, setHovered, active }: { w: World } & HoverProps) {
  const tex = useMemo(() => bands(w.a, w.b, w.phase * 10), [w]);
  const on = hovered === w.id;
  return (
    <group {...hoverHandlers(w.id, setHovered, active)}>
      <Select enabled={on}>
        <mesh scale={on ? 1.15 : 1}>
          <sphereGeometry args={[w.r, 40, 28]} />
          <meshStandardMaterial map={tex} roughness={0.6} />
        </mesh>
        {w.extra === 'ring' && (
          <mesh rotation={[-Math.PI / 2 + 0.5, 0, 0]}>
            <ringGeometry args={[w.r * 1.35, w.r * 1.8, 48]} />
            <meshStandardMaterial color={w.b} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
        {w.extra === 'ears' &&
          [-1, 1].map((s) => (
            <mesh key={s} position={[s * w.r * 0.55, w.r * 0.85, 0]} rotation={[0, 0, -s * 0.35]}>
              <coneGeometry args={[w.r * 0.32, w.r * 0.55, 4]} />
              <meshStandardMaterial color={w.a} roughness={0.6} />
            </mesh>
          ))}
        {w.extra === 'face' && (
          <group position={[0, 0.02, w.r * 0.93]}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * w.r * 0.28, w.r * 0.08, 0]} scale={[0.8, 1.2, 0.4]}>
                <sphereGeometry args={[w.r * 0.11, 12, 8]} />
                <meshStandardMaterial color="#7fe9ff" emissive="#5fdcff" emissiveIntensity={2.2} />
              </mesh>
            ))}
            <mesh position={[0, -w.r * 0.18, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[w.r * 0.16, w.r * 0.03, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#7fe9ff" emissive="#5fdcff" emissiveIntensity={2.2} />
            </mesh>
          </group>
        )}
        {w.extra === 'moon' && (
          <mesh position={[w.r * 1.5, w.r * 0.6, 0]}>
            <sphereGeometry args={[w.r * 0.25, 16, 12]} />
            <meshStandardMaterial color={w.b} roughness={0.8} />
          </mesh>
        )}
      </Select>
      <Label id={w.id} y={-w.r - 0.32} hideBehind />
    </group>
  );
}

function Station({ id, logo, name, hovered, setHovered, active }: { id: string; logo: string; name: string } & HoverProps) {
  const spin = useRef<THREE.Group>(null);
  // Loaded without suspending so the scene never remounts; sizes are the logo files' own.
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load(logo);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [logo]);
  const aspect = logo === photonLogo ? 230 / 48 : 1;
  const pw = aspect > 2 ? 2.1 : 0.95;
  const ph = pw / aspect;
  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.06;
  });
  const on = hovered === id;
  return (
    <group ref={spin} {...hoverHandlers(id, setHovered, active)}>
      <Select enabled={on}>
        {/* hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.5, 20]} />
          <meshStandardMaterial color="#e8ebf2" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* solar wings */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.35, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.6, 0.5, 0.03]} />
              <meshStandardMaterial color="#2c4fa8" metalness={0.5} roughness={0.25} emissive="#1d3a8a" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-s * 0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#c9ced8" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* logo board */}
        <mesh position={[0, 0.5 + ph / 2 + 0.2, 0]}>
          <boxGeometry args={[pw + 0.3, ph + 0.26, 0.05]} />
          <meshBasicMaterial color="#f4f6fa" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.5 + ph / 2 + 0.2, 0.03]}>
          <planeGeometry args={[pw, ph]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color="#ff5a4e" emissive="#ff5a4e" emissiveIntensity={3} />
        </mesh>
      </Select>
      <Label id={id} y={-0.75} />
    </group>
  );
}

export function Space({ hovered, setHovered, active, portrait }: HoverProps & { portrait: boolean }) {
  const orbit = useRef<THREE.Group[]>([]);
  const angle = useRef([0, 0]);
  useFrame((_, dt) => {
    // orbits pause while anything is hovered so it is easy to read
    const still = hovered !== null;
    RINGS.forEach((r, i) => {
      if (!still) angle.current[i] += dt * r.speed;
      const g = orbit.current[i];
      if (!g) return;
      g.children.forEach((c) => {
        const ph = (c.userData.phase as number) + angle.current[i];
        c.position.set(Math.cos(ph) * r.radius, 0, Math.sin(ph) * r.radius);
        c.rotation.x = -r.tilt; // keep planets upright while the ring is tilted
      });
    });
  });
  return (
    <group position={SPACE_CENTER}>
      <Tooey hovered={hovered} setHovered={setHovered} active={active} />
      {RINGS.map((r, i) => (
        <group key={i} rotation={[r.tilt, 0, i ? -0.08 : 0.1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r.radius - 0.01, r.radius + 0.01, 160]} />
            <meshBasicMaterial color="#a9b8ff" transparent opacity={0.28} side={THREE.DoubleSide} />
          </mesh>
          <group ref={(g) => { if (g) orbit.current[i] = g; }}>
            {WORLDS.filter((w) => w.ring === i).map((w) => (
              <group key={w.id} userData={{ phase: w.phase }}>
                <Planet w={w} hovered={hovered} setHovered={setHovered} active={active} />
              </group>
            ))}
          </group>
        </group>
      ))}
      <group position={portrait ? [0, 1.5, -7.9] : [-7.4, 3.4, -2]} rotation={portrait ? [-0.9, 0, 0] : [0, 0.35, 0]}>
        <Station id="photon" logo={photonLogo} name="Photon Commerce" hovered={hovered} setHovered={setHovered} active={active} />
      </group>
      <group position={portrait ? [0, 1.5, 8.4] : [7.4, 3.2, -2]} rotation={portrait ? [-0.9, 0, 0] : [0, -0.35, 0]}>
        <Station id="studioapp" logo={studioLogo} name="StudioApp.ai" hovered={hovered} setHovered={setHovered} active={active} />
      </group>
      <pointLight position={[0, 0, 0]} intensity={30} distance={14} color="#ffb47a" />
      <directionalLight position={[6, 8, 10]} intensity={1.6} color="#dfe6ff" />
    </group>
  );
}
