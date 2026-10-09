/**
 * The site: a 3D name over a dusk backdrop that zooms out into the header, then a short readable page:
 * intro, a gallery of work (hover a tile to open it), a few facts, and big contact buttons.
 * The header nav scrolls to each section and marks the one you're in. Normal scrolling throughout.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Name } from './intro/Name';
import { Dusk } from './intro/Dusk';
import { EMAIL, PROJECTS } from './content';
import photonLogo from './assets/photon.png';
import studioLogo from './assets/studioapp.png';

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/** Tooey first; it carries a "Building now" badge. `kind` is the small label on each cover. */
const WORK: { id: string; kind: string }[] = [
  { id: 'tooey', kind: 'Restaurant forecasting' },
  { id: 'factory', kind: 'Agent workflow' },
  { id: 'frontdesk', kind: 'Dental office AI' },
  { id: 'fetch', kind: 'Mac app' },
  { id: 'bruindesk', kind: 'UCLA dashboard' },
  { id: 'animus', kind: '3D AI character' },
  { id: 'catcart', kind: 'iOS game' },
];

/** Each fact gets a small drawn badge until real photos arrive. */
const FACTS: { k: string; v: string; tint: string; art: ReactNode }[] = [
  {
    k: 'Baseball',
    v: 'I volunteer as an umpire for Tri-Valley youth baseball.',
    tint: '#d6453a',
    art: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M6.2 5.6c2.4 2.6 2.4 10.2 0 12.8M17.8 5.6c-2.4 2.6-2.4 10.2 0 12.8" />
        <path d="M7.4 8.2h1.6M7.9 11.2h1.7M7.4 14.4h1.6M15 8.2h1.6M14.4 11.2h1.7M15 14.4h1.6" />
      </>
    ),
  },
  {
    k: 'Skiing',
    v: "Tahoe every winter. I'm pretty good.",
    tint: '#3a78d6',
    art: (
      <>
        <path d="m2.5 20 7-12 4 6.5 2.5-3.5 5.5 9z" />
        <path d="m7 12.3 1.4 1.2 1.6-1.6 1.4 1.4" />
        <circle cx="18" cy="5" r="1.6" />
      </>
    ),
  },
  {
    k: 'Pickleball',
    v: 'Just for fun.',
    tint: '#2f9e6a',
    art: (
      <>
        <path d="M15 3.2a5.4 5.4 0 0 1 5.8 5.8l-.4.9-6.6 6.6a2.6 2.6 0 0 1-3.7 0l-2.6-2.6a2.6 2.6 0 0 1 0-3.7L14.1 3.6z" />
        <path d="m8.6 15.4-5.1 5.1" />
        <circle cx="5.2" cy="5.6" r="2.2" />
      </>
    ),
  },
  {
    k: 'Food',
    v: 'Korean BBQ with friends is the usual LA plan.',
    tint: '#e0702e',
    art: (
      <>
        <circle cx="12" cy="14.5" r="7" />
        <path d="M6.3 12h11.4M5 14.5h14M6.3 17h11.4" />
        <path d="M9 2.8c-1 1.2 1 1.9 0 3.2M15 2.8c-1 1.2 1 1.9 0 3.2" />
      </>
    ),
  },
  {
    k: 'Travel',
    v: 'Peru, Japan, China, Spain, Mexico, Alaska.',
    tint: '#1f9aa3',
    art: (
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    ),
  },
  {
    k: 'Pets',
    v: 'Rusty the dog, Petey and Jasper the cats.',
    tint: '#c98a2b',
    art: (
      <>
        <circle cx="5.5" cy="10" r="1.9" />
        <circle cx="9.5" cy="5.8" r="1.9" />
        <circle cx="14.5" cy="5.8" r="1.9" />
        <circle cx="18.5" cy="10" r="1.9" />
        <path d="M12 11.5c-3 0-5.6 3.6-5.6 5.8 0 1.5 1.2 2.6 2.8 2.6 1.2 0 1.8-.6 2.8-.6s1.6.6 2.8.6c1.6 0 2.8-1.1 2.8-2.6 0-2.2-2.6-5.8-5.6-5.8z" />
      </>
    ),
  },
];

const ICON: Record<string, ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="fill">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="fill">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="line">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4M10 13h4M10 17h4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="line">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};

/** The docked name takes the theme's ink, so it reads on either background. */
function useInk() {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue('--name').trim() || '#171a26';
  const [c, setC] = useState(read);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const up = () => setC(read());
    mq.addEventListener('change', up);
    const mo = new MutationObserver(up);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mq.removeEventListener('change', up);
      mo.disconnect();
    };
  }, []);
  return c;
}

/** Which section is under the header; also publishes the opening's progress as --intro for the CSS. */
function useActive() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const on = () => {
      let cur: string | null = null;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = n.id;
      }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = NAV[NAV.length - 1].id;
      setActive(cur);
      document.documentElement.style.setProperty('--intro', String(Math.min(1, scrollY / (innerHeight * 0.85))));
    };
    on();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => {
      removeEventListener('scroll', on);
      removeEventListener('resize', on);
    };
  }, []);
  return active;
}

/** Sections below the fold ease in once as they arrive; anything already on screen just shows. */
function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...document.querySelectorAll<HTMLElement>('.reveal')].filter((el) => el.getBoundingClientRect().top > innerHeight);
    els.forEach((el) => el.classList.add('pre'));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove('pre');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Drawn tile for the Software Factory: plan, queue, agents, review, with work moving through. */
function FactoryArt() {
  const nodes = [
    { x: 30, y: 40, label: 'Plan' },
    { x: 150, y: 40, label: 'Queue' },
    { x: 270, y: 40, label: 'Agents' },
    { x: 150, y: 120, label: 'Critic' },
    { x: 270, y: 120, label: 'Console' },
  ];
  return (
    <svg className="factory" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path className="wire" d="M130 60h20M250 60h20M320 80v40M250 140h20" />
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x} y={n.y} width="100" height="40" rx="10" />
          <text x={n.x + 50} y={n.y + 25}>
            {n.label}
          </text>
        </g>
      ))}
      <circle className="job" r="4">
        <animateMotion dur="3.2s" repeatCount="indefinite" path="M80 60H320V140H200" />
      </circle>
    </svg>
  );
}

function Gallery() {
  // Mouse: hover lifts and grows a tile (CSS). Touch and keyboard: tap or Enter opens it.
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="gallery">
      {WORK.map(({ id, kind }) => {
        const p = PROJECTS[id];
        return (
          <li key={id}>
            <button
              type="button"
              className="tile"
              data-tall={p.tall || undefined}
              data-open={open === id || undefined}
              aria-expanded={open === id}
              aria-label={`${p.title}: ${p.line}`}
              style={{ '--tint': p.tint } as React.CSSProperties}
              onClick={() => setOpen(open === id ? null : id)}
            >
              {p.img ? <img src={p.img} alt="" /> : <FactoryArt />}
              <span className="cover" aria-hidden="true">
                <span className="kind">{kind}</span>
                <span className="foot">
                  {id === 'tooey' && <span className="badge">Building now</span>}
                  <span className="name">{p.title}</span>
                </span>
              </span>
              <span className="cap" aria-hidden="true">
                <span className="t">{p.title}</span>
                <span className="l">{p.line}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="contact">
      <a className="big" href="https://www.linkedin.com/in/rexchao1/" target="_blank" rel="noreferrer" data-brand="linkedin">
        {ICON.linkedin}
        LinkedIn
      </a>
      <a className="big" href="https://github.com/rexchao1" target="_blank" rel="noreferrer" data-brand="github">
        {ICON.github}
        GitHub
      </a>
      <span className="big off" aria-disabled="true">
        {ICON.resume}
        Resume <small>soon</small>
      </span>
      <button
        type="button"
        className="big mail"
        onClick={(e) => {
          const addr = e.currentTarget.querySelector('.addr')!;
          const sel = () => getSelection()?.selectAllChildren(addr);
          if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(() => setCopied(true), sel);
          else sel();
        }}
      >
        {ICON.mail}
        <span className="addr">{EMAIL}</span>
        <small>{copied ? 'Copied' : 'Copy'}</small>
      </button>
    </div>
  );
}

export function Page() {
  const ink = useInk();
  const active = useActive();
  useReveal();

  return (
    <>
      <header className="bar">
        <div className="inner">
          <a className="slot" href="#top" aria-label="Rex Chao, back to top">
            <span className="sr">Rex Chao</span>
          </a>
          <nav aria-label="Sections">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Name from="#f6efe4" to={ink} />

      <section className="hero" id="top" aria-label="Rex Chao">
        <Dusk />
        <h1 className="sr">Rex Chao</h1>
        <p className="tag">Computer science at UCLA. I build small, useful software.</p>
        <p className="hint" aria-hidden>
          Scroll
        </p>
      </section>

      <main>
        <section className="col intro reveal">
          <p>
            I study computer science at UCLA. I grew up in Danville, in the Bay Area, and moved to LA for school.
          </p>
          <p>
            Right now I'm building <a href="#work">Tooey</a> with a cofounder and interning at StudioApp.ai. I like making software for
            real people with real problems: a dental office's front desk, a restaurant's prep list, my own class schedule.
          </p>
        </section>

        <section id="work" className="wide reveal">
          <h2>Work</h2>
          <Gallery />
          <div className="team">
            <p>Can I work on a team? Ask them.</p>
            <div className="logos">
              <div className="logo">
                <img src={photonLogo} alt="" data-wide />
                <span>
                  Photon Commerce<small>Intern</small>
                </span>
              </div>
              <div className="logo">
                <img src={studioLogo} alt="" />
                <span>
                  StudioApp.ai<small>Intern, now</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="col reveal">
          <h2>Outside of code</h2>
          <dl className="facts">
            {FACTS.map((f) => (
              <div key={f.k} style={{ '--tint': f.tint } as React.CSSProperties}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="art">
                  {f.art}
                </svg>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="contact" className="col reveal">
          <h2>Say hi</h2>
          <Contact />
        </section>

        <footer className="col">© 2026 Rex Chao</footer>
      </main>

    </>
  );
}
