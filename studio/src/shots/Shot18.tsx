// Shot 18 — 0:44, 3.0 s. WEEK 6: notification "1,040 likes". Amber glow on his face.
// He almost smiles.  B: "they like this you."   Cam: push 4%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {Hero} from '../kit/characters';
import {drawNotification, useCanvasTexture} from '../kit/canvas';
import {Phone} from '../kit/props';
import {RingLight, Room} from '../kit/sets';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, push, ramp} from './util';

export const SHOT18_FRAMES = 90;

export const Shot18: React.FC = () => {
  const frame = useCurrentFrame();
  const card = ramp(frame, 4, 12);
  const glow = ramp(frame, 8, 42);
  const likes = Math.round(interpolate(frame, [6, 22], [640, 1040], CLAMP));
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawNotification(ctx, w, h, {likes: 1040, card}));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.5} camX={200} camY={60} blur={16}>
        <Room />
        <RingLight x={500} on={0.7} />
        <Darkness dark={0.92} lights={[{x: 500, y: FLOOR_Y + 420, r: 400, strength: 0.6}]} />
      </Scene>
      <Scene zoom={push(frame, SHOT18_FRAMES, 1.0, 1.04)}>
        <Hero x={-140} y={-540} scale={2.5} mood={frame > 58 ? 'smirk' : 'neutral'} lookX={0.7} lookY={-0.5} breathe />
        <Glow x={-60} y={100} z={46} size={900} color={C.amber} intensity={0.32 * glow} />
        <Phone x={430} y={-210} w={330} h={680} rotation={-0.18} screen={screen} glow={0.35} z={30} />
        <Darkness dark={0.78} lights={[{x: 200, y: 0, r: 820, strength: 1.15}]} />
      </Scene>
      <PostFX vignette={0.9} amber={0.06 + glow * 0.08} />
      <Hud likes={likes} drawings={41} opacity={0.9} />
      <TimeLabel text="WEEK 6" />
      <Caption text="they like this you." voice="crowd" from={44} to={SHOT18_FRAMES} x="30%" y="20%" />
    </AbsoluteFill>
  );
};
