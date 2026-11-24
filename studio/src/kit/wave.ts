/** Pure motion helpers shared by both kits (flat kit/life.tsx and 3D kit3d/Set.tsx). */
export const TAU = Math.PI * 2;

/** smooth two-octave wave in about -1..1 (a breeze, not a metronome) */
export const breeze = (t: number, speed = 0.22, seed = 0) =>
  0.65 * Math.sin(TAU * speed * t + seed * 2.39) + 0.35 * Math.sin(TAU * speed * 2.31 * t + seed * 4.11 + 1.3);

/** deterministic 0..1 hash */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
