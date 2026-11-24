// Shot 8 — 0:20, 4.0 s. Classroom. Dex scrolls, stops, turns the phone to his friends.
// D (Dex): "who still draws dragons lol"   Cam: push 3%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Person} from '../kit/characters';
import {Chalkboard, Desk, FloorShadow, PendantLamp, Room} from '../kit/sets';
import {Phone} from '../kit/props';
import {drawPostScreen, useCanvasTexture} from '../kit/canvas';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT08_FRAMES = 120;

export const Shot08: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const zoom = interpolate(frame, [0, SHOT08_FRAMES], [1.05, 1.08], {easing: Easing.inOut(Easing.quad)});
  const turn = interpolate(frame, [38, 52], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lean = interpolate(frame, [46, 62], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const laughing = frame > 64;
  const bounce = (k: number) => (laughing ? Math.abs(Math.sin((frame + k) / 4)) * 0.6 : 0);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawPostScreen(ctx, w, h, {likes: 3, pop: 0}));

  const deskTop = FLOOR_Y + 150;
  const dexX = 0;
  const phoneX = interpolate(turn, [0, 1], [dexX + 120, dexX + 200]);
  const phoneY = interpolate(turn, [0, 1], [deskTop + 120, deskTop + 175]);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={zoom} camX={120} camY={-20}>
        <Room />
        <Chalkboard x={-460} y={150} />
        <FloorShadow x={150} w={800} />
        <Person
          {...CAST.dex}
          x={dexX}
          y={deskTop - 30}
          mood={turn < 0.5 ? 'neutral' : laughing ? 'laugh' : 'smirk'}
          lookX={interpolate(turn, [0, 1], [0.6, 1])}
          lookY={interpolate(turn, [0, 1], [-0.9, 0])}
          armR={interpolate(turn, [0, 1], [55, 76])}
          bounce={bounce(2) * 0.5}
          blinkOffset={11}
        />
        <Person {...CAST.friendA} x={370 - lean * 30} y={FLOOR_Y} standing bodyTilt={lean * 6} mood={laughing ? 'laugh' : 'neutral'} lookX={-0.8} lookY={-0.5} bounce={bounce(5)} blinkOffset={47} />
        <Person {...CAST.friendB} x={560 - lean * 40} y={FLOOR_Y} standing bodyTilt={lean * 8} mood={laughing ? 'laugh' : 'neutral'} lookX={-1} lookY={-0.4} bounce={bounce(9)} blinkOffset={71} />
        <Desk x={dexX} w={400} topY={deskTop} />
        <Phone x={phoneX} y={phoneY} w={66} h={136} rotation={interpolate(turn, [0, 1], [0.5, -0.15])} screen={screen} glow={0.5} z={26} />
        <PendantLamp x={140} shadeY={430} on={1} coneBottomY={deskTop} />
        <Darkness
          dark={0.9}
          lights={[
            {x: 160, y: deskTop + 140, r: 560, strength: 1.15, squash: 1.05},
            {x: phoneX, y: phoneY, r: 220, strength: 0.5},
            {x: -460, y: 150, r: 380, strength: 0.25},
          ]}
        />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={3} drawings={41} opacity={0.8} />
      <Caption text="who still draws dragons lol" voice="dialogue" from={50} to={SHOT08_FRAMES} x="50%" y="26%" />
    </AbsoluteFill>
  );
};
