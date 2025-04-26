export interface GameLevel {
  id: number;
  name: string;
  description: string;
  icon: string;
  minStars: number;
}

export const levels: GameLevel[] = [
  {
    id: 1,
    name: "Word Dalgona",
    description: "Carve out correct word spellings within a time limit",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z"/>
    </svg>`,
    minStars: 0
  },
  {
    id: 2,
    name: "Tug of Tongues",
    description: "Play tug of war through correct pronunciation",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 13H7v-2h4v2zm6-4H7V9h10v2z"/>
    </svg>`,
    minStars: 2
  },
  {
    id: 3,
    name: "Marbles of Meaning",
    description: "Match the correct word meaning pairs",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="12" r="6" fill="currentColor"/>
    </svg>`,
    minStars: 4
  },
  {
    id: 4,
    name: "Glass Bridge Grammar",
    description: "Choose the correct grammar options to cross the bridge",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M3 3h18v2H3zm0 16h18v2H3zm0-8h18v2H3z"/>
    </svg>`,
    minStars: 6
  },
  {
    id: 5,
    name: "Red Light Green Light Listening",
    description: "Red Light Green Light listening challenge",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="currentColor"/>
      <path d="M15 8l-6 6m0-6l6 6" stroke="white" fill="none"/>
    </svg>`,
    minStars: 8
  },
  {
    id: 6,
    name: "Final Speech Battle",
    description: "Ultimate speech showdown",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>`,
    minStars: 10
  }
];