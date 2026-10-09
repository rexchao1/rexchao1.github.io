/**
 * Rex as a small stylized character: UCLA hoodie, jeans, white sneakers. Built from primitives and animated by hand:
 * breathing, blinking, a wave when the page opens, and the head turns toward whatever is hovered (or the pointer).
 * Hair and skin colors are placeholders until Rex confirms them (LOOK below).
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const LOOK = {
  skin: '#e8b994',
  hair: '#2a211d',
  hoodie: '#2774AE',
  hoodieDark: '#1f5f8f',
  gold: '#FFD100',
  jeans: '#3c4f73',
  shoe: '#f4f2ee',
  sole: '#d9d4cc',
};

function M({ c, r = 0.7, e, ei = 1 }: { c: string; r?: number; e?: string; ei?: number }) {
  return <meshStandardMaterial color={c} roughness={r} emissive={e ?? '#000'} emissiveIntensity={e ? ei : 0} />;
}

type Props = {
  /** World point to look at, or null to follow the pointer. */
  lookAt: THREE.Vector3 | null;
  /** Bumped to trigger a wave. */
  waveKey: number;
};

export function Avatar({ lookAt, waveKey }: Props) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const st = useRef({ waveT0: -10, lastKey: -1, blinkAt: 2, yaw: 0, pitch: 0 });

  const logo = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = LOOK.hoodie;
    g.fillRect(0, 0, 256, 96);
    g.fillStyle = LOOK.gold;
    g.font = 'italic 900 70px "Hanken Grotesk", "Arial Black", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('UCLA', 128, 52);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3() }), []);

  useFrame(({ clock, pointer, camera }) => {
    const t = clock.elapsedTime;
    const s = st.current;
    if (waveKey !== s.lastKey) {
      s.lastKey = waveKey;
      s.waveT0 = t;
    }
    // breathing
    if (torso.current) torso.current.scale.set(1, 1 + Math.sin(t * 1.8) * 0.012, 1 + Math.sin(t * 1.8) * 0.02);
    if (root.current) root.current.position.y = Math.max(0, Math.sin(t * 1.8) * 0.006);

    // where to look: the hovered thing, else a point the pointer suggests in front of the camera
    if (lookAt) tmp.v.copy(lookAt);
    else tmp.v.set(pointer.x * 3, 1.3 + pointer.y * 1.2, 0).lerp(camera.position, 0.55);
    if (head.current && root.current) {
      root.current.worldToLocal(tmp.w.copy(tmp.v));
      tmp.w.y -= 1.3;
      const yaw = THREE.MathUtils.clamp(Math.atan2(tmp.w.x, tmp.w.z), -1.0, 1.0);
      const pitch = THREE.MathUtils.clamp(-Math.atan2(tmp.w.y, Math.hypot(tmp.w.x, tmp.w.z)), -0.35, 0.4);
      s.yaw += (yaw - s.yaw) * 0.08;
      s.pitch += (pitch - s.pitch) * 0.08;
      head.current.rotation.set(s.pitch, s.yaw * 0.75, -s.yaw * 0.08);
      if (torso.current) torso.current.rotation.y = s.yaw * 0.25;
    }

    // blink
    if (eyes.current) {
      const since = t - s.blinkAt;
      eyes.current.scale.y = since > 0 && since < 0.14 ? 0.12 : 1;
      if (since > 0.14) s.blinkAt = t + 2 + Math.random() * 3;
    }

    // wave (2.4 s) or relaxed arms with a slight swing
    const w = t - s.waveT0;
    const waving = w >= 0 && w < 2.4;
    const up = waving ? Math.min(1, w / 0.35) * Math.min(1, (2.4 - w) / 0.35) : 0;
    if (armR.current) armR.current.rotation.set(0, 0, 0.12 + up * 2.5);
    if (foreR.current) foreR.current.rotation.set(0, 0, waving ? Math.sin(w * 11) * 0.35 * up : 0);
    if (armL.current) armL.current.rotation.set(Math.sin(t * 1.8) * 0.03, 0, -0.12);
  });

  const leg = (x: number) => (
    <group position={[x, 0, 0]}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <capsuleGeometry args={[0.085, 0.42, 6, 14]} />
        <M c={LOOK.jeans} r={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.07, 0.05]}>
        <boxGeometry args={[0.17, 0.12, 0.3]} />
        <M c={LOOK.shoe} r={0.5} />
      </mesh>
      <mesh position={[0, 0.015, 0.05]}>
        <boxGeometry args={[0.18, 0.03, 0.31]} />
        <M c={LOOK.sole} r={0.6} />
      </mesh>
    </group>
  );

  const arm = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>, fore?: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[side * 0.27, 1.12, 0]}>
      <group rotation={[0, 0, 0]} scale={[side, 1, 1]}>
        <mesh castShadow position={[0.03, -0.17, 0]}>
          <capsuleGeometry args={[0.075, 0.22, 6, 12]} />
          <M c={LOOK.hoodie} r={0.85} />
        </mesh>
        <group ref={fore} position={[0.03, -0.34, 0]}>
          <mesh castShadow position={[0, -0.13, 0]}>
            <capsuleGeometry args={[0.068, 0.17, 6, 12]} />
            <M c={LOOK.hoodie} r={0.85} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.072, 0.072, 0.05, 12]} />
            <M c={LOOK.hoodieDark} r={0.9} />
          </mesh>
          <mesh castShadow position={[0, -0.32, 0]}>
            <sphereGeometry args={[0.065, 14, 10]} />
            <M c={LOOK.skin} r={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );

  return (
    <group ref={root}>
      {leg(-0.1)}
      {leg(0.1)}
      <group ref={torso}>
        {/* hoodie body */}
        <mesh castShadow position={[0, 0.92, 0]} scale={[1, 1, 0.72]}>
          <capsuleGeometry args={[0.24, 0.32, 8, 18]} />
          <M c={LOOK.hoodie} r={0.85} />
        </mesh>
        <mesh position={[0, 0.69, 0]} scale={[1, 1, 0.72]}>
          <cylinderGeometry args={[0.245, 0.245, 0.06, 20]} />
          <M c={LOOK.hoodieDark} r={0.9} />
        </mesh>
        {/* chest wordmark */}
        <mesh position={[0, 0.98, 0.178]} rotation={[-0.05, 0, 0]}>
          <planeGeometry args={[0.3, 0.11]} />
          <meshStandardMaterial map={logo} roughness={0.85} />
        </mesh>
        {/* front pocket */}
        <mesh position={[0, 0.8, 0.172]}>
          <planeGeometry args={[0.24, 0.1]} />
          <M c={LOOK.hoodieDark} r={0.9} />
        </mesh>
        {/* hood bunched at the neck */}
        <mesh castShadow position={[0, 1.2, -0.05]} rotation={[Math.PI / 2 + 0.25, 0, 0]}>
          <torusGeometry args={[0.13, 0.06, 10, 20]} />
          <M c={LOOK.hoodie} r={0.85} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 1.08, 0.17]}>
            <cylinderGeometry args={[0.006, 0.006, 0.14, 5]} />
            <M c="#f4f2ee" />
          </mesh>
        ))}
        {arm(1, armR, foreR)}
        {arm(-1, armL)}
        {/* head */}
        <group ref={head} position={[0, 1.3, 0]}>
          <mesh castShadow position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
            <M c={LOOK.skin} r={0.6} />
          </mesh>
          <mesh castShadow position={[0, 0.17, 0]} scale={[1, 1.05, 0.95]}>
            <sphereGeometry args={[0.22, 32, 24]} />
            <M c={LOOK.skin} r={0.55} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.215, 0.16, 0]} scale={[0.5, 1, 0.8]}>
              <sphereGeometry args={[0.05, 12, 10]} />
              <M c={LOOK.skin} r={0.6} />
            </mesh>
          ))}
          {/* hair: a cap over the top and back, plus a swept fringe */}
          <mesh castShadow position={[0, 0.2, -0.015]} scale={[1.06, 1.02, 1.02]}>
            <sphereGeometry args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <M c={LOOK.hair} r={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.13, -0.05]} scale={[1.04, 0.9, 0.95]}>
            <sphereGeometry args={[0.22, 24, 16, Math.PI * 0.75, Math.PI * 1.5, 0.4, 1.4]} />
            <M c={LOOK.hair} r={0.8} />
          </mesh>
          {[[-0.09, 0.32, 0.15, 0.4], [0.02, 0.34, 0.17, -0.1], [0.11, 0.32, 0.14, -0.5]].map(([x, y, z, r], i) => (
            <mesh key={i} castShadow position={[x, y, z]} rotation={[0.9, 0, r]} scale={[1.3, 0.5, 1]}>
              <sphereGeometry args={[0.07, 12, 8]} />
              <M c={LOOK.hair} r={0.8} />
            </mesh>
          ))}
          {/* face */}
          <group ref={eyes} position={[0, 0.16, 0.2]}>
            {[-0.075, 0.075].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh scale={[0.8, 1.15, 0.5]}>
                  <sphereGeometry args={[0.03, 14, 10]} />
                  <M c="#1b1716" r={0.2} />
                </mesh>
                <mesh position={[0.008, 0.01, 0.014]}>
                  <sphereGeometry args={[0.007, 8, 6]} />
                  <M c="#ffffff" e="#ffffff" ei={0.6} />
                </mesh>
              </group>
            ))}
          </group>
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, 0.225, 0.195]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
              <boxGeometry args={[0.06, 0.012, 0.01]} />
              <M c={LOOK.hair} />
            </mesh>
          ))}
          <mesh position={[0, 0.075, 0.2]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.04, 0.008, 6, 16, Math.PI]} />
            <M c="#8a3b2e" r={0.5} />
          </mesh>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.1, 0.17]} scale={[1, 0.6, 0.3]}>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color="#ff8a7a" transparent opacity={0.35} roughness={1} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
