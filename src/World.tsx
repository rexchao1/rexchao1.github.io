/**
 * The environment. Home is a sunny ballpark that runs out to green hills and a snowy ski mountain with a chairlift.
 * `night` (0..1) turns the sky to space for the projects scene; `golden` (0..1) warms it to golden hour for Say hi.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type Mood = { night: number; golden: number };

const SKY = {
  sun: { top: '#2a78d6', mid: '#6db7f2', low: '#c6e6ff', sun: '#fff6dc' },
  night: { top: '#03040c', mid: '#0a0d24', low: '#141a3a', sun: '#000000' },
  golden: { top: '#4a62c9', mid: '#ff9fb0', low: '#ffd49a', sun: '#fff1c9' },
};

const col = (h: string) => new THREE.Color(h);
function mixSky(n: number, g: number) {
  const out: Record<string, THREE.Color> = {};
  for (const k of Object.keys(SKY.sun) as Array<keyof typeof SKY.sun>) {
    out[k] = col(SKY.sun[k]).lerp(col(SKY.night[k]), n).lerp(col(SKY.golden[k]), g);
  }
  return out;
}

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const skyFrag = /* glsl */ `
uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uSun; uniform vec3 uSunDir;
uniform float uStars; uniform float uTime; uniform float uClouds;
varying vec3 vDir;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 c = mix(uLow, uMid, smoothstep(-0.02, 0.2, h));
  c = mix(c, uTop, smoothstep(0.15, 0.8, h));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  c += uSun * (smoothstep(0.9993, 0.9996, s) * 1.4 + pow(s, 10.0) * 0.22);
  // soft clouds
  if (h > 0.0) {
    vec2 uv = d.xz / (h + 0.25) * 2.2 + vec2(uTime * 0.01, 0.0);
    float n = noise(uv) * 0.6 + noise(uv * 2.3) * 0.3 + noise(uv * 5.1) * 0.1;
    float cl = smoothstep(0.55, 0.8, n) * smoothstep(0.0, 0.2, h) * uClouds;
    c = mix(c, vec3(1.0), cl * 0.75);
  }
  vec3 q = d * 380.0;
  float r = hash(floor(q));
  float star = step(0.985, r) * smoothstep(0.22, 0.0, length(fract(q) - 0.5)) * (0.4 + 0.6 * fract(r * 97.0));
  float tw = 0.6 + 0.4 * sin(uTime * 2.0 + r * 40.0);
  c += vec3(star * tw * uStars * 1.4 * smoothstep(-0.05, 0.25, h));
  gl_FragColor = vec4(c, 1.0);
}`;

function Sky({ mood }: { mood: React.RefObject<Mood> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uMid: { value: new THREE.Color() },
          uLow: { value: new THREE.Color() },
          uSun: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3(-0.6, 0.5, -1) },
          uStars: { value: 0 },
          uClouds: { value: 1 },
          uTime: { value: 0 },
        },
      }),
    [],
  );
  useFrame(({ clock, scene }) => {
    const { night, golden } = mood.current;
    const c = mixSky(night, golden);
    mat.uniforms.uTop.value.copy(c.top);
    mat.uniforms.uMid.value.copy(c.mid);
    mat.uniforms.uLow.value.copy(c.low);
    mat.uniforms.uSun.value.copy(c.sun);
    mat.uniforms.uStars.value = night;
    mat.uniforms.uClouds.value = 1 - night;
    mat.uniforms.uSunDir.value.set(-0.6, 0.5 - golden * 0.42, -1);
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(c.low).lerp(c.mid, 0.25);
  });
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 48, 24]} />
    </mesh>
  );
}

/** Grass with mowing stripes, a baseball diamond, foul lines and an outfield fence. Home plate sits at HOME_PLATE. */
export const HOME_PLATE = new THREE.Vector3(0, 0, 2.2);

function Field() {
  const grass = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#5fb04a' : '#69bb52';
      g.fillRect(0, i * 32, 256, 32);
    }
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,40,0,0.06)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(30, 30);
    t.anisotropy = 8;
    return t;
  }, []);
  const H = HOME_PLATE;
  const side = 6.2; // base path length
  const dirt = useMemo(() => {
    // infield dirt: a quarter disc out from home
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, side * 1.45, Math.PI / 4, (Math.PI * 3) / 4, false);
    s.lineTo(0, 0);
    const g = new THREE.ShapeGeometry(s, 48);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const infieldGrass = useMemo(() => {
    const k = side * 0.82;
    const s = new THREE.Shape();
    s.moveTo(0, 0.9);
    s.lineTo(k * Math.SQRT1_2, k * Math.SQRT1_2 + 0.2);
    s.lineTo(0, k * Math.SQRT2 - 0.4);
    s.lineTo(-k * Math.SQRT1_2, k * Math.SQRT1_2 + 0.2);
    s.closePath();
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const bases = [
    [side * Math.SQRT1_2, -side * Math.SQRT1_2],
    [0, -side * Math.SQRT2],
    [-side * Math.SQRT1_2, -side * Math.SQRT1_2],
  ];
  // the fence arc spans the fair territory (90 degrees, centered straight out from home toward -z)
  const arc: [number, number] = [Math.PI * 0.75, Math.PI * 0.5];
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]}>
        <circleGeometry args={[140, 72]} />
        <meshStandardMaterial map={grass} roughness={0.95} />
      </mesh>
      <group position={[H.x, 0, H.z]}>
        <mesh receiveShadow geometry={dirt}>
          <meshStandardMaterial color="#c98e5a" roughness={1} />
        </mesh>
        <mesh receiveShadow geometry={infieldGrass} position={[0, 0.005, 0]}>
          <meshStandardMaterial color="#62b44d" roughness={0.95} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial color="#c98e5a" roughness={1} />
        </mesh>
        {/* pitcher's mound and rubber */}
        <mesh receiveShadow castShadow position={[0, 0, -side * Math.SQRT1_2]} scale={[1, 0.12, 1]}>
          <sphereGeometry args={[0.95, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c98e5a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.125, -side * Math.SQRT1_2]}>
          <boxGeometry args={[0.36, 0.02, 0.09]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {bases.map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0.04, z]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        ))}
        {/* foul lines out to the fence */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 6.7, 0.012, -6.7]} rotation={[-Math.PI / 2, 0, s * (Math.PI / 4)]}>
            <planeGeometry args={[0.07, 19]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* outfield fence with a yellow top */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[19, 19, 1.4, 64, 1, true, arc[0], arc[1]]} />
          <meshStandardMaterial color="#1f5c3a" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <cylinderGeometry args={[19.02, 19.02, 0.08, 64, 1, true, arc[0], arc[1]]} />
          <meshStandardMaterial color="#ffd23f" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/** A snowy ski mountain with a chairlift running up it. Hoverable as the skiing spot. */
export function Mountain() {
  const chairs = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(20, 24, 9, 6).toNonIndexed();
    const p = g.attributes.position as THREE.BufferAttribute;
    // jitter by position (not index) so shared corners stay together
    const key = (x: number, y: number, z: number) => Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y > -11.9 && y < 11.9) {
        const r = key(Math.round(x * 10), Math.round(y * 10), Math.round(z * 10));
        const k = 0.85 + (r - Math.floor(r)) * 0.3;
        p.setX(i, x * k);
        p.setZ(i, z * k);
      }
    }
    g.computeVertexNormals();
    const colors = new Float32Array(p.count * 3);
    const snow = col('#f6f9ff'), rock = col('#8796ad'), pine = col('#3f7a4a');
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const c = y > 1 ? snow : y > -6 ? rock : pine;
      for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  const A = useMemo(() => new THREE.Vector3(5, 0.6, 15), []);
  const B = useMemo(() => new THREE.Vector3(2, 15.5, 4.5), []);
  useFrame(({ clock }) => {
    const g = chairs.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.03 + i / g.children.length) % 1;
      c.position.copy(A).lerp(B, t);
      c.position.y -= 0.9;
    });
  });
  const towers = [0.12, 0.37, 0.62, 0.87].map((t) => A.clone().lerp(B, t));
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const len = A.distanceTo(B);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <group>
      <mesh geometry={geo} position={[0, 11.5, 0]} castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.9} />
      </mesh>
      <mesh position={mid} quaternion={q}>
        <cylinderGeometry args={[0.12, 0.12, len, 4]} />
        <meshStandardMaterial color="#2a2a33" />
      </mesh>
      {towers.map((p, i) => (
        <mesh key={i} position={[p.x, p.y - 1, p.z]}>
          <boxGeometry args={[0.5, 2, 0.5]} />
          <meshStandardMaterial color="#d24a3a" />
        </mesh>
      ))}
      <group ref={chairs}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[1.6, 0.8, 0.9]} />
            <meshStandardMaterial color="#ffd23f" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Rolling green hills, two smaller peaks and round trees out past the fence. */
function Countryside({ mood }: { mood: React.RefObject<Mood> }) {
  const hillMat = useRef<THREE.MeshStandardMaterial>(null);
  const trees = useMemo(() => {
    const out: Array<{ x: number; z: number; s: number; c: string }> = [];
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 23 + rnd() * 34;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r - 6;
      if (z > 6) continue; // keep the camera side open
      out.push({ x, z, s: 0.8 + rnd() * 1.1, c: ['#3f8f45', '#4f9e4a', '#357d3c'][i % 3] });
    }
    return out;
  }, []);
  const hills = useMemo(() => {
    const g = new THREE.CylinderGeometry(110, 110, 20, 160, 1, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const a = Math.atan2(p.getZ(i), p.getX(i));
        p.setY(i, 4 + Math.sin(a * 3) * 3 + Math.sin(a * 7 + 1) * 2 + Math.sin(a * 13) * 0.8);
      } else p.setY(i, -2);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(() => {
    const { night, golden } = mood.current;
    hillMat.current?.color.set('#7fb56e').lerp(col('#0a0f1e'), night).lerp(col('#b9a878'), golden * 0.5);
  });
  return (
    <group>
      <mesh geometry={hills} position={[0, 0, -20]}>
        <meshStandardMaterial ref={hillMat} side={THREE.DoubleSide} roughness={1} />
      </mesh>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
            <meshStandardMaterial color="#7a5638" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <icosahedronGeometry args={[1.05, 0]} />
            <meshStandardMaterial color={t.c} flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Lights({ mood }: { mood: React.RefObject<Mood> }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    const { night, golden } = mood.current;
    if (sun.current) {
      sun.current.color.set('#fff4e0').lerp(col('#9fb4ff'), night).lerp(col('#ffc890'), golden);
      sun.current.intensity = 3.0 - night * 2.0 - golden * 0.4;
    }
    if (hemi.current) {
      hemi.current.color.set('#cfe8ff').lerp(col('#5a6aa8'), night).lerp(col('#ffc8d8'), golden);
      hemi.current.groundColor.set('#5c8a3e').lerp(col('#1a1a30'), night);
      hemi.current.intensity = 1.3 - night * 0.7;
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#cfe8ff', '#5c8a3e', 1.3]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[6, 11, 9]}
        intensity={3}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, 3, 8]} intensity={0.6} color="#ffffff" />
    </>
  );
}

export function Environment({ mood }: { mood: React.RefObject<Mood> }) {
  return (
    <>
      <fog attach="fog" args={['#c6e6ff', 80, 260]} />
      <Sky mood={mood} />
      <Lights mood={mood} />
      <Field />
      <Countryside mood={mood} />
    </>
  );
}
