import tooey from './assets/tooey.jpg';
import tooeySite from './assets/tooey-site.jpg';
import frontdesk from './assets/frontdesk.jpg';
import fetchPlayer from './assets/fetch.jpg';
import fetchGuide from './assets/fetch-guide.jpg';
import bruindesk from './assets/bruindesk.jpg';
import catcart from './assets/catcart.jpg';
import animus from './assets/animus.jpg';
import factoryWork from './assets/factory-work.jpg';
import factoryPlanning from './assets/factory-planning.jpg';

/**
 * One screen of a project's demo. `frame` picks the chrome drawn around the screenshot:
 * a browser (with `url`), a phone, or none when the shot already has its own window or is a render.
 * Each note is pinned at x/y (fractions of the image) and the demo zooms toward it in turn.
 */
export type Slide = {
  img: string;
  alt: string;
  /** Width over height of the image. */
  ar: number;
  frame: 'browser' | 'phone' | 'none';
  url?: string;
  notes: { x: number; y: number; text: string }[];
};

export type Project = {
  id: string;
  title: string;
  /** Small label on the card, e.g. "Mac app". */
  kind: string;
  /** Role or status line in the popup. */
  role?: string;
  /** The one line on the card. */
  line: string;
  /** The popup's longer story, one paragraph per entry. */
  about: string[];
  stack?: string[];
  links: { label: string; href: string; icon: 'github' | 'site' | 'download' }[];
  /** Shown instead of a code link when the code can't be public. */
  closed?: string;
  slides: Slide[];
  tint: string;
};

/** Tooey first; it is the featured card. */
export const WORK: Project[] = [
  {
    id: 'tooey',
    title: 'Tooey',
    kind: 'Restaurant forecasting',
    role: 'Cofounder and engineer. In a free pilot now.',
    line: 'Tells a restaurant how much of each dish to prep tomorrow, from its own sales.',
    about: [
      'Independent restaurants guess their prep. Guess high and food gets thrown out; guess low and a dish runs out on a Friday night.',
      'Tooey reads a restaurant\'s own sales and forecasts tomorrow, dish by dish, so the kitchen knows what to have ready before service. I build the product with my cofounder, and we\'re running it with a pilot restaurant now.',
    ],
    links: [{ label: 'Website', href: 'https://tooey-website.vercel.app', icon: 'site' }],
    closed: 'The app is closed source.',
    slides: [
      {
        img: tooey, ar: 1.6,
        alt: 'Tooey forecast screen listing tomorrow\'s predicted sales for each menu item',
        frame: 'browser',
        url: 'Tooey',
        notes: [
          { x: 0.38, y: 0.19, text: 'Tomorrow\'s demand, ready the night before' },
          { x: 0.6, y: 0.22, text: 'Total expected sales against the same day last week' },
          { x: 0.68, y: 0.55, text: 'A number for every dish, grouped by menu section' },
        ],
      },
      {
        img: tooeySite, ar: 1.6,
        alt: 'The Tooey website, a painted restaurant street with the forecast screen on top',
        frame: 'browser',
        url: 'tooey-website.vercel.app',
        notes: [
          { x: 0.24, y: 0.15, text: 'A heads-up when the forecast is ready' },
          { x: 0.78, y: 0.33, text: 'What to have ready, in the kitchen\'s own units' },
        ],
      },
    ],
    tint: '#ff7a45',
  },
  {
    id: 'factory',
    title: 'Software Factory',
    kind: 'Agent workflow',
    line: 'My setup for building with AI agents: plan with them, then a queue builds the work while I\'m offline.',
    about: [
      'Two halves. In the light factory I plan with an agent: research, a roadmap of checkpoints, a spec with every decision cited, a critic pass, then my review. Only then does it get cut into small tasks.',
      'The dark factory is a local server on a Mac mini. Each task gets built in its own worktree and comes back as a pull request, while I work on my laptop or sleep. What I learned: unattended agents are worth it for small, precise issues on a codebase that already exists, not for deciding what to build.',
    ],
    stack: ['Go', 'TypeScript', 'Claude Code', 'Codex'],
    links: [{ label: 'GitHub', href: 'https://github.com/rexchao1/not-so-simple-software-factory', icon: 'github' }],
    slides: [
      {
        img: factoryWork, ar: 1.708,
        alt: 'Factory work board with queued, running, needs attention and done columns',
        frame: 'browser',
        url: 'localhost · Factory',
        notes: [
          { x: 0.45, y: 0.34, text: 'Every repo\'s work, from queue to done' },
          { x: 0.87, y: 0.56, text: 'Each job shows its agent, stages and cost' },
        ],
      },
      {
        img: factoryPlanning, ar: 1.718,
        alt: 'Factory planning screen showing a plan moving through draft, critique, revise, review and freeze',
        frame: 'browser',
        url: 'localhost · Factory',
        notes: [
          { x: 0.55, y: 0.39, text: 'A plan moves from draft to frozen' },
          { x: 0.57, y: 0.65, text: 'A critic pushes back before anything becomes tasks' },
        ],
      },
    ],
    tint: '#6b6ef5',
  },
  {
    id: 'frontdesk',
    title: 'Front desk',
    kind: 'Dental office AI',
    line: 'An AI front desk for a real dental office: checks insurance, waits on hold, drafts referral letters.',
    about: [
      'The front desk of a dental office spends hours on the phone with insurance companies. I built tools that do the checking and the waiting, and leave the decisions to staff.',
      'It checks a patient\'s coverage online, waits on hold with payers, and drafts referral letters that staff approve before anything goes out.',
    ],
    links: [],
    closed: 'Built for a real office, so the code stays private. Screens use test data.',
    slides: [
      {
        img: frontdesk, ar: 1.6,
        alt: 'Insurance eligibility screen with coverage, annual maximum, deductible and procedure codes',
        frame: 'browser',
        url: 'Front desk · Eligibility',
        notes: [
          { x: 0.22, y: 0.11, text: 'A live coverage check, done in about a second' },
          { x: 0.5, y: 0.26, text: 'Maximum and deductible left, at a glance' },
          { x: 0.55, y: 0.6, text: 'Every procedure code, as the payer reported it' },
        ],
      },
    ],
    tint: '#2fae8a',
  },
  {
    id: 'fetch',
    title: 'Fetch',
    kind: 'Mac app',
    line: 'A Mac app that streams video without the ads. Paste a link and it plays.',
    about: [
      'I got tired of streaming in the browser with ads popping up everywhere. Paste a video URL into Fetch and it finds the stream and plays it in a plain player.',
      'It also works as a middleman for Jellyfin. Sites sign their stream links with tokens that expire in minutes; Fetch keeps refreshing them so Jellyfin always sees one stable URL. Building it taught me how HLS playlists actually work.',
    ],
    stack: ['TypeScript', 'Rust', 'HLS'],
    links: [
      { label: 'GitHub', href: 'https://github.com/rexchao1/Fetch', icon: 'github' },
      { label: 'Download for Mac', href: 'https://github.com/rexchao1/Fetch/releases/latest/download/Fetch.dmg', icon: 'download' },
    ],
    slides: [
      {
        img: fetchPlayer, ar: 1.445,
        alt: 'Fetch window playing a video above a list of saved channels',
        frame: 'none',
        notes: [
          { x: 0.5, y: 0.4, text: 'Plays the stream, no ads' },
          { x: 0.3, y: 0.93, text: 'Channels you\'ve saved, one click away' },
        ],
      },
      {
        img: fetchGuide, ar: 1.556,
        alt: 'Fetch guide tab showing a live channel',
        frame: 'none',
        notes: [
          { x: 0.5, y: 0.08, text: 'Guide, Capture and Settings' },
          { x: 0.5, y: 0.5, text: 'Live channels keep playing past token expiry' },
        ],
      },
    ],
    tint: '#e9493f',
  },
  {
    id: 'bruindesk',
    title: 'Bruin Desk',
    kind: 'UCLA dashboard',
    line: 'My whole UCLA life in one private dashboard: classes, GPA, deadlines and degree progress.',
    about: [
      'UCLA spreads a student\'s life across several portals. Bruin Desk pulls it into one page: grades and GPA, degree progress, deadlines, financial aid and what needs doing next.',
      'It ranks what needs attention, so an overdue form shows up before a homework set due next week.',
    ],
    stack: ['TypeScript', 'Postgres'],
    links: [],
    closed: 'It holds my own records, so it stays private. The screen uses a test student.',
    slides: [
      {
        img: bruindesk, ar: 1.6,
        alt: 'Bruin Desk overview with GPA, degree progress, deadlines and a list of things needing attention',
        frame: 'browser',
        url: 'Bruin Desk',
        notes: [
          { x: 0.42, y: 0.2, text: 'GPA, degree progress, units and aid in one row' },
          { x: 0.35, y: 0.45, text: 'What needs attention, most urgent first' },
          { x: 0.86, y: 0.5, text: 'This quarter\'s classes and grades' },
        ],
      },
    ],
    tint: '#2774ae',
  },
  {
    id: 'animus',
    title: 'Animus',
    kind: '3D AI character',
    line: 'Wren, a 3D character who lives in a little world and builds what you ask for, live.',
    about: [
      'Animus puts an AI agent in a body. Wren lives in a small 3D world; you ask for something and watch Wren build it, live, instead of reading a wall of text.',
    ],
    stack: ['TypeScript', 'React Three Fiber', 'Rust'],
    links: [],
    closed: 'The code is private for now.',
    slides: [
      {
        img: animus, ar: 1.6,
        alt: 'Wren, a white robot with a glowing smiling face, standing in a small world at sunset',
        frame: 'none',
        notes: [
          { x: 0.5, y: 0.38, text: 'Wren reacts while it works' },
          { x: 0.88, y: 0.45, text: 'A small world it builds into' },
        ],
      },
    ],
    tint: '#d9744a',
  },
  {
    id: 'catcart',
    title: 'CatCart',
    kind: 'iOS game',
    line: 'An endless runner starring a cat. Four worlds and four power-ups, built in SceneKit.',
    about: [
      'An endless runner for iPhone. A cat rides a shopping cart down the street, dodging and collecting food. Four worlds, four power-ups, all in SceneKit.',
    ],
    stack: ['Swift', 'SceneKit'],
    links: [{ label: 'GitHub', href: 'https://github.com/rexchao1/CatCart', icon: 'github' }],
    slides: [
      {
        img: catcart, ar: 0.459,
        alt: 'CatCart gameplay: a cat in a shopping cart rolling down a colorful street',
        frame: 'phone',
        notes: [
          { x: 0.5, y: 0.1, text: 'Score and food collected' },
          { x: 0.5, y: 0.64, text: 'Swipe to switch lanes' },
        ],
      },
    ],
    tint: '#f0902f',
  },
];

export const EMAIL = 'rexchao1@gmail.com';
