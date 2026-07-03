const earlier = [
  {
    year: "2024",
    name: "GAN Dog Generator",
    desc: "Trained a GAN to generate dog images; lives on as a Discord bot",
    href: "https://github.com/rexchao1/husky_bot",
  },
  {
    year: "2024",
    name: "Illuminatey",
    desc: "Unity PC game about sustainability, built with friends",
    href: "https://github.com/Aldicodi/Iluminatey",
  },
  {
    year: "2025",
    name: "VR Maze",
    desc: "Unity VR game with custom physics and controls",
    href: null,
  },
  {
    year: "2022",
    name: "Chess",
    desc: "Two-player chess written in Python Turtle",
    href: "https://github.com/rexchao1/Chess",
  },
];

const experience = [
  {
    when: "Summer 2026",
    role: "AI Intern — Photon Commerce",
    detail:
      "Document-extraction pipelines, hands-on QA of their ChatGPT app, and distribution research across 30+ platforms.",
  },
  {
    when: "2026 — present",
    role: "Builder — Minnie & Hermes",
    detail:
      "Designing and running AI agents that handle real administrative work for a dental practice and my family.",
  },
  {
    when: "Summer 2025",
    role: "Dental Shadow — Renu Prosthodontics",
    detail:
      "Observed implant surgeries and treatment planning; learned the clinic workflow Minnie now automates.",
  },
  {
    when: "2024 — 2025",
    role: "Math Tutor — Independent",
    detail:
      "Weekly one-on-one algebra through precalculus, with lesson plans built per student.",
  },
  {
    when: "2022 — 2025",
    role: "Baseball Instructor & Umpire — Tri-Valley",
    detail:
      "Coached hitting and fielding for 12–14s; umpired league games and trained new umpires.",
  },
  {
    when: "2022 — 2024",
    role: "Volunteer Lab Instructor — Lawrence Hall of Science",
    detail:
      "Ran lab activities for kids 7–13 across engineering, animal science, and astronomy.",
  },
];

export default function Home() {
  return (
    <>
      <header className="top r1">
        <div className="top-inner">
          <a className="wordmark" href="#top">
            Rex Chao
          </a>
          <nav className="top-nav">
            <a href="#minnie">Minnie</a>
            <a href="#hermes">Hermes</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="shell hero">
          <p className="hero-eyebrow label r1">
            Rex Chao — UCLA '29 · Los Angeles
          </p>
          <h1 className="r2">
            I build AI agents that do <span className="accent">real work</span>
            .
          </h1>
          <div className="hero-cta r3">
            <a href="#minnie">See the work ↓</a>
          </div>
          <div className="hero-meta r4">
            <dl>
              <div>
                <dt>Currently</dt>
                <dd>AI intern at Photon Commerce</dd>
              </div>
              <div>
                <dt>Building</dt>
                <dd>Minnie, an AI front desk for a dental practice</dd>
              </div>
              <div>
                <dt>Studying</dt>
                <dd>UCLA, class of 2029</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="dark" id="minnie">
          <div className="shell">
            <div className="sec-head">
              <span className="index">01</span>
              <span className="label">Flagship — in production testing</span>
            </div>
            <div className="minnie-grid">
              <div className="minnie-copy">
                <h2>Minnie, an AI front desk for a real dental practice.</h2>
                <p className="lede">
                  Insurance work eats front-desk hours: dial the payer, wait on
                  hold, log into portals, copy numbers into the chart. Minnie
                  does the tedious half and hands the judgment calls to staff.
                  Local-first, so patient data never leaves the practice.
                </p>
                <div className="minnie-sub">
                  <h3>Insurance calling</h3>
                  <p>
                    Auto-dials dental insurance payers, navigates the phone
                    tree, waits on hold — and rings staff the moment a live
                    representative picks up.
                  </p>
                  <p className="stack">
                    Python / Twilio / audio detection / local LLM
                  </p>
                </div>
                <div className="minnie-sub">
                  <h3>Payer portals</h3>
                  <p>
                    Runs eligibility checks across Delta Dental, MetLife,
                    Cigna, and Ameritas portals with a pluggable adapter per
                    payer. Every result is a draft a human approves.
                  </p>
                  <p className="stack">
                    Python / Playwright / browser automation
                  </p>
                </div>
              </div>
              <div className="minnie-media">
                <figure className="shot">
                  <img
                    src="/minnie-eligibility.png"
                    alt="Minnie's eligibility result sheet for a Delta Dental check: identifiers, plan status, and a full benefits table"
                    width={1618}
                    height={931}
                  />
                  <figcaption>
                    A finished portal check — 32 seconds from request to
                    benefits table
                  </figcaption>
                </figure>
                <figure className="shot pull-left">
                  <img
                    src="/minnie-calls.png"
                    alt="Minnie's insurance call console: reason for calling, patient fields, and a finished-calls panel"
                    width={934}
                    height={632}
                  />
                  <figcaption>
                    The call console — Minnie waits on hold so staff don't
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section className="shell hermes" id="hermes">
          <div className="sec-head">
            <span className="index">02</span>
            <span className="label">Personal infrastructure</span>
          </div>
          <div className="hermes-grid">
            <div className="hermes-intro">
              <h2>Hermes runs my family's life.</h2>
              <p>
                A solo-built autonomous agent framework that manages our
                calendar, events, and daily tasks. It started as a way to stop
                being the family secretary and turned into the foundation
                Minnie is built on.
              </p>
            </div>
            <dl className="hermes-list">
              <div className="hermes-row">
                <dt>Orchestration</dt>
                <dd>
                  Runs sub-agents in parallel or delegates tasks one at a time
                </dd>
              </div>
              <div className="hermes-row">
                <dt>Tools</dt>
                <dd>
                  Terminal, web, filesystem, and APIs — GitHub, Google, Apple
                </dd>
              </div>
              <div className="hermes-row">
                <dt>Skills</dt>
                <dd>
                  Modular procedures it can ingest and deploy on the fly
                </dd>
              </div>
              <div className="hermes-row">
                <dt>Memory</dt>
                <dd>
                  Remembers preferences and household facts across sessions
                </dd>
              </div>
              <div className="hermes-row">
                <dt>Autonomy</dt>
                <dd>
                  Schedules background work and reports back over Telegram
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="shell earlier">
          <div className="sec-head">
            <span className="index">03</span>
            <span className="label">Earlier work</span>
          </div>
          {earlier.map((p) => (
            <div className="earlier-row" key={p.name}>
              <span className="year">{p.year}</span>
              <span className="name">{p.name}</span>
              <span className="desc">{p.desc}</span>
              {p.href ? (
                <a
                  className="goto"
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              ) : (
                <span />
              )}
            </div>
          ))}
        </section>

        <section className="shell xp" id="experience">
          <div className="sec-head">
            <span className="index">04</span>
            <span className="label">Experience</span>
          </div>
          <div className="xp-grid">
            <div className="xp-rows">
              {experience.map((x) => (
                <div className="xp-row" key={x.role}>
                  <span className="when">{x.when}</span>
                  <div>
                    <strong>{x.role}</strong>
                    <span>{x.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shell beyond">
          <div className="sec-head">
            <span className="index">05</span>
            <span className="label">Beyond the desk</span>
          </div>
          <div className="beyond-cols">
            <div className="beyond-col">
              <span className="label">Baseball</span>
              <h3>Years on the diamond</h3>
              <p>
                Grew up playing, then stayed — coaching hitting and fielding
                for the Tri-Valley Tigers and umpiring league games. Yes, I've
                heard every complaint about the strike zone.
              </p>
            </div>
            <div className="beyond-col">
              <span className="label">Powerlifting</span>
              <h3>NorCal, 1st place</h3>
              <p>
                First place and the Outstanding Achievement award at NorCal
                Powerlifting. Progressive overload is a good mental model for
                most things.
              </p>
            </div>
            <div className="beyond-col">
              <span className="label">Teaching</span>
              <h3>Labs &amp; lessons</h3>
              <p>
                Two years running science activities for kids at the Lawrence
                Hall of Science, plus years of one-on-one math tutoring.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot" id="contact">
        <div className="shell">
          <h2>Say hi.</h2>
          <p className="pitch">
            
          </p>
          <a className="email" href="mailto:rexchao1@gmail.com">
            rexchao1@gmail.com
          </a>
          <div className="foot-meta">
            <span>© {new Date().getFullYear()} Rex Chao</span>
            <div className="foot-links">
              <a
                href="https://github.com/rexchao1"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/rexchao1/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
