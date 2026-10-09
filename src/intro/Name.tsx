/**
 * "Rex Chao" in 3D. It fills the screen on load; scrolling the first screen zooms it out until it sits small in the
 * header's left slot, where it stays. Two looks to compare: solid letters, or particles that assemble on load.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import fontData from './name-font.json';

export type Look = 'solid' | 'particles';

const FONT = new FontLoader().parse(fontData as never);

/** The name geometry, centered, 1 unit tall per cap. */
function useNameGeometry() {
  return useMemo(() => {
    const g = new TextGeometry('Rex Chao', { font: FONT, size: 1, depth: 0.24, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.018, bevelSegments: 4 });
    g.computeBoundingBox();
    const b = g.boundingBox!;
    g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
    g.computeBoundingBox();
    return g;
  }, []);
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scroll progress through the opening, 0 (full screen) to 1 (docked). */
function progress() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 1;
  return Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)));
}

/** Places the name group each frame between its full-screen pose and its docked pose in the header slot. */
function useDock(size: THREE.Vector3) {
  const { camera, size: px } = useThree();
  const ref = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      tilt.current.x = (e.clientY / innerHeight - 0.5) * 2;
      tilt.current.y = (e.clientX / innerWidth - 0.5) * 2;
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);
  const cur = useRef({ rx: 0, ry: 0 });
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const cam = camera as THREE.PerspectiveCamera;
    const worldH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const f = worldH / px.height; // world units per CSS pixel at z = 0
    const e = easeInOut(progress());

    // Full screen: the name spans most of the width. Docked: its caps are ~30px tall, left edge on the header slot.
    const bigScale = Math.min((px.width * (px.width < 600 ? 0.9 : 0.84) * f) / size.x, (px.height * 0.42 * f) / size.y);
    const slot = document.querySelector('.slot')?.getBoundingClientRect();
    const capPx = px.width < 600 ? 18 : 28;
    const dockScale = (capPx * f) / size.y;
    const s = Math.exp(THREE.MathUtils.lerp(Math.log(bigScale), Math.log(dockScale), e));
    const dockX = slot ? slot.left + (size.x * dockScale) / f / 2 : 40;
    const dockY = slot ? slot.top + slot.height / 2 : 32;
    const bigY = px.height * 0.44;
    const x = THREE.MathUtils.lerp(px.width / 2, dockX, e);
    const y = THREE.MathUtils.lerp(bigY, dockY, e);
    g.scale.setScalar(s);
    g.position.set((x - px.width / 2) * f, (px.height / 2 - y) * f, 0);

    // Leans toward the pointer: more while big, a hint once docked.
    const amt = THREE.MathUtils.lerp(1, 0.35, e);
    const k = 1 - Math.exp(-dt * 5);
    cur.current.rx += (tilt.current.x * 0.22 * amt - cur.current.rx) * k;
    cur.current.ry += (tilt.current.y * 0.4 * amt - cur.current.ry) * k;
    g.rotation.set(cur.current.rx, cur.current.ry, 0);
  });
  return { ref, progress: () => easeInOut(progress()) };
}

/** Pearl over the dark opening, the theme's ink once docked. */
function useTone(from: string, to: string) {
  return useMemo(() => {
    const a = new THREE.Color(from), b = new THREE.Color(to), c = new THREE.Color();
    return (e: number) => c.copy(a).lerp(b, THREE.MathUtils.smoothstep(e, 0.45, 0.95));
  }, [from, to]);
}

function Solid({ from, to }: { from: string; to: string }) {
  const geo = useNameGeometry();
  const size = useMemo(() => geo.boundingBox!.getSize(new THREE.Vector3()), [geo]);
  const { ref, progress: prog } = useDock(size);
  const tone = useTone(from, to);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  useFrame(() => void mat.current?.color.copy(tone(prog())));
  return (
    <group ref={ref}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial ref={mat} roughness={0.35} metalness={0} clearcoat={0.6} clearcoatRoughness={0.25} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

const COUNT = 14000;

function Particles({ from, to }: { from: string; to: string }) {
  const geo = useNameGeometry();
  const size = useMemo(() => geo.boundingBox!.getSize(new THREE.Vector3()), [geo]);
  const { ref, progress: prog } = useDock(size);
  const { size: px } = useThree();
  const points = useMemo(() => {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
    const target = new Float32Array(COUNT * 3);
    const scatter = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const p = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
      sampler.sample(p);
      target.set([p.x, p.y, p.z], i * 3);
      // Start spread around and in front of the name, so some drift in past the camera.
      const r = 2 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      scatter.set([p.x * 1.6 + Math.cos(a) * r, p.y * 1.6 + Math.sin(a) * r * 0.6, p.z + (Math.random() - 0.3) * 8], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(target, 3));
    g.setAttribute('scatter', new THREE.BufferAttribute(scatter, 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [geo]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uForm: { value: 0 }, uTime: { value: 0 }, uSize: { value: 3 }, uColor: { value: new THREE.Color(from) }, uDpr: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute vec3 scatter; attribute float seed;
          uniform float uForm, uTime, uSize, uDpr;
          varying float vSeed;
          void main() {
            float t = smoothstep(seed * 0.5, seed * 0.5 + 0.5, uForm);
            vec3 p = mix(scatter, position, t);
            p += (1.0 - t * 0.85) * 0.03 * vec3(sin(uTime * 1.3 + seed * 40.0), cos(uTime * 1.1 + seed * 30.0), 0.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * uDpr * (0.7 + seed * 0.6);
            vSeed = seed;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            gl_FragColor = vec4(uColor * (0.85 + vSeed * 0.3), smoothstep(0.5, 0.2, d));
          }`,
      }),
    [],
  );
  const tone = useTone(from, to);
  const born = useRef(performance.now());
  useFrame(({ clock, gl }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const age = (performance.now() - born.current) / 2200;
    mat.uniforms.uForm.value = reduced ? 1 : Math.min(1, age);
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uDpr.value = gl.getPixelRatio();
    mat.uniforms.uColor.value.copy(tone(prog()));
    // Points stay a readable size: generous while big, fine once docked.
    mat.uniforms.uSize.value = THREE.MathUtils.lerp(Math.max(2.2, px.width / 520), 1.25, prog());
  });
  return (
    <group ref={ref}>
      <points geometry={points} material={mat} />
    </group>
  );
}

export function Name({ look, from, to }: { look: Look; from: string; to: string }) {
  return (
    <Canvas className="name3d" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 }} dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 12] }} gl={{ alpha: true, antialias: true }} aria-hidden>
      <hemisphereLight args={['#ffffff', '#b8c4e8', 1.4]} />
      <directionalLight position={[3, 5, 6]} intensity={1.2} />
      <directionalLight position={[-4, -3, 5]} intensity={0.9} color="#ffb070" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, -2, 2]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1} position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={[10, 4, 1]} />
      </Environment>
      {look === 'solid' ? <Solid from={from} to={to} /> : <Particles from={from} to={to} />}
    </Canvas>
  );
}
