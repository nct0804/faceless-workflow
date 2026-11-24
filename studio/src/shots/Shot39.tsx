// Shot 39 — 2:00.5, 3.0 s. DAY 7: Mo shows Lia a drawing of her. Lia beams.
// D (Lia): "is that me?!"  DRAWINGS 51   Cam: push 2%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, PendantLamp} from '../kit/sets';
import {TexturePlane} from '../kit/props';
import {drawPage, portrait, useCanvasTexture} from '../kit/canvas';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {Kitchen} from './Shot20';
import {push, ramp} from './util';

export const SHOT39_FRAMES = 90;
const LIA = portrait('buns');

export const Shot39: React.FC = () => {
  const frame = useCurrentFrame();
  const show = ramp(frame, 0, 14);
  const beam = frame > 18;
  const page = useCanvasTexture(420, 520, (ctx, w, h) => drawPage(ctx, w, h, LIA, 'lia', 1));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT39_FRAMES, 1.04, 1.06)} camX={-20} camY={-60}>
        <Kitchen />
        <FloorShadow x={-40} w={520} />
        <Hero x={-190} y={FLOOR_Y} standing mood="happy" lookX={0.7} lookY={0.1} armR={40 + show * 35} />
        <Person
          {...CAST.lia}
          x={120}
          y={FLOOR_Y}
          scale={0.72}
          standing
          mood={beam ? 'laugh' : 'shock'}
          lookX={-0.8}
          armL={beam ? -150 : -20}
          armR={beam ? 150 : 15}
          bounce={beam ? Math.abs(Math.sin(frame / 4)) * 0.8 : 0}
          blinkOffset={33}
        />
        <TexturePlane tex={page} w={170} h={212} x={-50 + show * 30} y={-90 + show * 40} z={14} rotation={-0.05} />
        <PendantLamp x={-30} shadeY={440} on={1} coneBottomY={FLOOR_Y} />
        <Darkness dark={0.78} tint="#08070B" lights={[{x: -30, y: FLOOR_Y + 260, r: 640, strength: 1.25}]} />
      </Scene>
      <PostFX vignette={0.85} />
      <Hud likes={9} drawings={51} opacity={0.85} />
      <TimeLabel text="DAY 7" />
      <Caption text="is that me?!" voice="dialogue" from={20} to={SHOT39_FRAMES} x="60%" y="34%" />
    </AbsoluteFill>
  );
};
