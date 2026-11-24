// Shot 7 — 0:17, 3.0 s. Kitchen. Lia holds up her crayon drawing of Mo, then they fist-bump.
// D (Lia): "look! i drew you!"  Cam: push 2%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, PendantLamp, Room} from '../kit/sets';
import {Counter, Fridge, TexturePlane} from '../kit/props';
import {drawPaper, drawStrokes, LIA_DRAWING, useCanvasTexture} from '../kit/canvas';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT07_FRAMES = 90;

export const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const ease = Easing.inOut(Easing.cubic);
  const zoom = interpolate(frame, [0, SHOT07_FRAMES], [1.04, 1.06], {easing: Easing.inOut(Easing.quad)});

  // phase A: Lia holds the paper up. phase B: paper drops, fist bump at frame 64
  const paperDrop = interpolate(frame, [46, 56], [0, 1], {...clamp, easing: ease});
  const reach = interpolate(frame, [52, 64], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const bump = interpolate(frame, [64, 66, 80], [0, 1, 0], clamp);
  const moArm = interpolate(reach, [0, 1], [12, 65]);
  const liaArmL = paperDrop < 1 ? interpolate(paperDrop, [0, 1], [-140, -20]) : interpolate(reach, [0, 1], [-20, -100]);
  const laughing = frame > 64;

  const drawing = useCanvasTexture(420, 520, (ctx, w, h) => {
    drawPaper(ctx, w, h, '#EFE7D4');
    drawStrokes(ctx, LIA_DRAWING, 1, {x: 20, y: 20, w: w - 40, h: h - 40}, {color: '#3E5C8A', width: 10});
  });

  const liaX = 100;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={zoom} camX={-20} camY={-60}>
        <Room wallTop="#262230" wallBottom="#17151D" />
        <Fridge x={-560} />
        <Counter x={330} w={980} />
        <FloorShadow x={-30} w={520} />
        <Hero x={-190} y={FLOOR_Y} standing mood={laughing ? 'laugh' : 'happy'} lookX={0.6} lookY={0.2} armR={moArm} bounce={bump * 0.6} />
        <Person
          {...CAST.lia}
          x={liaX}
          y={FLOOR_Y}
          scale={0.72}
          standing
          mood={laughing ? 'laugh' : 'happy'}
          lookX={-0.7}
          lookY={0.3}
          armL={liaArmL}
          armR={paperDrop < 1 ? 20 : 15}
          bounce={(paperDrop < 1 ? Math.abs(Math.sin(frame / 5)) * 0.5 : 0) + bump}
          blinkOffset={33}
        />
        <TexturePlane
          tex={drawing}
          w={170}
          h={212}
          x={-20}
          y={14 - paperDrop * 160}
          z={14}
          rotation={0.06 - paperDrop * 0.3}
          opacity={1 - paperDrop}
        />
        <Glow x={-27} y={-141} z={47} size={240} color={C.lamp} intensity={bump * 0.8} />
        <PendantLamp x={-30} shadeY={440} on={1} coneBottomY={FLOOR_Y} />
        <Darkness dark={0.8} tint="#08070B" lights={[{x: -30, y: FLOOR_Y + 260, r: 620, strength: 1.25, squash: 1.0}]} />
      </Scene>
      <PostFX vignette={0.85} />
      <Hud likes={3} drawings={41} opacity={0.8} />
      <Caption text="look! i drew you!" voice="dialogue" from={4} to={50} x="58%" y="34%" />
    </AbsoluteFill>
  );
};
