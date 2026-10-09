/**
 * The site: a 3D name over a dusk backdrop that zooms out into the header, then a short readable page:
 * intro, a gallery of work (hover a tile to open it), a few facts, and big contact buttons.
 * The header nav scrolls to each section and marks the one you're in. Normal scrolling throughout.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Name, type Look } from './intro/Name';
import { Dusk } from './intro/Dusk';
import { EMAIL, PROJECTS } from './content';
import photonLogo from './assets/photon.png';
import studioLogo from './assets/studioapp.png';

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/** Two rows; Tooey leads the first and starts wider. */
const ROWS = [
  ['tooey', 'frontdesk', 'fetch', 'bruindesk'],
  ['animus', 'posear', 'catcart', 'laoshu'],
];

const FACTS: [string, string][] = [
  ['Baseball', 'I volunteer as an umpire for Tri-Valley youth baseball.'],
  ['Skiing', "Tahoe every winter. I'm pretty good."],
  ['Pickleball', 'Just for fun.'],
  ['Food', 'Korean BBQ with friends is the usual LA plan.'],
  ['Travel', 'Peru, Japan, China, Spain, Mexico, Alaska.'],
  ['Pets', 'Rusty the dog, Petey and Jasper the cats.'],
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

function Gallery() {
  // Mouse: hover opens a tile (CSS). Touch and keyboard: tap or Enter opens it.
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="gallery">
      {ROWS.map((row, i) => (
        <div className="row" key={i}>
          {row.map((id) => {
            const p = PROJECTS[id];
            return (
              <button
                key={id}
                type="button"
                className="tile"
                data-lead={id === 'tooey' || undefined}
                data-tall={p.tall || undefined}
                data-open={open === id || undefined}
                aria-expanded={open === id}
                style={{ '--tint': p.tint } as React.CSSProperties}
                onClick={() => setOpen(open === id ? null : id)}
              >
                {p.img ? <img src={p.img} alt="" /> : <span className="ph">Screenshot soon</span>}
                <span className="cap">
                  <span className="t">
                    {p.title}
                    {p.tag && <small>{p.tag}</small>}
                  </span>
                  <span className="l">{p.line}</span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
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
  const [look, setLook] = useState<Look>(() => (location.hash === '#particles' ? 'particles' : 'solid'));
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

      <Name look={look} from="#f6efe4" to={ink} />

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
          <p className="team">
            <span>Can I work on a team? Ask them.</span>
            <span className="logos">
              <span className="logo">
                <img src={photonLogo} alt="" />
                Photon Commerce
              </span>
              <span className="logo">
                <img src={studioLogo} alt="" />
                StudioApp.ai
              </span>
            </span>
          </p>
        </section>

        <section id="about" className="col reveal">
          <h2>Outside of code</h2>
          <dl className="facts">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
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

      <div className="looks" role="group" aria-label="Prototype: name look">
        <span>Name</span>
        {(['solid', 'particles'] as Look[]).map((l) => (
          <button key={l} type="button" aria-pressed={look === l} onClick={() => setLook(l)}>
            {l === 'solid' ? 'Solid' : 'Particles'}
          </button>
        ))}
      </div>
    </>
  );
}
