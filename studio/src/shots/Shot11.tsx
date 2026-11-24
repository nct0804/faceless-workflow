// Shot 11 — 0:30, 2.5 s. POV phone, thumb hovers over "Delete post?".  B: "delete it."
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {drawDeleteDialog, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Desk, Room, Window} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push, ramp} from './util';

export const SHOT11_FRAMES = 75;
const PW = 420;
const PH = 860;

export const PovBackdrop: React.FC = () => (
  <Scene zoom={1.3} camY={-60} blur={18}>
    <Room />
    <Window x={-520} y={140} />
    <Desk x={0} w={900} topY={FLOOR_Y + 170} />
    <Darkness dark={0.95} lights={[{x: -468, y: 202, r: 220, strength: 0.4}]} />
  </Scene>
);

export const Shot11: React.FC = () => {
  const frame = useCurrentFrame();
  const reach = ramp(frame, 8, 52);
  const hover = ramp(frame, 40, 56);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawDeleteDialog(ctx, w, h, {likes: 3, hover}));
  const phoneY = 40 + Math.sin(frame / 20) * 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT11_FRAMES, 1.0, 1.03)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.03} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} reach={reach} />
        <Darkness dark={0.84} lights={[{x: 0, y: phoneY, r: 760, strength: 1.25, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} amber={ramp(frame, 10, 60) * 0.12} />
      <Hud likes={3} drawings={41} opacity={0.9} />
      <Caption text="delete it." voice="crowd" from={14} to={SHOT11_FRAMES} x="73%" y="30%" />
    </AbsoluteFill>
  );
};
