/**
 * Page HTML pinned to points in the 3D world. A 3D <Anchor id> marks the point; a DOM element registered with
 * `pin(id)` follows it. One `Pinner` inside the canvas projects every anchor each frame (no per-label React roots).
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const anchors = new Map<string, THREE.Object3D>();
const els = new Map<string, HTMLElement>();
/** Anchors that ask to be hidden (e.g. a world behind Tooey). */
export const hiddenAnchors = new Set<string>();

export function Anchor({ id, position }: { id: string; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    anchors.set(id, g);
    return () => {
      if (anchors.get(id) === g) anchors.delete(id);
    };
  }, [id]);
  return <group ref={ref} position={position} />;
}

/** Ref callback for the DOM element that follows anchor `id`. */
export function pin(id: string) {
  return (el: HTMLElement | null) => {
    if (el) els.set(id, el);
    else els.delete(id);
  };
}

export function Pinner() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const [id, el] of els) {
      const a = anchors.get(id);
      if (!a) continue;
      a.getWorldPosition(v).project(camera);
      const off = v.z > 1 || Math.abs(v.x) > 1.3 || Math.abs(v.y) > 1.3 || hiddenAnchors.has(id);
      el.style.visibility = off ? 'hidden' : '';
      if (off) continue;
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });
  return null;
}
