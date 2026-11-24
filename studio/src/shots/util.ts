import {Easing, interpolate} from 'remotion';

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** eased camera push: zoom from `a` to `b` across the whole shot */
export const push = (frame: number, frames: number, a: number, b: number) =>
  interpolate(frame, [0, frames], [a, b], {...CLAMP, easing: Easing.inOut(Easing.quad)});

/** 0..1 ramp between two frames */
export const ramp = (frame: number, f0: number, f1: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [f0, f1], [0, 1], {...CLAMP, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
