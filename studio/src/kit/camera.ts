/**
 * Camera moves for the flat (16:9 long) kit. Pure functions of the frame → a `Cam` you pass to <Scene cam={...}>.
 * Long videos keep the calm first-film style: slow, smooth moves that react to the story (see docs/VIDEO_TYPES.md).
 *
 *   const cam = camMove(frame, FRAMES, 'pan-right', {from: {x: -300}, to: {x: 200, zoom: 1.06}, handheld: 0.4});
 *   <Scene cam={withWhip(cam, frame, FRAMES, {out: 'right'})}> ... </Scene>
 *
 * World units = px at zoom 1. Moves start already in motion (no dead ease-in at the cut) unless ease: 'inOut'.
 * Wrap far/near layers in <Depth k> (kit/scene.tsx) for parallax: k < 1 is far (sky, distant city), k > 1 is near.
 */
import {Easing, interpolate} from 'remotion';

export type Cam = {zoom: number; x: number; y: number; roll: number; blurX: number; blurY: number};
export type CamPoint = Partial<Pick<Cam, 'zoom' | 'x' | 'y' | 'roll'>>;
export type CamKey = CamPoint & {at: number};
export type CamEase = 'in-motion' | 'inOut' | 'out' | 'linear';

export const CAM0: Cam = {zoom: 1, x: 0, y: 0, roll: 0, blurX: 0, blurY: 0};
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const EASE: Record<CamEase, (t: number) => number> = {
  // starts with speed (the shot cuts in on a moving camera), lands softly
  'in-motion': Easing.bezier(0.22, 0.45, 0.3, 1),
  inOut: Easing.inOut(Easing.cubic),
  out: Easing.out(Easing.cubic),
  linear: (t) => t,
};

/** keyframed path: [{at: 0, x: -200}, {at: 60, x: 0, zoom: 1.1}, ...]. Missing values carry over from the previous key. */
export const camPath = (frame: number, keys: CamKey[], ease: CamEase = 'in-motion'): Cam => {
  const full: (Cam & {at: number})[] = [];
  let prev: Cam = CAM0;
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    prev = {...prev, ...k};
    full.push({...prev, at: k.at});
  }
  if (full.length === 0) return CAM0;
  if (full.length === 1 || frame <= full[0].at) return {...full[0], blurX: 0, blurY: 0};
  const i = Math.max(0, full.findIndex((k) => k.at > frame) - 1);
  if (i < 0 || frame >= full[full.length - 1].at) return {...full[full.length - 1], blurX: 0, blurY: 0};
  const a = full[i];
  const b = full[i + 1];
  // only the first segment starts "in motion"; later segments ease both ends so they chain smoothly
  const e = EASE[i === 0 ? ease : ease === 'linear' ? 'linear' : 'inOut'];
  const t = e(interpolate(frame, [a.at, b.at], [0, 1], CLAMP));
  const L = (p: number, q: number) => p + (q - p) * t;
  return {zoom: L(a.zoom, b.zoom), x: L(a.x, b.x), y: L(a.y, b.y), roll: L(a.roll, b.roll), blurX: 0, blurY: 0};
};

/** gentle hand-held drift (px / radians). amount 1 ≈ ±6 px, ±0.15°. Deterministic per seed. */
export const handheld = (frame: number, amount = 1, seed = 0): CamPoint => {
  if (!amount) return {};
  const t = frame / 30 + seed * 7.31;
  const n = (f: number, p: number) => Math.sin(t * f + p);
  return {
    x: amount * (3.6 * n(0.71, 0.3) + 2.0 * n(1.37, 1.9) + 0.8 * n(2.9, 4.1)),
    y: amount * (2.8 * n(0.53, 2.2) + 1.6 * n(1.21, 0.7) + 0.6 * n(3.3, 5.3)),
    roll: amount * 0.0026 * (n(0.43, 1.1) + 0.5 * n(1.07, 3.7)),
  };
};

export type Move =
  | 'hold' // locked off, no drift (rock bottom: one held, silent shot)
  | 'push' // slow push-in
  | 'pull' // slow pull-out (isolation, the world getting bigger)
  | 'pan-left'
  | 'pan-right'
  | 'tilt-up'
  | 'tilt-down'
  | 'reveal' // starts tight on `from`, pulls out wide to `to` (show what was around him)
  | 'drift' // nearly still, hand-held breathing only
  | 'settle'; // lands on the frame with a tiny overshoot (end of a whip, a beat landing)

export type MoveOpts = {
  from?: CamPoint;
  to?: CamPoint;
  /** scales the default travel (1 = calm long-film default) */
  amount?: number;
  /** hand-held drift on top (0 = locked). Default 0.35 for long videos; 'hold' forces 0 */
  handheld?: number;
  seed?: number;
  ease?: CamEase;
  /** frames the move takes (default: the whole shot) */
  over?: [number, number];
};

const DEFAULTS: Record<Move, (a: number) => [CamPoint, CamPoint]> = {
  hold: () => [{}, {}],
  drift: () => [{}, {}],
  push: (a) => [{zoom: 1}, {zoom: 1 + 0.06 * a}],
  pull: (a) => [{zoom: 1 + 0.08 * a}, {zoom: 1}],
  'pan-left': (a) => [{x: 160 * a, zoom: 1.05}, {x: -160 * a, zoom: 1.05}],
  'pan-right': (a) => [{x: -160 * a, zoom: 1.05}, {x: 160 * a, zoom: 1.05}],
  'tilt-up': (a) => [{y: -120 * a, zoom: 1.05}, {y: 120 * a, zoom: 1.05}],
  'tilt-down': (a) => [{y: 120 * a, zoom: 1.05}, {y: -120 * a, zoom: 1.05}],
  reveal: (a) => [{zoom: 1 + 0.5 * a}, {zoom: 1}],
  settle: (a) => [{zoom: 1 + 0.03 * a, x: 24 * a}, {zoom: 1}],
};

/** one named move across the shot. Options override the start (`from`) and end (`to`) framing. */
export const camMove = (frame: number, frames: number, move: Move, o: MoveOpts = {}): Cam => {
  const [d0, d1] = DEFAULTS[move](o.amount ?? 1);
  const [f0, f1] = o.over ?? [0, frames];
  const a = {...d0, ...o.from};
  const b = {...(move === 'hold' || move === 'drift' ? a : {}), ...d1, ...o.to};
  let cam: Cam;
  if (move === 'settle') {
    // overshoot past the target by 12% of the travel, then settle (back-out ease)
    const t = interpolate(frame, [f0, f1], [0, 1], {...CLAMP, easing: Easing.out(Easing.back(1.6))});
    const A = {...CAM0, ...a};
    const B = {...CAM0, ...b};
    const L = (p: number, q: number) => p + (q - p) * t;
    cam = {zoom: L(A.zoom, B.zoom), x: L(A.x, B.x), y: L(A.y, B.y), roll: L(A.roll, B.roll), blurX: 0, blurY: 0};
  } else {
    cam = camPath(frame, [{at: f0, ...a}, {at: f1, ...b}], o.ease ?? 'in-motion');
  }
  const hh = move === 'hold' ? 0 : o.handheld ?? 0.35;
  return addCam(cam, handheld(frame, hh, o.seed ?? 0));
};

/** add offsets (x, y, roll add; zoom multiplies) */
export const addCam = (c: Cam, d: CamPoint & {blurX?: number; blurY?: number}): Cam => ({
  zoom: c.zoom * (d.zoom ?? 1),
  x: c.x + (d.x ?? 0),
  y: c.y + (d.y ?? 0),
  roll: c.roll + (d.roll ?? 0),
  blurX: c.blurX + (d.blurX ?? 0),
  blurY: c.blurY + (d.blurY ?? 0),
});

export type WhipDir = 'left' | 'right' | 'up' | 'down';
export type WhipOpts = {
  /** whip into this shot: the camera arrives travelling in this direction */
  in?: WhipDir;
  /** whip out of this shot: the camera leaves travelling in this direction */
  out?: WhipDir;
  /** frames of the whip on each side of the cut (default 6, i.e. 12 frames across the cut) */
  len?: number;
  /** travel in px at the cut (default 1500) */
  dist?: number;
};

const DIR: Record<WhipDir, [number, number]> = {left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1]};

/**
 * Whip pan across a cut, for montages. Put `out: 'right'` on shot A and `in: 'right'` on shot B:
 * A accelerates away with directional blur, B arrives from the other side and lands.
 * The blur is a cheap directional blur (no extra render cost), not sampled motion blur.
 */
export const withWhip = (c: Cam, frame: number, frames: number, o: WhipOpts): Cam => {
  const len = o.len ?? 6;
  const dist = o.dist ?? 1500;
  let out = c;
  const push = (dir: WhipDir, t: number) => {
    const [dx, dy] = DIR[dir];
    const blur = 70 * Math.min(1, Math.abs(t) * 1.6);
    out = addCam(out, {x: (dx * dist * t) / c.zoom, y: (dy * dist * t) / c.zoom, blurX: dx ? blur : 0, blurY: dy ? blur : 0});
  };
  if (o.in && frame < len) {
    // arrive: from -1 (behind the frame) to 0, fast then landing
    const t = interpolate(frame, [0, len], [1, 0], {...CLAMP, easing: Easing.out(Easing.cubic)});
    push(o.in, -t);
  }
  if (o.out && frame >= frames - len) {
    const t = interpolate(frame, [frames - len, frames - 1], [0, 1], {...CLAMP, easing: Easing.in(Easing.cubic)});
    push(o.out, t);
  }
  return out;
};

/** focus pull: returns [farBlur, nearBlur] in px for two stacked <Scene> layers, moving focus from near to far */
export const rackFocus = (frame: number, f0: number, f1: number, max = 14, toFar = true): [number, number] => {
  const t = interpolate(frame, [f0, f1], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const far = max * (toFar ? 1 - t : t);
  const near = max * (toFar ? t : 1 - t);
  return [far, near];
};
