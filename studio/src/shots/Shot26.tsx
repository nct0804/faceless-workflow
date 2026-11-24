// Shot 26 — 1:11.5, 3.5 s. Group chat POV: "saturday session" photo of Theo + friends drawing.
// Mo isn't in it.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {drawChat, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {PovBackdrop} from './Shot11';
import {CLAMP, push, ramp} from './util';

export const SHOT26_FRAMES = 105;
const PW = 420;
const PH = 860;

export const Shot26: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [8, 80], [0, 170], {...CLAMP});
  const screen = useCanvasTexture(450, 922, (ctx, w, h) =>
    drawChat(ctx, w, h, {
      title: 'saturday session',
      sub: 'theo, nico, sam',
      msgs: [
        {me: false, from: 'theo', text: 'first saturday session!!'},
        {me: false, from: 'theo', text: '', photo: true},
        {me: false, from: 'nico', text: 'same time next week'},
        {me: false, from: 'sam', text: 'best one yet'},
      ],
      msgPop: [1, 1, ramp(frame, 44, 50), ramp(frame, 70, 76)],
      scroll,
    }),
  );
  const phoneY = 40 + Math.sin(frame / 20) * 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT26_FRAMES, 1.02, 1.05)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={-0.02} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} />
        <Darkness dark={0.86} lights={[{x: 0, y: phoneY, r: 760, strength: 1.2, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
    </AbsoluteFill>
  );
};
