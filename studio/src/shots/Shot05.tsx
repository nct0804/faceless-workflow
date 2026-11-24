// Shot 5 — 0:10.5, 3.0 s. POV phone: his dragon post, likes tick 0 -> 3. Phone glow on hands.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {drawPostScreen, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Desk, Room, Window} from '../kit/sets';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT05_FRAMES = 90;
const TICKS = [26, 46, 62];

export const likesAt = (frame: number) => TICKS.filter((t) => frame >= t).length;
const popAt = (frame: number) =>
  TICKS.reduce((m, t) => (frame >= t ? Math.max(m, Math.exp(-(frame - t) / 4)) : m), 0);

const PW = 420;
const PH = 860;

export const Shot05: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SHOT05_FRAMES], [1.0, 1.02], {easing: Easing.inOut(Easing.quad)});
  const likes = likesAt(frame);
  const pop = popAt(frame);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawPostScreen(ctx, w, h, {likes, pop}));
  const phoneY = 40 + Math.sin(frame / 20) * 4;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.3} camY={-60} blur={18}>
        <Room />
        <Window x={-520} y={140} />
        <Desk x={0} w={900} topY={FLOOR_Y + 170} />
        <Darkness dark={0.95} lights={[{x: -468, y: 202, r: 220, strength: 0.4}]} />
      </Scene>
      <Scene zoom={zoom}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.03} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} />
        <Darkness dark={0.82} lights={[{x: 0, y: phoneY, r: 760, strength: 1.25, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={likes} drawings={41} opacity={0.9} />
    </AbsoluteFill>
  );
};
