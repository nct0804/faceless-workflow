// Shot 30 — 1:26.5, 6.0 s. Rock bottom. Silence. Mo curled on the bed, phone light on his face,
// everything else nearly black. Hold. Static, then a 1% push in the last 2 s.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Flat, roundedRect} from '../kit/three';
import {Hero} from '../kit/characters';
import {Bed, Room} from '../kit/sets';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP} from './util';

export const SHOT30_FRAMES = 180;

const BLANKET = roundedRect(400, 190, 60);

export const Shot30: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [120, SHOT30_FRAMES], [1.2, 1.212], CLAMP);
  const topY = FLOOR_Y + 150;
  // lying on his side, head on the pillow (left), phone held above his face
  return (
    <AbsoluteFill style={{backgroundColor: '#050609'}}>
      <Scene zoom={zoom} camX={-90} camY={-70}>
        <Room />
        <Bed x={0} w={640} blanketFrom={0.48} />
        <Hero x={10} y={topY + 76} z={9} rotation={90} mood="tired" lookX={0.6} armR={150} holdPhone="R" phoneGlow={0.9} blinkOffset={100} />
        {/* blanket pulled up to his shoulders */}
        <Flat shape={BLANKET} color="#2F3B5C" outline="#3D4C74" outlineWidth={3} position={[140, topY + 80, 12]} />
        <Darkness dark={0.975} lights={[{x: -195, y: -10, r: 330, strength: 1.0}]} />
      </Scene>
      <PostFX vignette={0.95} />
      <Hud likes={9} drawings={41} opacity={0.45} />
    </AbsoluteFill>
  );
};
