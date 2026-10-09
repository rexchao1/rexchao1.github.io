/**
 * Rex's things on the island, built from primitives so they sit in Animus's low-poly look. Every prop stands on
 * the floor at its own origin and faces +z (toward the camera); Home places and turns them.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MatProps = { color: string; rough?: number; metal?: number; glow?: string; glowI?: number };
function Mat({ color, rough = 0.6, metal = 0, glow, glowI = 1 }: MatProps) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      metalness={metal}
      emissive={glow ?? '#000000'}
      emissiveIntensity={glow ? glowI : 0}
    />
  );
}

/** A canvas-drawn texture, made once. */
function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ---------------------------------------------------------------- UCLA pennant on a pole

export function Pennant() {
  const flag = useRef<THREE.Mesh>(null);
  const tex = useCanvasTexture(512, 256, (g) => {
    g.fillStyle = '#2774AE';
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FFD100';
    g.font = '900 112px "Hanken Grotesk", "Arial Black", system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.fillText('UCLA', 40, 132);
  });
  const geo = useMemo(() => {
    // A long thin triangle, hoist on the left. Subdivided so it can ripple.
    const g = new THREE.PlaneGeometry(1.5, 0.62, 24, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const k = 1 - (x + 0.75) / 1.5; // 1 at hoist, 0 at tip
      p.setY(i, p.getY(i) * Math.max(0.04, k));
    }
    g.translate(0.75, 0, 0);
    g.userData.base = Float32Array.from(p.array as Float32Array);
    return g;
  }, []);
  useFrame(({ clock }) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const base = geo.userData.base as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      p.setZ(i, Math.sin(x * 3.2 - t * 2.4) * 0.07 * (x / 1.5));
    }
    p.needsUpdate = true;
  });
  return (
    <group>
      <mesh castShadow position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 2.7, 10]} />
        <Mat color="#d8d4cc" rough={0.3} metal={0.6} />
      </mesh>
      <mesh position={[0, 2.72, 0]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <Mat color="#FFD100" rough={0.3} metal={0.5} />
      </mesh>
      <mesh castShadow position={[0.10, 2.66, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <Mat color="#d8d4cc" />
      </mesh>
      <mesh ref={flag} geometry={geo} castShadow position={[0.03, 2.33, 0]}>
        <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 20]} />
        <Mat color="#4a4458" rough={0.5} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- Baseball: home plate, bat, ball, umpire mask

export function Baseball() {
  const plate = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.3, 0.3);
    s.lineTo(0.3, 0.3);
    s.lineTo(0.3, 0);
    s.lineTo(0, -0.3);
    s.lineTo(-0.3, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const ball = useCanvasTexture(256, 128, (g) => {
    g.fillStyle = '#f6f2ea';
    g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#d0352b';
    g.lineWidth = 4;
    g.setLineDash([6, 5]);
    for (const off of [0, 128]) {
      g.beginPath();
      for (let x = 0; x <= 128; x += 2) g.lineTo(off + x, 64 + Math.sin((x / 128) * Math.PI * 2) * 34);
      g.stroke();
    }
  });
  return (
    <group>
      <mesh geometry={plate} receiveShadow castShadow position={[0, 0.0, 0]}>
        <Mat color="#f4f1ea" rough={0.7} />
      </mesh>
      {/* bat lying across the floor */}
      <group position={[0.15, 0.06, 0.5]} rotation={[0, 0.5, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.022, 1.0, 16]} />
          <Mat color="#c08a52" rough={0.45} />
        </mesh>
        <mesh castShadow position={[0, -0.51, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <Mat color="#3a2a20" />
        </mesh>
      </group>
      <mesh castShadow position={[-0.45, 0.075, 0.35]} rotation={[0.4, 0.8, 0]}>
        <sphereGeometry args={[0.075, 24, 16]} />
        <meshStandardMaterial map={ball} roughness={0.7} />
      </mesh>
      {/* umpire's cap and a bucket of balls */}
      <group position={[-0.05, 0.045, -0.02]} rotation={[0, 0.4, 0]}>
        <mesh castShadow scale={[1, 0.62, 1]}>
          <sphereGeometry args={[0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat color="#22242c" rough={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.005, 0.13]} scale={[1, 0.15, 0.7]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16, 1, false, -Math.PI / 2, Math.PI]} />
          <Mat color="#22242c" rough={0.8} />
        </mesh>
      </group>
      <group position={[-0.6, 0, -0.35]}>
        <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.17, 0.14, 0.34, 20, 1, true]} />
          <meshStandardMaterial color="#ff8a3d" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
          <Mat color="#d96d24" />
        </mesh>
        {[[0, 0.05], [0.07, 0.03], [-0.07, 0.02], [0.02, -0.07], [-0.04, -0.05], [0.06, -0.04]].map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0.33 + (i % 2) * 0.03, z]} rotation={[i, i * 2, 0]}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshStandardMaterial map={ball} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- Skis and poles in a little snowbank

export function Skis() {
  return (
    <group>
      <mesh receiveShadow castShadow position={[0, 0.06, 0]} scale={[1.1, 0.35, 0.8]}>
        <sphereGeometry args={[0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color="#f3f6fb" rough={0.95} />
      </mesh>
      {[-0.12, 0.12].map((x, i) => (
        <group key={x} position={[x, 0.95, 0]} rotation={[0, 0, (i ? -1 : 1) * 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[0.11, 1.8, 0.03]} />
            <Mat color={i ? '#ff5a4e' : '#ff7a3d'} rough={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.0, 0.02]}>
            <boxGeometry args={[0.112, 0.5, 0.01]} />
            <Mat color="#1f2433" rough={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.91, -0.03]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.11, 0.12, 0.03]} />
            <Mat color={i ? '#ff5a4e' : '#ff7a3d'} rough={0.35} />
          </mesh>
        </group>
      ))}
      {[-0.42, 0.42].map((x, i) => (
        <group key={x} position={[x, 0.65, 0.05]} rotation={[0, 0, (i ? -1 : 1) * 0.08]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.012, 0.012, 1.3, 8]} />
            <Mat color="#c9ced8" metal={0.7} rough={0.3} />
          </mesh>
          <mesh castShadow position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.16, 10]} />
            <Mat color="#1f2433" />
          </mesh>
          <mesh castShadow position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.008, 6, 16]} />
            <Mat color="#1f2433" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- Pickleball paddle and a ball

export function Pickleball() {
  const ball = useRef<THREE.Mesh>(null);
  const holes = useCanvasTexture(128, 128, (g) => {
    g.fillStyle = '#d8f23a';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#8fa61c';
    for (let y = 10; y < 128; y += 30) for (let x = (y / 30) % 2 ? 10 : 25; x < 128; x += 30) {
      g.beginPath();
      g.arc(x, y, 6, 0, Math.PI * 2);
      g.fill();
    }
  });
  useFrame(({ clock }) => {
    if (!ball.current) return;
    const t = clock.elapsedTime * 2.2;
    ball.current.position.y = 0.07 + Math.abs(Math.sin(t)) * 0.28;
  });
  const face = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 0.2, 0.24, 0, Math.PI * 2, false, 0);
    return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 32 });
  }, []);
  return (
    <group>
      <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <mesh geometry={face} castShadow receiveShadow>
          <Mat color="#3b6ff5" rough={0.35} />
        </mesh>
        <mesh castShadow position={[0, -0.34, 0.015]}>
          <boxGeometry args={[0.055, 0.2, 0.04]} />
          <Mat color="#20232c" rough={0.8} />
        </mesh>
      </group>
      <mesh ref={ball} castShadow position={[0.32, 0.07, 0.12]}>
        <sphereGeometry args={[0.07, 20, 14]} />
        <meshStandardMaterial map={holes} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- KBBQ: a round grill with glowing coals and meat

export function Grill() {
  const smoke = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = smoke.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.35 + i / g.children.length) % 1;
      c.position.y = 0.95 + t * 0.9;
      c.position.x = Math.sin(t * 6 + i) * 0.08;
      c.scale.setScalar(0.04 + t * 0.09);
      ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.16 * (1 - t) * Math.min(1, t * 6);
    });
  });
  return (
    <group>
      {/* table */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.06, 32]} />
        <Mat color="#6b4a35" rough={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.7, 12]} />
        <Mat color="#2a2530" metal={0.4} />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.04, 20]} />
        <Mat color="#2a2530" metal={0.4} />
      </mesh>
      {/* grill bowl with coals */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.24, 0.1, 28, 1, true]} />
        <Mat color="#3a3a42" metal={0.7} rough={0.35} />
      </mesh>
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 28]} />
        <Mat color="#ff5a1f" glow="#ff4a10" glowI={2.4} />
      </mesh>
      {/* grate */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((z) => (
        <mesh key={z} position={[0, 0.86, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.58 * Math.cos(Math.asin(z / 0.3)), 6]} />
          <Mat color="#9aa0aa" metal={0.9} rough={0.3} />
        </mesh>
      ))}
      {/* meat strips */}
      {[
        [-0.1, -0.06, 0.3],
        [0.06, 0.05, -0.2],
        [0.0, -0.14, 0.1],
        [0.12, 0.13, 0.6],
      ].map(([x, z, r], i) => (
        <mesh key={i} castShadow position={[x, 0.875, z]} rotation={[0, r, 0]}>
          <boxGeometry args={[0.16, 0.015, 0.06]} />
          <Mat color={i % 2 ? '#a5432f' : '#b85a3c'} rough={0.55} />
        </mesh>
      ))}
      {/* side dishes */}
      {[
        [0.42, 0.25, '#e8e2d6', '#d94b2b'],
        [-0.42, 0.22, '#e8e2d6', '#7fb24a'],
        [-0.15, 0.45, '#e8e2d6', '#f2d36b'],
      ].map(([x, z, bowl, food], i) => (
        <group key={i} position={[x as number, 0.76, z as number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.04, 16]} />
            <Mat color={bowl as string} rough={0.3} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
            <Mat color={food as string} rough={0.7} />
          </mesh>
        </group>
      ))}
      <group ref={smoke}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- Globe with pins on the places Rex has been

/** Very rough continent outlines (lon, lat), enough to read as Earth at this size. */
const LAND: Array<Array<[number, number]>> = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 63], [-60, 55], [-55, 47], [-70, 43], [-76, 35], [-81, 25], [-97, 26], [-97, 19], [-87, 15], [-78, 8], [-85, 11], [-105, 20], [-112, 30], [-125, 40], [-124, 49], [-135, 58], [-152, 60], [-165, 61]],
  [[-78, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-58, -38], [-68, -55], [-75, -45], [-71, -18], [-81, -5]],
  [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [8, 58], [5, 62], [20, 70], [40, 68], [60, 70], [100, 77], [140, 72], [180, 68], [170, 60], [140, 50], [130, 42], [122, 30], [120, 22], [108, 18], [104, 10], [98, 16], [92, 22], [80, 15], [77, 8], [72, 20], [57, 25], [52, 13], [43, 12], [35, 30], [28, 37], [24, 40], [13, 45], [12, 38], [0, 40]],
  [[-17, 21], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -5], [40, -15], [32, -27], [20, -35], [12, -18], [9, 4], [-8, 4], [-16, 12]],
  [[114, -22], [122, -18], [130, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [130, -32], [116, -35], [114, -26]],
  [[130, 31], [135, 34], [140, 36], [142, 41], [140, 45], [139, 38], [133, 34]],
  [[-50, 60], [-30, 68], [-22, 76], [-40, 83], [-60, 80], [-70, 76], [-55, 66]],
];
export const PLACES: Array<{ name: string; lat: number; lon: number; home?: boolean }> = [
  { name: 'Danville', lat: 37.8, lon: -121.97, home: true },
  { name: 'Alaska', lat: 61.2, lon: -149.9 },
  { name: 'Mexico', lat: 20.6, lon: -103.3 },
  { name: 'Peru', lat: -13.5, lon: -72.0 },
  { name: 'Spain', lat: 40.4, lon: -3.7 },
  { name: 'Japan', lat: 35.7, lon: 139.7 },
  { name: 'China', lat: 31.2, lon: 121.5 },
];

export function Globe() {
  const spin = useRef<THREE.Group>(null);
  const tex = useCanvasTexture(1024, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#3a6fb0');
    grd.addColorStop(0.5, '#2a5ea8');
    grd.addColorStop(1, '#3a6fb0');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1.5;
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * 1024;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * 512;
      g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke();
    }
    g.fillStyle = '#e9dcb8';
    for (const poly of LAND) {
      g.beginPath();
      poly.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * 1024;
        const y = ((90 - lat) / 180) * 512;
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      });
      g.closePath();
      g.fill();
    }
  });
  const R = 0.42;
  const pins = useMemo(
    () =>
      PLACES.map((p) => {
        const phi = ((90 - p.lat) * Math.PI) / 180;
        const th = ((p.lon + 180) * Math.PI) / 180;
        // SphereGeometry's u runs from -x around through +z; match it so pins land on the texture.
        const v = new THREE.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
        return { ...p, v };
      }),
    [],
  );
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.25;
  });
  return (
    <group>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 12]} />
        <Mat color="#b08a5a" rough={0.4} metal={0.3} />
      </mesh>
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.06, 24]} />
        <Mat color="#b08a5a" rough={0.4} metal={0.3} />
      </mesh>
      <group position={[0, 1.1, 0]} rotation={[0, 0, 0.41]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R + 0.06, 0.012, 8, 48, Math.PI * 1.2]} />
          <Mat color="#c9a46c" metal={0.7} rough={0.3} />
        </mesh>
        <group ref={spin}>
          <mesh castShadow>
            <sphereGeometry args={[R, 48, 32]} />
            <meshStandardMaterial map={tex} roughness={0.45} />
          </mesh>
          {pins.map((p) => (
            <group key={p.name} position={p.v.clone().multiplyScalar(R)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.v)}>
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.004, 0.004, 0.08, 6]} />
                <Mat color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.085, 0]}>
                <sphereGeometry args={[p.home ? 0.026 : 0.02, 12, 8]} />
                <Mat color={p.home ? '#ffd23f' : '#ff5a4e'} glow={p.home ? '#ffd23f' : '#ff5a4e'} glowI={1.6} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- Record player with a spinning record and sleeves

export const RECORD_COLORS = ['#ff7a66', '#5bb8ff', '#ffd23f', '#9b7bff'];

export function RecordPlayer() {
  const disc = useRef<THREE.Group>(null);
  const grooves = useCanvasTexture(256, 256, (g) => {
    g.fillStyle = '#111114';
    g.fillRect(0, 0, 256, 256);
    for (let r = 40; r < 126; r += 3) {
      g.strokeStyle = r % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
      g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = '#ff7a66';
    g.beginPath(); g.arc(128, 128, 36, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111114';
    g.beginPath(); g.arc(128, 128, 4, 0, Math.PI * 2); g.fill();
  });
  useFrame((_, dt) => {
    if (disc.current) disc.current.rotation.y -= dt * 3.5;
  });
  return (
    <group>
      {/* low cabinet */}
      <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[1.1, 0.68, 0.55]} />
        <Mat color="#8a5a3c" rough={0.5} />
      </mesh>
      {[-0.27, 0.27].map((x) => (
        <mesh key={x} position={[x, 0.34, 0.276]}>
          <boxGeometry args={[0.5, 0.58, 0.01]} />
          <Mat color="#734a31" rough={0.55} />
        </mesh>
      ))}
      {/* turntable */}
      <mesh castShadow position={[-0.12, 0.72, 0]}>
        <boxGeometry args={[0.62, 0.08, 0.46]} />
        <Mat color="#ece6dc" rough={0.4} />
      </mesh>
      <group ref={disc} position={[-0.18, 0.775, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.01, 48]} />
          <meshStandardMaterial map={grooves} roughness={0.25} metalness={0.1} />
        </mesh>
      </group>
      <group position={[0.1, 0.78, -0.15]} rotation={[0, -0.5, 0]}>
        <mesh castShadow position={[0, 0.03, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.26, 8]} />
          <Mat color="#c9ced8" metal={0.8} rough={0.25} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
          <Mat color="#c9ced8" metal={0.8} rough={0.25} />
        </mesh>
      </group>
      {/* sleeves leaning on the cabinet */}
      {RECORD_COLORS.map((c, i) => (
        <mesh key={c} castShadow position={[0.32 + i * 0.05, 0.98, -0.12 + i * 0.03]} rotation={[0, -0.25, -0.1 - i * 0.06]}>
          <boxGeometry args={[0.32, 0.32, 0.01]} />
          <Mat color={c} rough={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- Pets: a doghouse for Rusty, a cat tree for Petey and Jasper

export function PetCorner() {
  const sign = useCanvasTexture(256, 96, (g) => {
    g.fillStyle = '#f4ead8';
    g.fillRect(0, 0, 256, 96);
    g.fillStyle = '#7a3b22';
    g.font = '800 58px "Hanken Grotesk", "Arial Black", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('RUSTY', 128, 52);
  });
  const roof = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.42, 0);
    s.lineTo(0, 0.34);
    s.lineTo(0.42, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.72, bevelEnabled: false });
    g.translate(0, 0, -0.36);
    return g;
  }, []);
  return (
    <group>
      {/* doghouse */}
      <group position={[-0.25, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.7, 0.6, 0.66]} />
          <Mat color="#d9653b" rough={0.6} />
        </mesh>
        <mesh castShadow geometry={roof} position={[0, 0.6, 0]}>
          <Mat color="#4d3a5c" rough={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0.331]}>
          <circleGeometry args={[0.15, 24, 0, Math.PI]} />
          <Mat color="#1c1820" />
        </mesh>
        <mesh position={[0, 0.12, 0.331]}>
          <planeGeometry args={[0.3, 0.16]} />
          <Mat color="#1c1820" />
        </mesh>
        <mesh position={[0, 0.48, 0.332]}>
          <planeGeometry args={[0.34, 0.12]} />
          <meshStandardMaterial map={sign} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.12, 0.03, 0.55]}>
          <cylinderGeometry args={[0.1, 0.08, 0.06, 18]} />
          <Mat color="#3b6ff5" rough={0.3} />
        </mesh>
      </group>
      {/* cat tree */}
      <group position={[0.55, 0, -0.1]}>
        <mesh receiveShadow castShadow position={[0, 0.03, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <Mat color="#cbbba4" rough={0.9} />
        </mesh>
        <mesh castShadow position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.05, 12]} />
          <Mat color="#d8c39a" rough={1} />
        </mesh>
        {[0.55, 1.05].map((y, i) => (
          <mesh key={y} castShadow receiveShadow position={[i ? -0.05 : 0.08, y, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 20]} />
            <Mat color="#cbbba4" rough={0.9} />
          </mesh>
        ))}
        {/* a dangling toy */}
        <mesh position={[0.16, 0.38, 0.05]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <Mat color="#ff7a66" rough={0.8} />
        </mesh>
        <mesh position={[0.16, 0.46, 0.05]}>
          <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
          <Mat color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- Friends: a corkboard of polaroids on an easel

export const POLAROID_TINTS = ['#ffb38a', '#8fd3ff', '#ffd23f', '#b6e3a1', '#d7b8ff', '#ff9aa8'];

export function Corkboard() {
  const cork = useCanvasTexture(256, 192, (g) => {
    g.fillStyle = '#c99a63';
    g.fillRect(0, 0, 256, 192);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(90,50,20,0.18)' : 'rgba(255,230,190,0.15)';
      g.fillRect(Math.random() * 256, Math.random() * 192, 2, 2);
    }
  });
  const shots = [
    [-0.42, 0.22, 0.08], [-0.08, 0.26, -0.06], [0.28, 0.2, 0.1],
    [-0.36, -0.2, -0.1], [0.0, -0.16, 0.05], [0.36, -0.22, -0.08],
  ];
  return (
    <group>
      {/* easel legs */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} castShadow position={[x, 0.85, 0.06]} rotation={[0.08, 0, x > 0 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.05, 1.75, 0.05]} />
          <Mat color="#7a5638" rough={0.6} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.8, -0.3]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.05, 1.7, 0.05]} />
        <Mat color="#7a5638" rough={0.6} />
      </mesh>
      <group position={[0, 1.25, 0.12]} rotation={[-0.08, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.95, 0.05]} />
          <meshStandardMaterial map={cork} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <boxGeometry args={[1.38, 1.03, 0.04]} />
          <Mat color="#7a5638" rough={0.6} />
        </mesh>
        {shots.map(([x, y, r], i) => (
          <group key={i} position={[x, y, 0.03]} rotation={[0, 0, r]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.34, 0.006]} />
              <Mat color="#fbfaf6" rough={0.6} />
            </mesh>
            <mesh position={[0, 0.03, 0.004]}>
              <planeGeometry args={[0.25, 0.23]} />
              <Mat color={POLAROID_TINTS[i]} rough={0.4} />
            </mesh>
            <mesh position={[0, 0.15, 0.01]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <Mat color={i % 2 ? '#ff5a4e' : '#3b6ff5'} rough={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
