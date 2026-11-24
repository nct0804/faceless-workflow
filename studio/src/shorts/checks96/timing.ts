/** Timing from the voice-over (vo.json, made by audio/vo/make_vo.py): every cut and caption is anchored to a
 *  spoken word, so re-recording the VO re-times the whole short. */
import vo from './vo.json';
import type {Word} from '../../kit3d/Captions';

export const FPS = 30;
type VoWord = {w: string; key: boolean; t0: number; t1: number};
type VoLine = {id: string; t0: number; t1: number; words: VoWord[]};
const LINES = (vo as {lines: VoLine[]}).lines;
const byId = Object.fromEntries(LINES.map((l) => [l.id, l]));

const f = (t: number) => Math.round(t * FPS);
/** first frame of line `id` */
export const L = (id: string) => f(byId[id].t0);
/** last spoken frame of line `id` */
export const Lend = (id: string) => f(byId[id].t1);
/** frame where word `w` (n-th occurrence, punctuation ignored) starts in line `id` */
export const W = (id: string, w: string, n = 1) => {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  let k = 0;
  for (const x of byId[id].words) if (norm(x.w) === norm(w) && ++k === n) return f(x.t0);
  throw new Error(`word ${w} not in ${id}`);
};
export const VO_END = f((vo as {duration: number}).duration);

/** caption chunks for the whole short (RicksClips grammar: one content word per caption, short function words
 *  ride with the next word, key words amber). Chunks start on the spoken word. */
export const captionWords = (): Word[] => {
  const out: Word[] = [];
  for (const l of LINES) {
    let buf: VoWord[] = [];
    const flush = () => {
      if (!buf.length) return;
      out.push({t: f(buf[0].t0) - 1, w: buf.map((b) => b.w).join(' '), key: buf.some((b) => b.key)});
      buf = [];
    };
    for (let i = 0; i < l.words.length; i++) {
      const x = l.words[i];
      const prevKey = buf.length > 0 && buf[buf.length - 1].key;
      if (buf.length && x.key !== prevKey) flush(); // key runs stay together ("spotlight effect.")
      buf.push(x);
      const content = x.w.replace(/[^A-Za-z0-9']/g, '').length > 3;
      const nextKey = l.words[i + 1]?.key;
      const end = /[.,!?]$/.test(x.w);
      if (x.key ? end || !nextKey : content || end || buf.length >= 3) flush();
    }
    flush();
    // clear the caption in the gap after the line
    out.push({t: f(l.t1) + 4, w: ''});
  }
  return out;
};
