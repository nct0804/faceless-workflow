/**
 * The COLOUR SCRIPT: the grade follows the story's mood and changes GRADUALLY (never a hard switch).
 *   const SCRIPT: MoodKey[] = [[0, 'night'], [L('L02'), 'cozy'], ...]     // frame -> mood keyframes
 *   <MoodScript script={SCRIPT}> ...shots... </MoodScript>                // in the edit
 *   const g = useGrade()                                                   // inside a shot: post settings + light colours
 *   <Stage post={{...g.post, aperture: 2}} background={g.bg}> ... <Ambient color={g.ambient} intensity={g.ambientK}/>
 *
 * Moods (positive by default: bright, saturated, warm; darkness is a beat, not the base):
 *   bright   sunny morning, hope, the ending
 *   cozy     warm afternoon, happy at work (golden)
 *   cool     the first doubt: the warmth drains a little
 *   night    alone with the phone (navy + one amber practical)
 *   grey     numb routine: desaturated, flat
 *   anxious  the imagined stadium: cold, contrasty, heavy vignette
 *   bottom   rock bottom: dark, almost colourless
 *   dawn     relief: pink-gold sunrise
 */
import React, {createContext, useContext} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import type {PostSettings} from './post';

export type MoodName = 'bright' | 'cozy' | 'cool' | 'night' | 'grey' | 'anxious' | 'bottom' | 'dawn';
type MoodDef = {
  exposure: number; contrast: number; saturation: number; vignette: number; lift: number; split: number; bloom: number;
  shadowTint: string; highlightTint: string;
  bg: string; // background / fog colour
  ambient: string; ambientK: number; // fill light
  key: string; keyK: number; // main light colour + strength multiplier (sun / moon / spot)
  warm: number; // 0..1 practical (lamp) strength multiplier
};

export const MOODS: Record<MoodName, MoodDef> = {
  bright: {exposure: 1.06, contrast: 1.14, saturation: 1.32, vignette: 0.12, lift: 0.049, split: 0.14, bloom: 0.75,
    shadowTint: '#3B4E8A', highlightTint: '#FFF1CC', bg: '#9FC8F0', ambient: '#9DB2E6', ambientK: 0.72, key: '#FFE9C4', keyK: 1.0, warm: 0.4},
  cozy: {exposure: 1.04, contrast: 1.16, saturation: 1.3, vignette: 0.16, lift: 0.042, split: 0.2, bloom: 0.8,
    shadowTint: '#4A3566', highlightTint: '#FFD29A', bg: '#E8A86A', ambient: '#A894C8', ambientK: 0.68, key: '#FFD7A0', keyK: 1.0, warm: 0.8},
  cool: {exposure: 1.0, contrast: 1.18, saturation: 1.05, vignette: 0.2, lift: 0.035, split: 0.2, bloom: 0.8,
    shadowTint: '#2A3A6E', highlightTint: '#F2E2C8', bg: '#6E86B0', ambient: '#8094C6', ambientK: 0.8, key: '#E8EEFF', keyK: 0.85, warm: 0.6},
  night: {exposure: 1.02, contrast: 1.22, saturation: 1.12, vignette: 0.26, lift: 0.028, split: 0.22, bloom: 0.9,
    shadowTint: '#1A2348', highlightTint: '#FFC98A', bg: '#141A2E', ambient: '#5468A8', ambientK: 1.0, key: '#8FA6FF', keyK: 1.0, warm: 1.0},
  grey: {exposure: 0.95, contrast: 1.12, saturation: 0.55, vignette: 0.28, lift: 0.035, split: 0.08, bloom: 0.6,
    shadowTint: '#2E3444', highlightTint: '#D2D4DC', bg: '#3A4152', ambient: '#7A8296', ambientK: 0.85, key: '#C8CEDC', keyK: 0.8, warm: 0.3},
  anxious: {exposure: 0.98, contrast: 1.30, saturation: 1.0, vignette: 0.36, lift: 0.021, split: 0.26, bloom: 0.95,
    shadowTint: '#121A3E', highlightTint: '#FFE0B0', bg: '#10162A', ambient: '#4A5C9A', ambientK: 0.85, key: '#9DB2FF', keyK: 1.0, warm: 1.0},
  bottom: {exposure: 0.86, contrast: 1.16, saturation: 0.45, vignette: 0.46, lift: 0.021, split: 0.1, bloom: 0.7,
    shadowTint: '#151A2A', highlightTint: '#C9CCD6', bg: '#0C1020', ambient: '#3E4A72', ambientK: 0.8, key: '#8090C0', keyK: 0.6, warm: 0.5},
  dawn: {exposure: 1.04, contrast: 1.16, saturation: 1.35, vignette: 0.16, lift: 0.049, split: 0.24, bloom: 0.9,
    shadowTint: '#4E3A78', highlightTint: '#FFC08A', bg: '#F0A889', ambient: '#B99AD0', ambientK: 0.75, key: '#FFC48A', keyK: 1.0, warm: 0.6},
};

export type MoodKey = [number, MoodName];

const lerpC = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
const smooth = (t: number) => t * t * (3 - 2 * t);

/** blend two keyframes over `blend` frames centred on each key (so a mood change takes ~1 s, never a pop) */
export const moodAt = (script: MoodKey[], frame: number, blend = 36) => {
  let i = 0;
  while (i + 1 < script.length && script[i + 1][0] - blend / 2 <= frame) i++;
  const a = MOODS[script[Math.max(0, i - 1)][1]];
  const b = MOODS[script[i][1]];
  const t = i === 0 ? 1 : smooth(Math.min(1, Math.max(0, (frame - (script[i][0] - blend / 2)) / blend)));
  const out = {} as MoodDef;
  for (const k of Object.keys(b) as (keyof MoodDef)[]) {
    const va = a[k];
    const vb = b[k];
    (out as Record<string, unknown>)[k] = typeof vb === 'number' ? (va as number) + ((vb as number) - (va as number)) * t : lerpC(va as string, vb as string, t);
  }
  return out;
};

const Ctx = createContext<{script: MoodKey[]; start: number} | null>(null);

/** provide the colour script to the whole edit */
export const MoodScript: React.FC<{script: MoodKey[]; children: React.ReactNode}> = ({script, children}) => (
  <Ctx.Provider value={{script, start: 0}}>{children}</Ctx.Provider>
);
/** tell shots where they sit in the edit (their Sequence start), so the grade is continuous across cuts */
export const ShotStart: React.FC<{start: number; children: React.ReactNode}> = ({start, children}) => {
  const c = useContext(Ctx);
  return <Ctx.Provider value={{script: c?.script ?? [[0, 'night']], start}}>{children}</Ctx.Provider>;
};

/** the grade at this frame of the edit (+ optional per-shot mood override) */
export const useGrade = (override?: MoodName) => {
  const c = useContext(Ctx);
  const f = useCurrentFrame() + (c?.start ?? 0);
  const m = override ? MOODS[override] : moodAt(c?.script ?? [[0, 'night']], f);
  const post: PostSettings = {
    exposure: m.exposure, contrast: m.contrast, saturation: m.saturation, vignette: m.vignette, lift: m.lift,
    split: m.split, bloom: m.bloom, shadowTint: m.shadowTint, highlightTint: m.highlightTint,
  };
  return {...m, post, frame: f};
};
