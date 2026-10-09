/** Everything the home scene's corner cards say. Photos are placeholders (`shots: n`) until Rex sends real ones. */
export type Spot = {
  id: string;
  title: string;
  line: string;
  /** How many photo slots the card shows. */
  shots: number;
  /** Optional chips under the line (places, artists). */
  chips?: string[];
  tint: string;
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
