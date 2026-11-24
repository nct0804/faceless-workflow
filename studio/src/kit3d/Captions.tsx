/**
 * Word-by-word captions (RicksClips grammar: 1-3 words at a time, centred at ~68% height, white heavy rounded
 * type with a thick ink stroke) + our signature: the KEY word of each line turns amber and pops bigger.
 *
 * words: [{t: startFrame, w: 'text', key?: true}] ; each chunk stays until the next one starts.
 */
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Baloo2';

const {fontFamily} = loadFont('normal', {weights: ['800'], subsets: ['latin']});
export const CAPTION_FONT = fontFamily;

/** 16-direction text-shadow = a solid ink stroke around the glyphs */
const outline = (r: number) =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * r).toFixed(1)}px ${(Math.sin(a) * r).toFixed(1)}px 0 #14161C`;
  }).join(', ');

export type Word = {t: number; w: string; key?: boolean};

export const Captions: React.FC<{words: Word[]; y?: number; size?: number; end?: number}> = ({
  words, y = 0.68, size, end,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const idx = words.findIndex((w, i) => frame >= w.t && (i === words.length - 1 || frame < words[i + 1].t));
  if (idx < 0) return null;
  if (end !== undefined && frame >= end) return null;
  const cur = words[idx];
  const local = frame - cur.t;
  const pop = spring({frame: local, fps, config: {damping: 14, stiffness: 260, mass: 0.6}});
  const scale = interpolate(pop, [0, 1], [0.78, 1]) * (cur.key ? 1.18 : 1);
  const vertical = height > width;
  const fs = size ?? (vertical ? 92 : 78);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${y * 100}%`,
          transform: `translate(0, -50%) scale(${scale})`,
          textAlign: 'center',
          fontFamily,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: cur.key ? '#F2A93B' : '#FFFFFF',
          textShadow: outline(fs * 0.075) + `, 0 ${fs * 0.1}px 0 #14161C, 0 ${fs * 0.14}px ${fs * 0.3}px rgba(0,0,0,0.5)`,
          padding: '0 60px',
        }}
      >
        {cur.w}
      </div>
    </AbsoluteFill>
  );
};

/** helper: split a narration line into caption chunks over [from, to) frames (weighted by length, like speech).
 *  Mark key words with *asterisks* (may span words: "*2 AM.*").
 *  Chunking matches the research (1.3 words per caption): one content word per caption; short function words
 *  (<= 3 letters: "on a", "the") ride along with the next word; punctuation ends a chunk. */
export const timeLine = (text: string, from: number, to: number, perChunk = 3): Word[] => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const chunks: {w: string; key: boolean}[] = [];
  let buf: string[] = [];
  let key = false;
  const flush = () => {
    if (buf.length) chunks.push({w: buf.join(' '), key});
    buf = [];
    key = false;
  };
  let inKey: string[] | null = null;
  for (const tk of tokens) {
    // *key words* may span several tokens: "*2 AM.*"
    if (inKey || tk.startsWith('*')) {
      inKey = inKey ?? [];
      inKey.push(tk.replace(/\*/g, ''));
      if (/\*[.,!?]?$/.test(tk) && !(tk === '*' && inKey.length === 1)) {
        flush();
        chunks.push({w: inKey.join(' '), key: true});
        inKey = null;
      }
      continue;
    }
    const clean = tk;
    buf.push(clean);
    const content = clean.replace(/[^A-Za-z0-9']/g, '').length > 3;
    if (content || buf.length >= perChunk || /[.,!?]$/.test(clean)) flush();
  }
  flush();
  // weight chunk durations by characters (longer words stay longer, like speech)
  const weights = chunks.map((c) => 2 + c.w.length);
  const total = weights.reduce((a, b) => a + b, 0);
  let t = from;
  return chunks.map((c, i) => {
    const out = {t: Math.round(t), w: c.w, key: c.key};
    t += ((to - from) * weights[i]) / total;
    return out;
  });
};
