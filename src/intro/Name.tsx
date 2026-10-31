/**
 * "Rex Chao" in 3D. It fills the screen on load; scrolling the first screen zooms it out until it sits small in the
 * header's left slot, where it stays. It is drawn as outlined beads that drift in and assemble on load.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import fontData from './name-font.json';

const FONT = new FontLoader().parse(fontData as never);

/** The name geometry, centered, 1 unit tall per cap. */
function useNameGeometry() {
  return useMemo(() => {
    // Shallow, so nearly every sampled point sits on the face and the small docked name stays readable.
    const g = new TextGeometry('Rex Chao', { font: FONT, size: 1, depth: 0.06, curveSegments: 10, bevelEnabled: false });
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

/** Beads are few and large so each one's outline reads. */
const COUNT = 2400;

/** Each bead's face and ring color while the name is big. */
export type Beads = { face: string; ring: string };

function Particles({ beads, ink }: { beads: Beads; ink: string }) {
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
  // Opaque beads, a face inside a ring, depth-tested so nearer beads cover farther ones. As the name docks they
  // fill in solid ink so the small header name stays readable.
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uForm: { value: 0 }, uTime: { value: 0 }, uSize: { value: 8 }, uSolid: { value: 0 }, uDpr: { value: 1 },
          uFace: { value: new THREE.Color() }, uRing: { value: new THREE.Color() }, uInk: { value: new THREE.Color() },
        },
        vertexShader: /* glsl */ `
          attribute vec3 scatter; attribute float seed;
          uniform float uForm, uTime, uSize, uDpr;
          void main() {
            float t = smoothstep(seed * 0.5, seed * 0.5 + 0.5, uForm);
            vec3 p = mix(scatter, position, t);
            p += (1.0 - t * 0.85) * 0.03 * vec3(sin(uTime * 1.3 + seed * 40.0), cos(uTime * 1.1 + seed * 30.0), 0.0);
            p.z += seed * 0.04;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * uDpr * (0.65 + seed * 0.7);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uFace, uRing, uInk; uniform float uSolid;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float ring = smoothstep(0.34, 0.39, d);
            gl_FragColor = vec4(mix(mix(uFace, uRing, ring), uInk, uSolid), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useEffect(() => {
    mat.uniforms.uFace.value.set(beads.face);
    mat.uniforms.uRing.value.set(beads.ring);
    mat.uniforms.uInk.value.set(ink);
  }, [mat, beads.face, beads.ring, ink]);
  const born = useRef(performance.now());
  useFrame(({ clock, gl }) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const age = (performance.now() - born.current) / 2200;
    mat.uniforms.uForm.value = reduced ? 1 : Math.min(1, age);
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uDpr.value = gl.getPixelRatio();
    mat.uniforms.uSolid.value = THREE.MathUtils.smoothstep(prog(), 0.35, 0.85);
    mat.uniforms.uSize.value = THREE.MathUtils.lerp(Math.max(7, px.width / 150), 2.8, prog());
  });
  return (
    <group ref={ref}>
      <points geometry={points} material={mat} />
    </group>
  );
}

export function Name({ beads, ink }: { beads: Beads; ink: string }) {
  return (
    <Canvas className="name3d" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 }} dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 12] }} gl={{ alpha: true, antialias: true }} aria-hidden>
      <Particles beads={beads} ink={ink} />
    </Canvas>
  );
}
