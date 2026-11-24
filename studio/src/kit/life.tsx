/**
 * Ambient life for the flat (16:9 long) kit: nothing in a set stands perfectly still.
 * Every backdrop object gets a small, slow, deterministic motion (a pure function of the frame), so renders are
 * repeatable and parallel-safe:
 *   - hanging / pinned things sway from their pin (drawings, posters, pennants, towels, banners, pendant lamps)
 *   - plants breathe leaf by leaf, string lights sag and twinkle, clock second hands tick
 *   - window skies drift (clouds, birds by day; stars and a breathing moon by night), city windows switch on and off
 *   - dust motes float in every room, lamps breathe, fluorescent lights flicker now and then
 * Scale it per shot with <Scene life={0.4}> (0 = fully still). The rock-bottom hold keeps it low (0.3), not zero:
 * the room still breathes while Mo doesn't.
 */
import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import {ellipse, Flat} from './three';

export const LifeCtx = createContext(1);

/** seconds, frame and the shot's life amount */
export const useLife = () => {
  const f = useCurrentFrame();
  const k = useContext(LifeCtx);
  return {t: f / 30, f, k};
};

import {breeze, hash, TAU} from './wave';
export {breeze, hash};

/** a light that breathes softly; fluorescent: true adds a rare quick double-flicker */
export const flicker = (t: number, seed = 0, depth = 0.05, fluorescent = false) => {
  let v = 1 - depth * (0.5 + 0.5 * breeze(t, 0.5, seed));
  if (fluorescent) {
    const slot = Math.floor(t / 2.5);
    if (hash(slot + seed * 13) > 0.72) {
      const p = t - slot * 2.5;
      if ((p > 0.4 && p < 0.47) || (p > 0.55 && p < 0.6)) v *= 0.55;
    }
  }
  return v;
};

/**
 * Rotates its children about a pivot (x, y): children are drawn relative to the pivot.
 * amp in radians (0.01 ≈ 0.6°). Things pinned at the top hang below the pivot (negative y).
 */
export const Sway: React.FC<{x: number; y: number; z?: number; amp: number; speed?: number; seed?: number; base?: number; children: React.ReactNode}> = ({
  x,
  y,
  z = 0,
  amp,
  speed = 0.22,
  seed = 0,
  base = 0,
  children,
}) => {
  const {t, k} = useLife();
  return (
    <group position={[x, y, z]} rotation={[0, 0, base + amp * k * breeze(t, speed, seed)]}>
      {children}
    </group>
  );
};

/** floating dust motes, drifting up and sideways; wrap around inside the box */
export const Motes: React.FC<{n?: number; x?: number; y?: number; w?: number; h?: number; z?: number; color?: string; opacity?: number; seed?: number}> = ({
  n = 28,
  x = 0,
  y = 150,
  w = 2600,
  h = 1100,
  z = -91,
  color = '#FFF3D9',
  opacity = 0.32,
  seed = 1,
}) => {
  const {t, k} = useLife();
  if (k <= 0) return null;
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const r = (j: number) => hash(i * 7.31 + j * 1.93 + seed * 17.7);
        const sp = 9 + 16 * r(1); // px per second upward
        const yy = ((r(2) * h + t * sp * k) % h) - h / 2;
        const xx = (r(3) - 0.5) * w + 22 * Math.sin(t * (0.2 + 0.3 * r(4)) + r(5) * TAU);
        const edge = Math.min(1, (h / 2 - Math.abs(yy)) / 140);
        const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + r(6)) + r(7) * TAU);
        const s = 2.5 + 3.5 * r(8);
        return <Flat key={i} shape={ellipse(s, s)} color={color} opacity={Math.max(0, opacity * edge * tw * Math.min(1, k))} position={[x + xx, y + yy, z]} />;
      })}
    </group>
  );
};

/** a small V-shaped bird crossing a window (day skies) */
export const Bird: React.FC<{x: number; y: number; flap: number; color?: string; s?: number}> = ({x, y, flap, color = '#2B2F3A', s = 1}) => {
  const a = 0.35 + 0.35 * Math.sin(flap);
  return (
    <group position={[x, y, 0]} scale={[s, s, 1]}>
      <group rotation={[0, 0, a]}>
        <Flat shape={ellipse(9, 1.6)} color={color} position={[-8, 0, 0]} />
      </group>
      <group rotation={[0, 0, -a]}>
        <Flat shape={ellipse(9, 1.6)} color={color} position={[8, 0, 0]} />
      </group>
    </group>
  );
};
