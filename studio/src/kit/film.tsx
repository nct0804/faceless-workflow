/**
 * LONG-FORM (16:9 film) direction layer for the flat kit: WHERE each shot is (location -> a fully built backdrop) and
 * HOW it feels (mood -> colour script). Shots don't change: <Room/>, <Window/>, <Darkness/> and <PostFX/> read this.
 *
 *   <FilmShot shot={12} start={filmFrame}> <Shot12/> </FilmShot>     (Root.tsx does this for the "FilmHD" cut)
 *
 * The colour script is positive by default (warm, bright, saturated); darkness is a story beat, and every change
 * blends over ~1 s across the cut so the colour drifts with the mood instead of popping.
 */
import React, {createContext, useContext} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';

export type Loc = 'bedroom' | 'kitchen' | 'classroom' | 'hallway' | 'bathroom' | 'gym' | 'street' | 'none';
export type FilmMood = 'joy' | 'warm' | 'day' | 'cool' | 'night' | 'grey' | 'anxious' | 'bottom' | 'dawn' | 'bright';

type MoodDef = {
  wallTop: string; wallBottom: string; floor: string; trim: string; // set colours
  skyTop: string; skyBottom: string; night: number; // window sky (night 1 = moon + stars, 0 = daylight)
  dark: number; // multiplier on each shot's Darkness (0.3 = mostly lit room, 1 = original low-key)
  shadow: string; // darkness tint
  brightness: number; saturate: number; tint: string; tintK: number; vign: number; // grade
};

const M: Record<FilmMood, MoodDef> = {
  joy: {wallTop: '#F0D2A4', wallBottom: '#D9A77C', floor: '#6B4A35', trim: '#FFF6E6', skyTop: '#7FC4FF', skyBottom: '#FFE6B8', night: 0,
    dark: 0.22, shadow: '#3A2440', brightness: 1.06, saturate: 1.1, tint: '#FFC880', tintK: 0.06, vign: 0.45},
  warm: {wallTop: '#D8A97E', wallBottom: '#A87858', floor: '#4E3528', trim: '#F2D9B8', skyTop: '#F0A06A', skyBottom: '#FFD29A', night: 0.15,
    dark: 0.4, shadow: '#2A1A30', brightness: 1.04, saturate: 1.08, tint: '#FFB070', tintK: 0.06, vign: 0.55},
  day: {wallTop: '#9FC4D8', wallBottom: '#7898B0', floor: '#5A5560', trim: '#F0F4F8', skyTop: '#6CB8FF', skyBottom: '#D8F0FF', night: 0,
    dark: 0.25, shadow: '#20304A', brightness: 1.06, saturate: 1.18, tint: '#FFE8C0', tintK: 0.06, vign: 0.45},
  cool: {wallTop: '#5E7396', wallBottom: '#3E4E6C', floor: '#2C3244', trim: '#B8C6DA', skyTop: '#4A6A9A', skyBottom: '#A8BCD8', night: 0.4,
    dark: 0.55, shadow: '#0E1628', brightness: 1.0, saturate: 1.05, tint: '#8FA8FF', tintK: 0.05, vign: 0.7},
  night: {wallTop: '#2A3352', wallBottom: '#1A2036', floor: '#10141E', trim: '#3A4562', skyTop: '#0E1426', skyBottom: '#1E2A48', night: 1,
    dark: 0.85, shadow: '#03050A', brightness: 1.0, saturate: 1.08, tint: '#5468A8', tintK: 0.05, vign: 0.85},
  grey: {wallTop: '#5A606E', wallBottom: '#40454F', floor: '#2A2D36', trim: '#7A8090', skyTop: '#6A7080', skyBottom: '#9AA0AC', night: 0.3,
    dark: 0.5, shadow: '#0A0C12', brightness: 0.96, saturate: 0.55, tint: '#9AA2B4', tintK: 0.06, vign: 0.85},
  anxious: {wallTop: '#22284A', wallBottom: '#141830', floor: '#0A0C16', trim: '#2E3658', skyTop: '#0A0E20', skyBottom: '#1A2040', night: 1,
    dark: 1.0, shadow: '#02030A', brightness: 0.98, saturate: 1.0, tint: '#F2A93B', tintK: 0.04, vign: 0.95},
  bottom: {wallTop: '#1A1E2C', wallBottom: '#10131C', floor: '#07080C', trim: '#262B3A', skyTop: '#080A12', skyBottom: '#141826', night: 1,
    dark: 1.0, shadow: '#000000', brightness: 0.9, saturate: 0.45, tint: '#6A7088', tintK: 0.05, vign: 1.0},
  dawn: {wallTop: '#C8A0B4', wallBottom: '#8E6E8C', floor: '#3E3048', trim: '#F2D2C8', skyTop: '#9A86C8', skyBottom: '#FFB894', night: 0.1,
    dark: 0.4, shadow: '#2A1838', brightness: 1.04, saturate: 1.12, tint: '#FFB08A', tintK: 0.07, vign: 0.6},
  bright: {wallTop: '#F6E2B8', wallBottom: '#E0BC90', floor: '#7A5A40', trim: '#FFF6E6', skyTop: '#62B6FF', skyBottom: '#E6F6FF', night: 0,
    dark: 0.2, shadow: '#3A2A40', brightness: 1.08, saturate: 1.12, tint: '#FFD890', tintK: 0.06, vign: 0.4},
};

/** a film's plan: shot number -> [place, mood]. Each film keeps its own (src/films/<slug>/plan.ts) */
export type FilmPlan = Record<number, [Loc, FilmMood]>;

type Ctx = {loc: Loc; script: [number, FilmMood][]; start: number};
const FilmCtx = createContext<Ctx | null>(null);

/** provide a shot's place + its position in the film (so moods blend across cuts) */
export const FilmShot: React.FC<{shot: number; start: number; plan: FilmPlan; script: [number, FilmMood][]; children: React.ReactNode}> = ({shot, start, plan, script, children}) => (
  <FilmCtx.Provider value={{loc: plan[shot]?.[0] ?? 'none', script, start}}>{children}</FilmCtx.Provider>
);

const lerpC = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
const blend = (a: MoodDef, b: MoodDef, t: number): MoodDef => {
  const o = {} as MoodDef;
  for (const k of Object.keys(a) as (keyof MoodDef)[]) {
    const va = a[k];
    const vb = b[k];
    (o as Record<string, unknown>)[k] = typeof va === 'number' ? va + ((vb as number) - va) * t : lerpC(va as string, vb as string, t);
  }
  return o;
};

/** the current shot's place + graded mood, or null outside the enhanced film (old shots render as before) */
export const useFilm = (): (MoodDef & {loc: Loc}) | null => {
  const c = useContext(FilmCtx);
  const local = useCurrentFrame();
  if (!c) return null;
  const f = c.start + local;
  const s = c.script;
  const BL = 30;
  let i = 0;
  while (i + 1 < s.length && s[i + 1][0] - BL / 2 <= f) i++;
  const t = i === 0 ? 1 : Math.min(1, Math.max(0, (f - (s[i][0] - BL / 2)) / BL));
  const sm = t * t * (3 - 2 * t);
  return {...blend(M[s[Math.max(0, i - 1)][1]], M[s[i][1]], sm), loc: c.loc};
};

/** mood keyframes for a list of shots (key only where the mood changes, at the shot's first frame) */
export const filmScript = (shots: {n: number; frames: number}[], plan: FilmPlan): [number, FilmMood][] => {
  const out: [number, FilmMood][] = [];
  let f = 0;
  for (const s of shots) {
    const m = plan[s.n]?.[1] ?? 'night';
    if (!out.length || out[out.length - 1][1] !== m) out.push([f, m]);
    f += s.frames;
  }
  return out;
};
