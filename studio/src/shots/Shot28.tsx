// Shot 28 — 1:19, 3.0 s. Grid repetition: the refresh shot tiled 4×6, each a different time.
// Tiles pop in 2 frames apart.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Rect} from '../kit/three';
import {FONT, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {BedroomAtNight} from './Shot27';
import {CLAMP} from './util';

export const SHOT28_FRAMES = 90;

const COLS = 6;
const ROWS = 4;
const TW = 1920 / COLS;
const TH = 1080 / ROWS;
const S = 0.27;

const timeAt = (i: number) => {
  const m = 52 + i * 6; // minutes after 1:00
  return `${1 + Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

export const Shot28: React.FC = () => {
  const frame = useCurrentFrame();
  const tiles = Array.from({length: COLS * ROWS}, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const t0 = i * 2;
    const pop = interpolate(frame, [t0, t0 + 4], [0, 1], CLAMP);
    return {i, col, row, pop, x: -960 + TW * (col + 0.5), y: 540 - TH * (row + 0.5)};
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#030407'}}>
      <Scene>
        {tiles.map((t) =>
          t.pop <= 0 ? null : (
            <group key={t.i} position={[t.x, t.y, 0]} scale={[S * (0.9 + 0.1 * t.pop), S * (0.9 + 0.1 * t.pop), 1]}>
              <Rect w={TW / S - 24} h={TH / S - 24} z={-100} color="#0C0E14" />
              <group position={[0, 60, 0]}>
                <BedroomAtNight time={timeAt(t.i)} />
              </group>
              {/* night dimming per tile (the phone glow sits above it) */}
              <Rect w={TW / S - 24} h={TH / S - 24} z={30} color="#000000" opacity={0.62} />
            </group>
          ),
        )}
      </Scene>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {tiles.map((t) =>
          t.pop <= 0 ? null : (
            <div
              key={t.i}
              style={{
                position: 'absolute',
                left: t.col * TW + 18,
                top: (t.row + 1) * TH - 40,
                fontFamily: FONT,
                fontSize: 22,
                color: '#9AA3B5',
                opacity: t.pop,
              }}
            >
              {timeAt(t.i)} AM · <span style={{color: C.amber}}>9 likes</span>
            </div>
          ),
        )}
      </AbsoluteFill>
      <PostFX vignette={0.6} amber={0.12} />
      <Hud likes={9} drawings={41} opacity={0.9} />
    </AbsoluteFill>
  );
};
