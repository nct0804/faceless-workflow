/** Camera kit test (flat, 16:9): every move in kit/camera.ts on one bedroom set. Render: bin/render.sh CamTest _lookdev draft */
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Bed, Desk, DeskLamp, Room, Window} from '../kit/sets';
import {Hero} from '../kit/characters';
import {ellipse, Flat} from '../kit/three';
import {FONT, PostFX} from '../kit/overlay';
import {Depth, Scene} from '../kit/scene';
import {camMove, rackFocus, withWhip, type Cam, type Move, type MoveOpts, type WhipOpts} from '../kit/camera';
import {FilmShot, type FilmPlan} from '../kit/film';

const PLAN: FilmPlan = {1: ['bedroom', 'warm']};
const SCRIPT: [number, 'warm'][] = [[0, 'warm']];

const Leaves: React.FC = () => (
  <group position={[620, FLOOR_Y + 60, 30]}>
    {[[-40, 0, 0.5], [30, 60, -0.4], [-10, 140, 0.2], [60, -40, -0.9], [-80, 90, 0.9]].map(([x, y, r], i) => (
      <group key={i} position={[x, y, 0]} rotation={[0, 0, r]}>
        <Flat shape={ellipse(70, 180)} color="#1C2A22" />
      </group>
    ))}
  </group>
);

const Set: React.FC<{cam: Cam; depth?: boolean; mood?: 'content' | 'thinking' | 'gloom' | 'happy'}> = ({cam, depth, mood = 'content'}) => (
  <Scene cam={cam}>
    <Room />
    <Window x={-520} y={120} />
    <Bed x={560} />
    <Desk x={-60} />
    <DeskLamp x={-230} baseY={FLOOR_Y + 186} on={1} coneBottomY={FLOOR_Y + 186} />
    <Hero x={-20} y={FLOOR_Y} standing mood={mood} lookX={0.2} />
    {depth && (
      <Depth k={1.6}>
        <Leaves />
      </Depth>
    )}
  </Scene>
);

type Seg = {label: string; frames: number; move: Move; o?: MoveOpts; whip?: WhipOpts; depth?: boolean; mood?: 'content' | 'thinking' | 'gloom' | 'happy'};
const SEGS: Seg[] = [
  {label: 'push  (slow push-in)', frames: 75, move: 'push', o: {to: {zoom: 1.12, y: 40}}},
  {label: 'pull  (isolation)', frames: 75, move: 'pull', o: {from: {zoom: 1.35, y: 60}}, mood: 'gloom'},
  {label: 'pan-right', frames: 75, move: 'pan-right', o: {from: {x: -500}, to: {x: 260}}},
  {label: 'reveal  (tight on Mo → wide)', frames: 75, move: 'reveal', o: {from: {zoom: 2.4, x: -20, y: 80}}},
  {label: 'tilt-up', frames: 60, move: 'tilt-up', o: {from: {y: -160}, to: {y: 120}}},
  {label: 'whip out →', frames: 40, move: 'drift', o: {to: {zoom: 1.1}}, whip: {out: 'right'}},
  {label: '→ whip in + settle', frames: 50, move: 'settle', o: {to: {zoom: 1.1, x: 300}, from: {zoom: 1.14, x: 330}}, whip: {in: 'right'}, mood: 'happy'},
  {label: 'parallax  (foreground k 1.6)', frames: 75, move: 'pan-left', o: {from: {x: 420, zoom: 1.15}, to: {x: 0, zoom: 1.2}}, depth: true},
  {label: 'drift  (hand-held only)', frames: 60, move: 'drift', o: {to: {zoom: 1.08}}, mood: 'thinking'},
  {label: 'hold  (rock bottom: locked)', frames: 60, move: 'hold', o: {to: {zoom: 1.05}}, mood: 'gloom'},
];
export const CAMTEST_FRAMES = SEGS.reduce((a, s) => a + s.frames, 0) + 75;

const SegShot: React.FC<{s: Seg}> = ({s}) => {
  const f = useCurrentFrame();
  let cam = camMove(f, s.frames, s.move, s.o);
  if (s.whip) cam = withWhip(cam, f, s.frames, s.whip);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Set cam={cam} depth={s.depth} mood={s.mood} />
      <PostFX />
      <Label text={s.label} />
    </AbsoluteFill>
  );
};

/** rack focus: two stacked layers, focus moves from the foreground leaves to Mo */
const Rack: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camMove(f, 75, 'drift', {to: {zoom: 1.2, x: 150}});
  const [far, near] = rackFocus(f, 15, 50, 12, true);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene cam={cam} blur={far}>
        <Room />
        <Window x={-520} y={120} />
        <Bed x={560} />
        <Desk x={-60} />
        <DeskLamp x={-230} baseY={FLOOR_Y + 186} on={1} coneBottomY={FLOOR_Y + 186} />
        <Hero x={-20} y={FLOOR_Y} standing mood="relieved" lookX={0.2} />
      </Scene>
      <Scene cam={cam} blur={near}>
        <Depth k={1.6}>
          <Leaves />
        </Depth>
      </Scene>
      <PostFX />
      <Label text="rack focus  (leaves → Mo)" />
    </AbsoluteFill>
  );
};

const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 40, top: 32, fontFamily: FONT, fontSize: 44, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 18px', borderRadius: 12}}>
    {text}
  </div>
);

export const CamTest: React.FC = () => {
  let at = 0;
  return (
    <FilmShot shot={1} start={0} plan={PLAN} script={SCRIPT}>
      {SEGS.map((s, i) => {
        const from = at;
        at += s.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={s.frames}>
            <SegShot s={s} />
          </Sequence>
        );
      })}
      <Sequence from={at} durationInFrames={75}>
        <Rack />
      </Sequence>
    </FilmShot>
  );
};
