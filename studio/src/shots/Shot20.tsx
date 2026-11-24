// Shot 20 — 0:51, 4.0 s. Kitchen. Lia holds up a new drawing (a dragon, like his).
// Mo doesn't look up from the phone.  D (Mo): "cool."  Lia's arm drops slowly.  Cam: push 3%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, PendantLamp, Room} from '../kit/sets';
import {Counter, Fridge, TexturePlane} from '../kit/props';
import {DRAGON, drawPaper, drawStrokes, useCanvasTexture} from '../kit/canvas';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {lerp, push, ramp} from './util';

export const SHOT20_FRAMES = 120;

/** Lia's crayon copy of Mo's dragon */
export const useLiaDragon = () =>
  useCanvasTexture(420, 520, (ctx, w, h) => {
    drawPaper(ctx, w, h, '#EFE7D4');
    drawStrokes(ctx, DRAGON, 1, {x: 20, y: 60, w: w - 40, h: h - 120}, {color: '#5E8A4E', width: 12});
  });

export const Kitchen: React.FC = () => (
  <>
    <Room wallTop="#262230" wallBottom="#17151D" />
    <Fridge x={-560} />
    <Counter x={330} w={980} />
  </>
);

export const Shot20: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = ramp(frame, 62, 116);
  const drawing = useLiaDragon();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT20_FRAMES, 1.04, 1.07)} camX={-20} camY={-60}>
        <Kitchen />
        <FloorShadow x={-40} w={520} />
        <Hero x={-190} y={FLOOR_Y} standing mood="neutral" lookX={0.4} lookY={-1} armR={28} holdPhone="R" />
        <Person
          {...CAST.lia}
          x={100}
          y={FLOOR_Y}
          scale={0.72}
          standing
          mood={frame > 70 ? 'sad' : 'happy'}
          lookX={-0.7}
          lookY={lerp(0.3, -0.5, drop)}
          armL={lerp(-140, -25, drop)}
          armR={15}
          headTilt={lerp(0, 6, drop)}
        />
        <TexturePlane tex={drawing} w={170} h={212} x={lerp(-20, 40, drop)} y={lerp(14, -170, drop)} z={14} rotation={lerp(0.06, 0.35, drop)} />
        <PendantLamp x={-30} shadeY={440} on={1} coneBottomY={FLOOR_Y} />
        <Darkness dark={0.82} tint="#08070B" lights={[{x: -30, y: FLOOR_Y + 260, r: 620, strength: 1.2}]} />
      </Scene>
      <PostFX vignette={0.88} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
      <Caption text="cool." voice="dialogue" from={40} to={104} x="30%" y="27%" />
    </AbsoluteFill>
  );
};
