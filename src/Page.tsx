/**
 * The site: a 3D name that zooms out into the header, then one readable column of text.
 * The header nav scrolls to each section and marks the one you're in. Normal scrolling throughout.
 */
import { useEffect, useState } from 'react';
import { Name, type Look } from './intro/Name';
import { EMAIL, PROJECTS } from './content';

const NAV = [
  { id: 'tooey', label: 'Tooey' },
  { id: 'builds', label: 'Builds' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const BUILDS = ['frontdesk', 'fetch', 'bruindesk', 'animus', 'posear', 'catcart', 'laoshu'].map((id) => PROJECTS[id]);

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rexchao1/' },
  { label: 'GitHub', href: 'https://github.com/rexchao1' },
];

/** The name's color comes from the theme so it reads on either background. */
function useNameColor() {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue('--name').trim() || '#1b3fa0';
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

/** Which section is under the header. */
function useActive() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const on = () => {
      let cur: string | null = null;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = n.id;
      }
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

function CopyEmail() {
  const [done, setDone] = useState(false);
  return (
    <span className="email">
      <span className="addr">{EMAIL}</span>
      <button
        type="button"
        onClick={(e) => {
          const sel = () => getSelection()?.selectAllChildren(e.currentTarget.previousElementSibling!);
          navigator.clipboard?.writeText(EMAIL).then(() => setDone(true), sel) ?? sel();
        }}
      >
        {done ? 'Copied' : 'Copy'}
      </button>
    </span>
  );
}

export function Page() {
  const [look, setLook] = useState<Look>(() => (location.hash === '#particles' ? 'particles' : 'solid'));
  const color = useNameColor();
  const active = useActive();
  useReveal();
  const tooey = PROJECTS.tooey;

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

      <Name look={look} color={color} />

      <section className="hero" id="top" aria-label="Rex Chao">
        <h1 className="sr">Rex Chao</h1>
        <p className="tag">Computer science at UCLA. I build small, useful software.</p>
        <p className="hint" aria-hidden>
          Scroll
        </p>
      </section>

      <main className="col">
        <section className="intro reveal">
          <p>
            I study <b>computer science</b> at <b>UCLA</b>. I grew up in Danville, in the Bay Area, and moved to LA for school.
          </p>
          <p>
            Right now I'm building <a href="#tooey">Tooey</a> with a cofounder and interning at <b>StudioApp.ai</b>. Before that I interned at <b>Photon Commerce</b>.
          </p>
          <p>I like making software for real people with real problems: a dental office's front desk, a restaurant's prep list, my own class schedule.</p>
          <p className="links">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
            <span className="soon">Resume (soon)</span>
          </p>
        </section>

        <section id="tooey" className="reveal">
          <h2>
            Tooey <small>{tooey.tag}</small>
          </h2>
          <p>{tooey.line}</p>
          <img className="shot" src={tooey.img} alt="Tooey's prep list for tomorrow" />
        </section>

        <section id="builds" className="reveal">
          <h2>Builds</h2>
          <ul className="builds">
            {BUILDS.map((b) => (
              <li key={b.id}>
                <div className="text">
                  <h3>{b.title}</h3>
                  <p>{b.line}</p>
                </div>
                {b.img ? <img src={b.img} alt="" loading="lazy" /> : <span className="noimg">Screenshot soon</span>}
              </li>
            ))}
          </ul>
          <p className="team">
            Can I work on a team? Ask <b>Photon Commerce</b> and <b>StudioApp.ai</b>.
          </p>
        </section>

        <section id="about" className="reveal">
          <h2>About</h2>
          <p>I volunteer as an umpire for Tri-Valley youth baseball. In the winter I ski at Tahoe, and I'm pretty good. Pickleball is just for fun.</p>
          <p>In LA, Korean BBQ with friends is the usual plan. I've been to Peru, Japan, China, Spain, Mexico and Alaska.</p>
          <p>At home there's Rusty, a dog, and two cats, Petey and Jasper.</p>
        </section>

        <section id="contact" className="reveal">
          <h2>Say hi</h2>
          <p>The fastest way to reach me is email.</p>
          <p className="links">
            <CopyEmail />
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </p>
        </section>

        <footer>© 2026 Rex Chao</footer>
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
