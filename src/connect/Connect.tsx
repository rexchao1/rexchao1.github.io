/**
 * Scene 3, back on the island in daylight: Rex holds a bunch of balloons, each one a way to reach him, and confetti
 * drifts down. `show` (0..1) grows the balloons and confetti in.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Anchor, pin } from '../anchors';
import * as THREE from 'three';

const ICON = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 13h4" />
      <path d="M10 17h4" />
    </svg>
  ),
};

export const EMAIL = 'rexchao1@gmail.com';

type Balloon = { id: string; color: string; at: [number, number, number]; label: string; href?: string; icon: keyof typeof ICON };
const BALLOONS: Balloon[] = [
  { id: 'linkedin', color: '#2f7fe0', at: [-2.5, 3.45, -0.3], label: 'LinkedIn', href: 'https://www.linkedin.com/in/rexchao1/', icon: 'linkedin' },
  { id: 'github', color: '#35304a', at: [-0.9, 4.1, -0.5], label: 'GitHub', href: 'https://github.com/rexchao1', icon: 'github' },
  { id: 'email', color: '#ff6b5a', at: [-1.25, 2.75, 0.1], label: EMAIL, icon: 'mail' },
  { id: 'resume', color: '#ffc53d', at: [-2.8, 2.05, 0.4], label: 'Resume', icon: 'resume' },
];
/** Where the strings meet: Rex's left hand. */
const HAND = new THREE.Vector3(-0.33, 0.5, 0.25);

function copyEmail(btn: HTMLButtonElement) {
  const done = () => {
    btn.dataset.done = '1';
    window.setTimeout(() => delete btn.dataset.done, 1600);
  };
  navigator.clipboard?.writeText(EMAIL).then(done, () => {
    const r = document.createRange();
    const el = btn.parentElement?.querySelector('.addr');
    if (el) {
      r.selectNodeContents(el);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
  });
}

function OneBalloon({ b, i, show }: { b: Balloon; i: number; show: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const str = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => ({ top: new THREE.Vector3(), mid: new THREE.Vector3() }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = show.current;
    const k = THREE.MathUtils.clamp(s * 1.6 - i * 0.12, 0, 1);
    const e = 1 - Math.pow(1 - k, 3);
    if (!g.current || !str.current) return;
    const x = b.at[0] + Math.sin(t * 0.9 + i * 1.7) * 0.06;
    const y = HAND.y + (b.at[1] - HAND.y) * e + Math.sin(t * 1.3 + i) * 0.05;
    const z = b.at[2] + Math.cos(t * 0.7 + i) * 0.05;
    g.current.position.set(x, y, z);
    g.current.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.08;
    g.current.scale.setScalar(Math.max(0.001, e));
    // string from the knot to the hand
    tmp.top.set(x, y - 0.42, z);
    tmp.mid.copy(tmp.top).add(HAND).multiplyScalar(0.5);
    str.current.position.copy(tmp.mid);
    const len = tmp.top.distanceTo(HAND);
    str.current.scale.set(1, Math.max(0.001, len), 1);
    str.current.lookAt(tmp.top);
    str.current.rotateX(Math.PI / 2);
    str.current.visible = e > 0.02;
  });
  return (
    <>
      <group ref={g}>
        <mesh castShadow scale={[1, 1.18, 1]}>
          <sphereGeometry args={[0.36, 32, 24]} />
          <meshStandardMaterial color={b.color} roughness={0.25} metalness={0.05} />
        </mesh>
        <mesh position={[0.11, 0.16, 0.28]} scale={[0.6, 1, 0.4]}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, -0.43, 0]}>
          <coneGeometry args={[0.05, 0.07, 8]} />
          <meshStandardMaterial color={b.color} roughness={0.4} />
        </mesh>
        <Anchor id={'bal-' + b.id} position={[0, 0, 0.42]} />
      </group>
      <mesh ref={str}>
        <cylinderGeometry args={[0.004, 0.004, 1, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}

function Confetti({ show }: { show: React.RefObject<number> }) {
  const N = 140;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        x: (Math.random() - 0.5) * 9,
        z: (Math.random() - 0.5) * 6,
        y0: Math.random() * 6,
        sp: 0.35 + Math.random() * 0.5,
        rot: Math.random() * 6,
        rs: 1 + Math.random() * 3,
      })),
    [],
  );
  const colors = useMemo(() => ['#ff6b5a', '#ffc53d', '#2f7fe0', '#7bd389', '#b58df0', '#ff9ac1'], []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const s = show.current;
    m.visible = s > 0.05;
    if (!m.visible) return;
    seeds.forEach((p, i) => {
      const y = 6 - ((p.y0 + t * p.sp) % 6);
      dummy.position.set(p.x + Math.sin(t + i) * 0.2, y, p.z);
      dummy.rotation.set(t * p.rs + p.rot, t * p.rs * 0.7, p.rot);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (!m || m.userData.colored) return;
        mesh.current = m;
        const c = new THREE.Color();
        for (let i = 0; i < N; i++) m.setColorAt(i, c.set(colors[i % colors.length]));
        m.userData.colored = true;
      }}
      args={[undefined, undefined, N]}
    >
      <planeGeometry args={[0.07, 0.11]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.6} />
    </instancedMesh>
  );
}

/** The links on the balloons, as page HTML pinned to them (render outside the canvas). */
export function BalloonLinks() {
  return (
    <nav className="balloons" aria-label="Contact">
      {BALLOONS.map((b) => (
        <div key={b.id} ref={pin('bal-' + b.id)} className="balloon" style={{ ['--b' as string]: b.color }}>
          {b.href ? (
            <a href={b.href} target="_blank" rel="noreferrer">
              {ICON[b.icon]}
              <span>{b.label}</span>
            </a>
          ) : b.id === 'email' ? (
            <span className="mailrow">
              {ICON[b.icon]}
              <span className="addr">{b.label}</span>
              <button type="button" onClick={(e) => copyEmail(e.currentTarget)} aria-label="Copy email address">
                Copy
              </button>
            </span>
          ) : (
            <span className="soon" aria-disabled="true">
              {ICON[b.icon]}
              <span>{b.label}</span>
              <small>soon</small>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

export function Connect({ show }: { show: React.RefObject<number> }) {
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    if (root.current) root.current.visible = show.current > 0.01;
  });
  return (
    <group ref={root}>
      {BALLOONS.map((b, i) => (
        <OneBalloon key={b.id} b={b} i={i} show={show} />
      ))}
      <Confetti show={show} />
    </group>
  );
}
