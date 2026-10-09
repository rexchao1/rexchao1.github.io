/**
 * The environment: an LA golden-hour sky that turns to night space as `night` goes 0 -> 1 (the projects scene) and to a
 * bright day as `day` goes 0 -> 1 (the connect scene). A floating island, palm silhouettes on the far hills, lights.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type Mood = { night: number; day: number };

const SKY = {
  dusk: { top: '#2a1f5c', mid: '#c4588a', low: '#ffb27a', sun: '#fff1c9' },
  night: { top: '#03040c', mid: '#0a0d24', low: '#141a3a', sun: '#000000' },
  day: { top: '#5fb4ff', mid: '#9fd6ff', low: '#fff2d6', sun: '#ffffff' },
};

function mix3(a: Record<string, string>, b: Record<string, string>, c: Record<string, string>, n: number, d: number) {
  const out: Record<string, THREE.Color> = {};
  for (const k of Object.keys(a)) {
    out[k] = new THREE.Color(a[k]).lerp(new THREE.Color(b[k]), n).lerp(new THREE.Color(c[k]), d);
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
uniform float uStars; uniform float uTime;
varying vec3 vDir;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uLow, uMid, smoothstep(-0.02, 0.18, h));
  col = mix(col, uTop, smoothstep(0.15, 0.75, h));
  col = mix(col, uLow * 0.55, smoothstep(0.0, -0.25, h));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSun * (pow(s, 900.0) * 1.6 + pow(s, 12.0) * 0.25);
  // stars
  vec3 q = d * 380.0;
  vec3 cell = floor(q);
  float r = hash(cell);
  float dist = length(fract(q) - 0.5);
  float tw = 0.6 + 0.4 * sin(uTime * 2.0 + r * 40.0);
  float star = step(0.985, r) * smoothstep(0.22, 0.0, dist) * (0.4 + 0.6 * fract(r * 97.0));
  col += vec3(star * tw * uStars * 1.4 * smoothstep(-0.05, 0.25, h));
  gl_FragColor = vec4(col, 1.0);
}`;

function Sky({ mood }: { mood: React.RefObject<Mood> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uMid: { value: new THREE.Color() },
          uLow: { value: new THREE.Color() },
          uSun: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3(-0.35, 0.07, -1) },
          uStars: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [],
  );
  useFrame(({ clock, scene }) => {
    const { night, day } = mood.current;
    const c = mix3(SKY.dusk, SKY.night, SKY.day, night, day);
    mat.uniforms.uTop.value.copy(c.top);
    mat.uniforms.uMid.value.copy(c.mid);
    mat.uniforms.uLow.value.copy(c.low);
    mat.uniforms.uSun.value.copy(c.sun);
    mat.uniforms.uStars.value = 0.25 + night * 0.9 - day * 0.25;
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(c.low).lerp(c.mid, 0.3);
  });
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 48, 24]} />
    </mesh>
  );
}

/** Far hills and palm silhouettes in a ring, with an ocean plane: LA from a rooftop. */
function Horizon({ mood }: { mood: React.RefObject<Mood> }) {
  const hillMat = useRef<THREE.MeshBasicMaterial>(null);
  const seaMat = useRef<THREE.MeshStandardMaterial>(null);
  const palms = useMemo(() => {
    const out: Array<{ a: number; r: number; h: number; lean: number }> = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) out.push({ a: rnd() * Math.PI * 2, r: 46 + rnd() * 18, h: 6 + rnd() * 7, lean: (rnd() - 0.5) * 0.25 });
    return out;
  }, []);
  const hills = useMemo(() => {
    const g = new THREE.CylinderGeometry(90, 90, 14, 160, 1, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const a = Math.atan2(p.getZ(i), p.getX(i));
        const hgt = 2 + Math.sin(a * 3) * 2.2 + Math.sin(a * 7 + 1) * 1.4 + Math.sin(a * 13) * 0.6;
        p.setY(i, Math.max(0.5, hgt));
      } else p.setY(i, -3);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(() => {
    const { night, day } = mood.current;
    const c = new THREE.Color('#3b2346').lerp(new THREE.Color('#05060f'), night).lerp(new THREE.Color('#8fb3d6'), day);
    hillMat.current?.color.copy(c);
    seaMat.current?.color.copy(new THREE.Color('#6a3d6e').lerp(new THREE.Color('#05060f'), night).lerp(new THREE.Color('#4f9be0'), day));
  });
  return (
    <group position={[0, -6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[200, 64]} />
        <meshStandardMaterial ref={seaMat} roughness={0.15} metalness={0.4} />
      </mesh>
      <mesh geometry={hills}>
        <meshBasicMaterial ref={hillMat} side={THREE.DoubleSide} fog={false} />
      </mesh>
      {palms.map((p, i) => (
        <group key={i} position={[Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r]} rotation={[0, 0, p.lean]}>
          <mesh position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[0.12, 0.22, p.h, 5]} />
            <meshBasicMaterial color="#1a1026" />
          </mesh>
          {Array.from({ length: 7 }, (_, k) => (
            <mesh key={k} position={[0, p.h, 0]} rotation={[0, (k / 7) * Math.PI * 2, 1.1]}>
              <coneGeometry args={[0.35, 3.2, 3]} />
              <meshBasicMaterial color="#1a1026" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** The floating island the home scene stands on. */
export function Island() {
  const top = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 1024;
    const g = c.getContext('2d')!;
    g.fillStyle = '#6d5a86';
    g.fillRect(0, 0, 1024, 1024);
    // stone tiles in rings
    g.strokeStyle = 'rgba(30,18,48,0.35)';
    g.lineWidth = 3;
    for (let r = 120; r < 512; r += 96) {
      g.beginPath(); g.arc(512, 512, r, 0, Math.PI * 2); g.stroke();
      const n = Math.round(r / 22);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r;
        g.beginPath();
        g.moveTo(512 + Math.cos(a) * r, 512 + Math.sin(a) * r);
        g.lineTo(512 + Math.cos(a) * (r + 96), 512 + Math.sin(a) * (r + 96));
        g.stroke();
      }
    }
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      g.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
    }
    // center medallion
    g.strokeStyle = 'rgba(255,209,0,0.55)';
    g.lineWidth = 6;
    g.beginPath(); g.arc(512, 512, 100, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2;
    g.beginPath(); g.arc(512, 512, 84, 0, Math.PI * 2); g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group>
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[5.2, 5.2, 0.2, 96]} />
        <meshStandardMaterial attach="material-0" color="#4a3a60" roughness={0.8} />
        <meshStandardMaterial attach="material-1" map={top} roughness={0.85} />
        <meshStandardMaterial attach="material-2" color="#4a3a60" roughness={0.8} />
      </mesh>
      {/* the rock underneath */}
      <mesh position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[5.1, 2.8, 14, 3]} />
        <meshStandardMaterial color="#3a2c4c" roughness={1} flatShading />
      </mesh>
      {/* a glowing rim */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.12, 5.2, 96]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb35a" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export function Lights({ mood }: { mood: React.RefObject<Mood> }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    const { night, day } = mood.current;
    if (sun.current) {
      sun.current.color.set('#ffc890').lerp(new THREE.Color('#9fb4ff'), night).lerp(new THREE.Color('#fff8ea'), day);
      sun.current.intensity = 2.6 - night * 1.6 + day * 0.6;
    }
    if (hemi.current) {
      hemi.current.color.set('#ffb8d0').lerp(new THREE.Color('#5a6aa8'), night).lerp(new THREE.Color('#cfe8ff'), day);
      hemi.current.intensity = 1.1 - night * 0.5 + day * 0.5;
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffb8d0', '#3a2448', 1.1]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[-5, 6, -3]}
        intensity={2.6}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[4, 3, 6]} intensity={0.7} color="#c8b8ff" />
    </>
  );
}

export function Environment({ mood }: { mood: React.RefObject<Mood> }) {
  return (
    <>
      <fog attach="fog" args={['#c4588a', 30, 140]} />
      <Sky mood={mood} />
      <Horizon mood={mood} />
      <Lights mood={mood} />
    </>
  );
}
