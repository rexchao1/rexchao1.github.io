/**
 * The site: a 3D name over a dusk backdrop that zooms out into the header, then a short readable page:
 * intro, the work (cards that open a popup with a demo), a few facts, and big contact buttons.
 * The header nav scrolls to each section and marks the one you're in. Normal scrolling throughout.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Name } from './intro/Name';
import { Dusk } from './intro/Dusk';
import { EMAIL } from './content';
import { ICON } from './icons';
import { Work } from './Work';
import photonLogo from './assets/photon.png';
import studioLogo from './assets/studioapp.png';

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/** Each fact gets a small drawn badge until real photos arrive. */
const FACTS: { k: string; v: string; tint: string; art: ReactNode }[] = [
  {
    k: 'Baseball',
    v: 'Played my whole life, through varsity. Now I umpire Little League.',
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
    v: 'Tahoe every winter.',
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
    v: 'Peru, Japan, China, Spain, Mexico.',
    tint: '#1f9aa3',
    art: (
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    ),
  },
  {
    k: 'Playing with my pets',
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

/** Light or dark, following the system (or a data-theme override), and the theme's ink for the docked name. */
function useTheme() {
  const read = () => ({
    ink: getComputedStyle(document.documentElement).getPropertyValue('--name').trim() || '#171a26',
    dark: getComputedStyle(document.documentElement).colorScheme === 'dark',
  });
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
      <a className="big" href={`${import.meta.env.BASE_URL}Rex_Chao.pdf`} target="_blank" rel="noreferrer">
        {ICON.resume}
        Resume
      </a>
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
  const { ink, dark } = useTheme();
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

      <Name beads={dark ? { face: '#8fd0ff', ring: '#ffffff' } : { face: '#ffffff', ring: '#16131c' }} ink={ink} />

      <section className="hero" id="top" aria-label="Rex Chao">
        <Dusk light={!dark} />
        <h1 className="sr">Rex Chao</h1>
        <p className="tag">Computer science at UCLA.</p>
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
          <Work />
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
                  StudioApp.ai<small>Intern</small>
                </span>
                <em className="now">Current</em>
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
