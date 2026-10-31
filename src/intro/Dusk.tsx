/**
 * The opening's backdrop: LA at dusk. A field of fine dots over a dark sky with a sunset glow along the bottom.
 * A slow swell runs through the dots, and the ones near the pointer brighten and warm up.
 */
import { useEffect, useRef } from 'react';

const GAP = 22;

/** `light`: faint ink dots for a light sky, warming to orange near the pointer. */
export function Dusk({ light = false }: { light?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const ptr = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ptr.tx = e.clientX - r.left;
      ptr.ty = e.clientY - r.top;
    };
    const draw = (t: number) => {
      ptr.x += (ptr.tx - ptr.x) * 0.12;
      ptr.y += (ptr.ty - ptr.y) * 0.12;
      ctx.clearRect(0, 0, w, h);
      const s = t / 1000;
      for (let y = GAP / 2; y < h; y += GAP) {
        const low = y / h; // dots warm toward the horizon
        for (let x = GAP / 2; x < w; x += GAP) {
          const swell = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.018 - s * 0.9);
          const d = Math.hypot(x - ptr.x, y - ptr.y);
          const near = Math.max(0, 1 - d / 170);
          const r = 0.7 + swell * 0.5 + near * 1.8;
          const a = 0.1 + swell * 0.12 + low * 0.12 + near * 0.6;
          const warm = Math.min(1, low * 0.7 + near);
          ctx.fillStyle = light
            ? `rgba(${22 + 233 * near | 0},${19 + 103 * near | 0},${28 + 41 * near | 0},${0.06 + swell * 0.08 + near * 0.55})`
            : `rgba(${170 + 85 * warm | 0},${180 + 2 * warm | 0},${255 - 140 * warm | 0},${a})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    size();
    io.observe(cv);
    addEventListener('resize', size);
    addEventListener('pointermove', move);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener('resize', size);
      removeEventListener('pointermove', move);
    };
  }, [light]);
  return <canvas ref={ref} className="dusk" aria-hidden />;
}
