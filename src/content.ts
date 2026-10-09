import tooey from './assets/tooey.jpg';
import frontdesk from './assets/frontdesk.jpg';
import fetch from './assets/fetch.jpg';
import bruindesk from './assets/bruindesk.jpg';
import catcart from './assets/catcart.jpg';
import laoshu from './assets/laoshu.jpg';
import animus from './assets/animus.jpg';

/** Everything the corner cards say. Photos are placeholders (`shots: n`) until Rex sends real ones. */
export type Spot = {
  id: string;
  title: string;
  line: string;
  /** How many photo slots the card shows. */
  shots: number;
  /** Optional chips under the line (places, artists). */
  chips?: string[];
  tint: string;
  /** A screenshot (projects) and its shape. */
  img?: string;
  tall?: boolean;
  /** Small label above the title, e.g. the role. */
  tag?: string;
};

export const SPOTS: Record<string, Spot> = {
  me: { id: 'me', title: 'Hi, I\'m Rex', line: 'From Danville in the Bay Area. Studying computer science at UCLA.', shots: 0, tint: '#2774AE' },
  ucla: { id: 'ucla', title: 'UCLA', line: 'Computer science. Bay Area kid, LA now.', shots: 2, tint: '#2774AE' },
  baseball: { id: 'baseball', title: 'Baseball', line: 'I volunteer as an umpire for Tri-Valley youth baseball.', shots: 2, tint: '#d0352b' },
  skis: { id: 'skis', title: 'Skiing', line: 'Tahoe in the winter. I\'m pretty good.', shots: 2, tint: '#ff7a3d' },
  pickleball: { id: 'pickleball', title: 'Pickleball', line: 'Just for fun.', shots: 1, tint: '#3b6ff5' },
  grill: { id: 'grill', title: 'LA eats', line: 'Korean BBQ with friends is the usual plan.', shots: 3, tint: '#e2553a' },
  globe: { id: 'globe', title: 'Travel', line: 'Places I\'ve been so far.', shots: 3, chips: ['Peru', 'Japan', 'China', 'Spain', 'Mexico', 'Alaska'], tint: '#2a5ea8' },
  records: { id: 'records', title: 'On repeat', line: 'Top artists, coming soon.', shots: 0, chips: ['Artist', 'Artist', 'Artist', 'Artist'], tint: '#9b7bff' },
  pets: { id: 'pets', title: 'Rusty, Petey and Jasper', line: 'One dog, two cats.', shots: 3, tint: '#d9653b' },
  friends: { id: 'friends', title: 'Friends', line: 'The people I eat, travel and ski with.', shots: 3, tint: '#c99a63' },
};

export const PROJECTS: Record<string, Spot> = {
  tooey: { id: 'tooey', tag: 'Cofounder, engineer', title: 'Tooey', line: 'Tells a restaurant how much of each dish to prep tomorrow, from its own sales. In a free pilot now.', shots: 0, img: tooey, tint: '#ff7a45' },
  frontdesk: { id: 'frontdesk', title: 'Front desk', line: 'An AI front desk for a real dental office. It checks insurance, waits on hold and drafts referral letters for staff to approve.', shots: 0, img: frontdesk, tint: '#3fbf9a' },
  fetch: { id: 'fetch', title: 'Fetch', line: 'A Mac app that streams video without the ads. Building it taught me how HLS playlists actually work.', shots: 0, img: fetch, tint: '#ff5a4e' },
  animus: { id: 'animus', title: 'Animus', line: 'Wren, a 3D character who lives in a little world and builds what you ask for, live.', shots: 0, img: animus, tint: '#5fb4d8' },
  bruindesk: { id: 'bruindesk', title: 'Bruin Desk', line: 'My whole UCLA life in one private dashboard: classes, GPA, deadlines and degree progress.', shots: 0, img: bruindesk, tint: '#2774AE' },
  catcart: { id: 'catcart', title: 'CatCart', line: 'An endless runner starring a cat. Four worlds and four power-ups, built in SceneKit.', shots: 0, img: catcart, tall: true, tint: '#ff9a3d' },
  laoshu: { id: 'laoshu', title: 'Laoshu', line: 'Chinese flashcards for 5,400 HSK words, with reviews the next day and a week later.', shots: 0, img: laoshu, tall: true, tint: '#d93a3a' },
  posear: { id: 'posear', title: 'PoseAR', line: 'Tell a 3D person what to do and they do it in your iPhone camera.', shots: 1, tint: '#9b7bff' },
  photon: { id: 'photon', tag: 'Internship', title: 'Photon Commerce', line: 'Team player? Ask them.', shots: 0, tint: '#1F4E6E' },
  studioapp: { id: 'studioapp', tag: 'Internship, now', title: 'StudioApp.ai', line: 'Team player? Ask them too.', shots: 0, tint: '#1F4E6E' },
};
