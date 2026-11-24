/**
 * THE 96 CHECKS: a 9:16 short in the "Ink & Ember" style (research/MERGED_STYLE.md).
 *   bin/render.sh Checks96 02-the-96-checks final
 * Every cut is anchored to a word of the voice-over (timing.ts), so a new VO re-times the edit.
 * The colour script (kit3d/mood.tsx) grades every shot continuously across the cuts.
 */
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from '../../kit3d/Captions';
import {MoodScript, ShotStart, type MoodKey} from '../../kit3d/mood';
import {captionWords, L, Lend, VO_END, W} from './timing';
import * as X from './Shots';

export const TAIL = 45; // hold on the finished drawing after the last word (the loop button)
export const CHECKS96_FRAMES = VO_END + TAIL;
const LEAD = 4; // cuts land ~130 ms BEFORE the word (the picture leads the voice, never lags it)

type Cut = {at: number; C: React.FC<any>; props?: Record<string, number | string>; dissolve?: number; whip?: number};

/** the edit: shot start frames. One visual beat per clause */
export const cutList = (): Cut[] => [
  {at: 0, C: X.S01a},
  {at: W('L01', 'for') - LEAD, C: X.S01b},
  {at: L('L02') - LEAD, C: X.S02},
  {at: L('L03') - LEAD, C: X.S03},
  {at: L('L04') - LEAD, C: X.S04},
  {at: L('L05') - LEAD, C: X.S05, props: {del: W('L06', 'deletes') - (L('L05') - LEAD)}},
  {at: L('L07') - LEAD, C: X.S07a, dissolve: 8},
  {at: W('L07', 'posts') - LEAD, C: X.S07b},
  {at: L('L08') - LEAD, C: X.S08},
  {at: L('L09') - LEAD, C: X.S09, props: {which: 'class'}, whip: 6},
  {at: W('L09', 'at') - LEAD, C: X.S09, props: {which: 'dinner'}, whip: 6},
  {at: W('L09', 'in', 2) - LEAD, C: X.S09, props: {which: 'shower'}, whip: 6},
  {at: L('L10') - LEAD, C: X.S10a, dissolve: 8},
  {at: W('L10', "He's") - LEAD, C: X.S10b},
  {at: L('L11') - LEAD, C: X.S11},
  {at: L('L12') - LEAD, C: X.S12},
  {at: L('L13') - LEAD, C: X.S13a},
  {at: W('L13', 'Because') - LEAD, C: X.S13b},
  {at: W('L13', 'stadium') - 10, C: X.S14a, props: {on: 18}, dissolve: 8},
  {at: W('L14', 'waiting') - LEAD, C: X.S14b},
  {at: L('L15') - LEAD, C: X.S15},
  {at: L('L16') - LEAD, C: X.S16, props: {reveal: W('L17', "Nobody's") - (L('L16') - LEAD)}},
  {at: L('L18') - LEAD, C: X.S17},
  {at: L('L19') - LEAD, C: X.S18a},
  {at: W('L19', 'Scared') - LEAD, C: X.S18b},
  {at: L('L20') - LEAD, C: X.S19},
  {at: L('L21') - LEAD, C: X.S20, props: {off: W('L21', 'nobody') - (L('L21') - LEAD)}},
  {at: Lend('L21') + 4, C: X.S21},
  {at: L('L23') - LEAD, C: X.S22},
  {at: L('L24') - LEAD, C: X.S23a, dissolve: 8},
  {at: W('L24', 'picks') - LEAD, C: X.S23b},
  {at: W('L24', 'and') - LEAD, C: X.S23c, props: {buzz: W('L24', 'check.') - (W('L24', 'and') - LEAD) - 20}},
];

/** the colour script: positive by default, darkness is a beat (mood.tsx). Changes blend over ~1.2 s */
export const moodScript = (): MoodKey[] => [
  [0, 'night'],                       // the hook: alone with the phone
  [L('L02') - LEAD, 'cozy'],          // Monday afternoon: happy drawing, golden
  [L('L05'), 'cool'],                 // 9 likes: the warmth drains
  [L('L07') + 25, 'night'],           // Tuesday into 2 AM
  [L('L09') - LEAD, 'bright'],        // Wednesday: a bright day he spends on the phone
  [L('L10') - LEAD, 'grey'],          // Friday: numb
  [L('L13'), 'night'],
  [W('L13', 'stadium') - 4, 'anxious'], // the stadium in his head
  [L('L20') - LEAD, 'cool'],
  [Lend('L21') + 4, 'bottom'],        // "Nobody was watching." (the one still shot)
  [L('L23') - LEAD, 'dawn'],          // the good news: sunrise
  [L('L24') - LEAD, 'bright'],        // a new morning, drawing again
];

const Fade: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, d], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
/** whip pan: the outgoing shot smears out left, the incoming smears in from the right (RicksClips montage move) */
const WhipIn: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, d], [1, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return <AbsoluteFill style={{transform: `translateX(${t * 70}%)`, filter: `blur(${t * 26}px)`}}>{children}</AbsoluteFill>;
};
const WhipOut: React.FC<{d: number; len: number; children: React.ReactNode}> = ({d, len, children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [len - d, len], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return <AbsoluteFill style={{transform: `translateX(${-t * 70}%)`, filter: `blur(${t * 26}px)`}}>{children}</AbsoluteFill>;
};

export const Checks96: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const cuts = cutList();
  return (
    <AbsoluteFill style={{background: '#0B0D12'}}>
      <MoodScript script={moodScript()}>
        {cuts.map((c, i) => {
          const next = cuts[i + 1];
          const overlap = next ? (next.dissolve ?? 0) + (next.whip ?? 0) / 2 : 0;
          const end = next ? next.at + overlap : CHECKS96_FRAMES;
          const pre = (c.dissolve ?? 0) + (c.whip ?? 0) / 2;
          const start = Math.max(0, c.at - pre);
          const len = end - start;
          let el = <c.C len={len} {...c.props} />;
          if (next?.whip) el = <WhipOut d={next.whip} len={len}>{el}</WhipOut>;
          if (c.whip) el = <WhipIn d={c.whip}>{el}</WhipIn>;
          if (c.dissolve) el = <Fade d={c.dissolve}>{el}</Fade>;
          return (
            <Sequence key={i} from={start} durationInFrames={len} name={`S${i + 1} ${c.C.name ?? ''}`}>
              <ShotStart start={start}>{el}</ShotStart>
            </Sequence>
          );
        })}
      </MoodScript>
      {captions && <Captions words={captionWords()} />}
      {audio && <Audio src={staticFile('audio/checks96/mix.wav')} />}
    </AbsoluteFill>
  );
};
