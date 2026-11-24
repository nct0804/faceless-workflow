// Shot 40 — 2:03.5, 3.0 s. DAY 9: Mo texts Theo "is saturday still a thing?". Instant reply: "ALWAYS."
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {drawChat, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {PovBackdrop} from './Shot11';
import {push, ramp} from './util';

export const SHOT40_FRAMES = 90;
const PW = 420;
const PH = 860;

export const Shot40: React.FC = () => {
  const frame = useCurrentFrame();
  const screen = useCanvasTexture(450, 922, (ctx, w, h) =>
    drawChat(ctx, w, h, {
      title: 'theo',
      sub: frame > 30 ? 'typing...' : 'online',
      msgs: [
        {me: false, text: 'drawing session saturday?'},
        {me: true, text: 'busy.'},
        {me: true, text: 'is saturday still a thing?'},
        {me: false, text: 'ALWAYS.'},
      ],
      msgPop: [1, 1, ramp(frame, 8, 13), ramp(frame, 50, 55)],
    }),
  );
  const phoneY = 40 + Math.sin(frame / 20) * 3;
  const tap = frame >= 6 && frame < 11 ? (frame - 6) / 5 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT40_FRAMES, 1.0, 1.03)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.02} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} thumbT={tap} reach={frame < 12 ? 0.3 : 0} />
        <Darkness dark={0.82} lights={[{x: 0, y: phoneY, r: 760, strength: 1.25, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={9} drawings={53} opacity={0.85} />
      <TimeLabel text="DAY 9" />
    </AbsoluteFill>
  );
};
