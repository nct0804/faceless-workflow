/** Ambient life test (flat, 16:9): every place with a locked camera, so all motion you see is the set's own life.
 *  Render: bin/render.sh LifeTest _lookdev draft */
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Room, Window} from '../kit/sets';
import {Hero} from '../kit/characters';
import {FONT, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {FilmShot, type FilmMood, type FilmPlan, type Loc} from '../kit/film';

const SEG = 120;
const PLACES: [Loc, FilmMood][] = [
  ['bedroom', 'warm'],
  ['bedroom', 'night'],
  ['kitchen', 'day'],
  ['classroom', 'day'],
  ['hallway', 'cool'],
  ['bathroom', 'dawn'],
  ['gym', 'bright'],
  ['street', 'night'],
  ['street', 'day'],
];
const PLAN: FilmPlan = Object.fromEntries(PLACES.map((p, i) => [i + 1, p]));
const SCRIPT: [number, FilmMood][] = PLACES.map(([, m], i) => [i * SEG, m]);
export const LIFETEST_FRAMES = PLACES.length * SEG;

export const LifeTest: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    {PLACES.map(([loc, mood], i) => (
      <Sequence key={i} from={i * SEG} durationInFrames={SEG}>
        <FilmShot shot={i + 1} start={i * SEG} plan={PLAN} script={SCRIPT}>
          <AbsoluteFill>
            <Scene zoom={0.8}>
              <Room />
              {loc === 'bedroom' && <Window x={-520} y={120} />}
              <Hero x={0} y={FLOOR_Y} standing mood="content" />
            </Scene>
            <PostFX />
            <div style={{position: 'absolute', left: 40, top: 32, fontFamily: FONT, fontSize: 44, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 18px', borderRadius: 12}}>
              {loc} · {mood}
            </div>
          </AbsoluteFill>
        </FilmShot>
      </Sequence>
    ))}
  </AbsoluteFill>
);
