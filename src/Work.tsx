/**
 * The Work section: a featured Tooey card and a grid of project cards. Each card's preview plays a short
 * guided demo on hover (the screenshot zooms toward each feature with a label). Clicking a card opens a
 * big popup with the full demo, the story, the stack and links. Arrow keys move between projects.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { WORK, type Project, type Slide } from './content';
import { ICON } from './icons';

const STEP_MS = 3400;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Each slide opens on an overview, then visits its notes in order. */
function stepsOf(p: Project) {
  return p.slides.flatMap((s, si) => [{ si, ni: -1 }, ...s.notes.map((_, ni) => ({ si, ni }))]);
}

/** `children` is the image layer and its notes; notes sit in `.marks` over the image so labels can spill past it. */
function Frame({ slide, children }: { slide: Slide; children: React.ReactNode }) {
  return (
    <div className="frame" data-frame={slide.frame} style={{ '--ar': slide.ar } as CSSProperties}>
      {slide.frame === 'browser' && (
        <div className="chrome" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{slide.url}</span>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * The guided demo. `compact` is the card preview: no controls, plays only while `playing`.
 * The full version autoplays (unless reduced motion), with a progress bar and play/pause.
 */
function Demo({ p, compact, playing: playingProp }: { p: Project; compact?: boolean; playing?: boolean }) {
  const steps = stepsOf(p);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(() => !compact && reduced());
  const playing = compact ? !!playingProp : !paused;

  useEffect(() => {
    if (compact && !playingProp) setI(0);
  }, [compact, playingProp]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((n) => (n + 1) % steps.length), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  const { si, ni } = steps[i] ?? steps[0];
  const zoom = compact ? 1.25 : 1.3;
  const still = reduced();

  return (
    <div className="demo" data-compact={compact || undefined}>
      <div className="stage" style={{ '--tint': p.tint } as CSSProperties}>
        {p.slides.map((s, k) => {
          const note = k === si && ni >= 0 ? s.notes[ni] : null;
          const shown = k === si;
          return (
            <div className="slide" key={k} data-on={shown || undefined} aria-hidden={!shown}>
              <Frame slide={s}>
                <div className="view">
                  <div
                    className="zoom"
                    style={{
                      // Scale about the note's point, written as translate + scale so moving between notes pans smoothly.
                      transform:
                        note && !still
                          ? `translate(${note.x * (1 - zoom) * 100}%, ${note.y * (1 - zoom) * 100}%) scale(${zoom})`
                          : 'none',
                    }}
                  >
                    <img src={s.img} alt={k === 0 || !compact ? s.alt : ''} loading={compact && k > 0 ? 'lazy' : undefined} draggable={false} />
                  </div>
                </div>
                <div className="marks">
                  {s.notes.map((n, nk) => (
                    <span
                      key={nk}
                      className="note"
                      data-on={(shown && nk === ni) || undefined}
                      data-side={n.x > 0.66 ? 'r' : n.x < 0.34 ? 'l' : 'c'}
                      data-up={n.y > 0.62 || undefined}
                      style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
                    >
                      <b aria-hidden="true" />
                      <em>{n.text}</em>
                    </span>
                  ))}
                </div>
              </Frame>
            </div>
          );
        })}
        {compact && (
          <span className="caption" data-on={(playingProp && ni >= 0) || undefined} aria-hidden="true">
            {ni >= 0 ? p.slides[si].notes[ni].text : ''}
          </span>
        )}
      </div>
      {!compact && (
        <div className="controls">
          <button type="button" className="ctl" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play demo' : 'Pause demo'}>
            {paused ? ICON.play : ICON.pause}
          </button>
          <div className="segs">
            {steps.map((s, k) => (
              <button
                type="button"
                key={k}
                className="seg"
                data-done={k < i || undefined}
                data-on={k === i || undefined}
                data-paused={paused || undefined}
                style={{ '--ms': `${STEP_MS}ms` } as CSSProperties}
                aria-label={s.ni < 0 ? `Screen ${s.si + 1} overview` : p.slides[s.si].notes[s.ni].text}
                aria-current={k === i ? 'step' : undefined}
                onClick={() => setI(k)}
              >
                <i key={k === i ? `on-${i}` : 'off'} />
              </button>
            ))}
          </div>
          <span className="count">
            {si + 1}/{p.slides.length}
          </span>
        </div>
      )}
    </div>
  );
}

function Card({ p, featured, onOpen }: { p: Project; featured?: boolean; onOpen: () => void }) {
  const [hot, setHot] = useState(false);
  return (
    <button
      type="button"
      className="card"
      data-featured={featured || undefined}
      style={{ '--tint': p.tint } as CSSProperties}
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHot(true)}
      onPointerLeave={() => setHot(false)}
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHot(true)}
      onBlur={() => setHot(false)}
      aria-haspopup="dialog"
    >
      <Demo p={p} compact playing={hot} />
      <span className="body">
        <span className="kind">
          {p.kind}
          {featured && <span className="badge">Building now</span>}
        </span>
        <span className="name">{p.title}</span>
        <span className="line">{p.line}</span>
        {featured && p.role && <span className="role">{p.role}</span>}
        <span className="more">
          {featured ? 'See the demo' : 'Open'} {ICON.arrow}
        </span>
      </span>
    </button>
  );
}

function ProjectDialog({ index, onClose, onGo }: { index: number; onClose: () => void; onGo: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const p = WORK[index];
  const go = (d: number) => onGo((index + d + WORK.length) % WORK.length);

  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    ref.current?.querySelector('.sheet')?.scrollTo(0, 0);
  }, [index]);

  return (
    <dialog
      ref={ref}
      className="project"
      aria-labelledby="project-title"
      style={{ '--tint': p.tint } as CSSProperties}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current!.close()}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest('.segs')) return;
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div className="sheet">
        <div className="top">
          <span className="where">
            {p.kind}
            <small>
              {index + 1} of {WORK.length}
            </small>
          </span>
          <button type="button" className="ctl" onClick={() => go(-1)} aria-label={`Previous: ${WORK[(index - 1 + WORK.length) % WORK.length].title}`}>
            {ICON.prev}
          </button>
          <button type="button" className="ctl" onClick={() => go(1)} aria-label={`Next: ${WORK[(index + 1) % WORK.length].title}`}>
            {ICON.next}
          </button>
          <button type="button" className="ctl" onClick={() => ref.current!.close()} aria-label="Close" autoFocus>
            {ICON.close}
          </button>
        </div>

        <Demo key={p.id} p={p} />

        <div className="info">
          <div className="story">
            <h2 id="project-title">{p.title}</h2>
            {p.role && <p className="role">{p.role}</p>}
            {p.about.map((t, k) => (
              <p key={k}>{t}</p>
            ))}
          </div>
          <aside>
            {p.links.length > 0 && (
              <div className="links">
                {p.links.map((l) => (
                  <a key={l.href} className="btn" data-icon={l.icon} href={l.href} target="_blank" rel="noreferrer">
                    {ICON[l.icon]}
                    {l.label}
                  </a>
                ))}
              </div>
            )}
            {p.closed && (
              <p className="closed">
                {ICON.lock}
                {p.closed}
              </p>
            )}
            {p.stack && (
              <div>
                <h3>Built with</h3>
                <ul className="stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </dialog>
  );
}

export function Work() {
  const [open, setOpen] = useState<number | null>(null);
  const last = useRef<number>(0);
  const [featured, ...rest] = WORK;

  const close = () => {
    setOpen(null);
    // Return focus to the card the popup came from.
    requestAnimationFrame(() => document.querySelectorAll<HTMLElement>('.card')[last.current]?.focus());
  };
  const show = (i: number) => {
    last.current = i;
    setOpen(i);
  };

  return (
    <>
      <div className="cards">
        <Card p={featured} featured onOpen={() => show(0)} />
        {rest.map((p, k) => (
          <Card key={p.id} p={p} onOpen={() => show(k + 1)} />
        ))}
      </div>
      {open !== null && <ProjectDialog index={open} onClose={close} onGo={show} />}
    </>
  );
}
