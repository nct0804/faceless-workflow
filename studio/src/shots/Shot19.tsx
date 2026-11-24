// Shot 19 — 0:47, 4.0 s. Phone POV: Theo texts "drawing session saturday?". Mo types "busy."
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {drawChat, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {PovBackdrop} from './Shot11';
import {push, ramp} from './util';

export const SHOT19_FRAMES = 120;
const PW = 420;
const PH = 860;
const KEYS = [46, 54, 62, 71, 80]; // b-u-s-y-.
const SEND = 96;

export const Shot19: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = 'busy.'.slice(0, KEYS.filter((k) => frame >= k).length);
  const sent = frame >= SEND;
  const tap = [...KEYS, SEND].map((k) => (frame >= k && frame < k + 5 ? (frame - k) / 5 : 0)).reduce((a, b) => Math.max(a, b), 0);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) =>
    drawChat(ctx, w, h, {
      title: 'theo',
      sub: 'online',
      msgs: [
        {me: false, text: 'drawing session saturday?'},
        {me: true, text: 'busy.'},
      ],
      msgPop: [ramp(frame, 8, 13), sent ? 1 : 0],
      typing: frame < 34 ? undefined : sent ? '' : typed,
      caret: Math.floor(frame / 8) % 2 === 0,
    }),
  );
  const phoneY = 40 + Math.sin(frame / 20) * 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT19_FRAMES, 1.0, 1.03)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.02} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} thumbT={tap} reach={frame >= 40 ? 0.35 : 0} />
        <Darkness dark={0.84} lights={[{x: 0, y: phoneY, r: 760, strength: 1.25, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={1040} drawings={41} opacity={0.9} />
    </AbsoluteFill>
  );
};
