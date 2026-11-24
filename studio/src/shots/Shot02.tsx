// Shot 2 — 0:03, 2.5 s. Top-down insert on the wood desk: sketchbook "MO · AGE 10",
// the hand draws a dragon.   Cam: push 2%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {DRAGON, drawPaper, drawStrokes, strokeTip, useCanvasTexture} from '../kit/canvas';
import {DrawingHand, OpenSketchbook, WoodSurface} from '../kit/props';
import {FONT, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT02_FRAMES = 75;

const PAGE_W = 460;
const PAGE_H = 600;
const CW = 920;
const CH = 1200;
const BOX = {x: 40, y: 120, w: 840, h: 1000};

export const Shot02: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, SHOT02_FRAMES], [0.3, 0.74]);
  const zoom = interpolate(frame, [0, SHOT02_FRAMES], [1.0, 1.02], {easing: Easing.inOut(Easing.quad)});

  const right = useCanvasTexture(CW, CH, (ctx, w, h) => {
    drawPaper(ctx, w, h);
    drawStrokes(ctx, DRAGON, p, BOX, {color: '#2A2A30', width: 9});
  });
  const left = useCanvasTexture(CW, CH, (ctx, w, h) => {
    drawPaper(ctx, w, h);
    ctx.fillStyle = '#2A2A30';
    ctx.font = `86px ${FONT}`;
    ctx.fillText('MO  ·  AGE 10', 90, 170);
    ctx.font = `56px ${FONT}`;
    ctx.fillStyle = '#5A5A66';
    ctx.fillText('dragons i will draw:', 90, 330);
    ['fire one', 'ice one', 'a BIG one'].forEach((t, i) => ctx.fillText(`- ${t}`, 120, 430 + i * 90));
    // little star doodle
    ctx.strokeStyle = '#C8743A';
    ctx.lineWidth = 7;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      const x = 690 + Math.cos(a) * 70;
      const y = 900 + Math.sin(a) * 70;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
  });

  // pen tip: page canvas coords -> world coords (right page center is at x = PAGE_W/2)
  const [u, v] = strokeTip(DRAGON, p);
  const cu = (BOX.x + u * BOX.w) / CW;
  const cv = (BOX.y + v * BOX.h) / CH;
  const tipX = cu * PAGE_W;
  const tipY = PAGE_H / 2 - cv * PAGE_H;
  const wobble = Math.sin(frame / 2.2) * 0.04;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={zoom} camX={120}>
        <WoodSurface />
        <OpenSketchbook x={0} y={0} pageW={PAGE_W} pageH={PAGE_H} right={right} left={left} />
        <DrawingHand tipX={tipX} tipY={tipY} angle={-0.7 + wobble} />
        <Darkness dark={0.88} lights={[{x: 180, y: 120, r: 900, strength: 1.25, squash: 1.1}]} />
        <Glow x={420} y={420} z={46} size={1700} sy={0.9} color={C.lamp} intensity={0.13} />
      </Scene>
      <PostFX vignette={0.9} />
    </AbsoluteFill>
  );
};
