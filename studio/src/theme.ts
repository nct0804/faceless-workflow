// Palette for "Nobody Is Watching." (our own look; amber is the only accent)
export const C = {
  bg: '#0B0D12',
  wallTop: '#1B2030',
  wallBottom: '#11141D',
  floor: '#07080C',
  line: '#2E3548',
  hero: '#EDE6D6',
  heroShade: '#D6CCB6',
  ink: '#16181E',
  wood: '#3A2A22',
  woodTop: '#5A4232',
  paper: '#E8E0CC',
  lamp: '#FFD9A0',
  lampMetal: '#2B2F3A',
  moon: '#CFD6E6',
  amber: '#F2A93B',
  crowd: '#141824',
  crowdRim: '#232A3C',
  chalk: '#1E2A26',
  sage: '#7C8C7A',
  clay: '#9C7B6B',
  slate: '#6F7C96',
} as const;

export const FPS = 30;
export const W = 1920;
export const H = 1080;
/** y of the floor line in world units (1 unit = 1 px at zoom 1, origin = frame center) */
export const FLOOR_Y = -300;
