// Mo's desk at night: same layout as Shot01/04 so Act 3 can call back to the opening.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FLOOR_Y} from '../theme';
import {Darkness, PoolLight} from '../kit/three';
import {CAST, Hero, Mood, Person} from '../kit/characters';
import {Desk, DeskLamp, FloorShadow, Room, Sketchbook, Window} from '../kit/sets';
import {PhoneOnDesk} from '../kit/props';

export const DESK_TOP = FLOOR_Y + 170;
export const LAMP_X = 110;

export const DeskScene: React.FC<{
  mood?: Mood;
  lookX?: number;
  lookY?: number;
  /** arm angle; undefined = drawing motion */
  armR?: number;
  holdPhone?: boolean;
  phoneGlow?: number;
  phoneOnDesk?: number;
  lia?: boolean;
  occlude?: boolean;
  dark?: number;
  lamp?: number;
  extraLights?: PoolLight[];
  children?: React.ReactNode;
}> = ({mood = 'neutral', lookX = 0.8, lookY = -0.9, armR, holdPhone, phoneGlow = 1, phoneOnDesk, lia, occlude, dark = 0.94, lamp = 1, extraLights = [], children}) => {
  const frame = useCurrentFrame();
  const draw = 56 + Math.sin(frame / 2.6) * 5 + Math.sin(frame / 7) * 3;
  return (
    <>
      <Room />
      <Window x={-520} y={120} />
      {children}
      <FloorShadow x={-60} w={560} />
      <Hero
        x={lia ? -200 : -170}
        y={DESK_TOP - 30}
        mood={mood}
        lookX={lookX}
        lookY={lookY}
        armR={armR ?? draw}
        holdPhone={holdPhone ? 'R' : undefined}
        phoneGlow={phoneGlow}
        headTilt={-3}
        occlude={occlude}
      />
      {lia && (
        <Person
          {...CAST.lia}
          x={-20}
          y={DESK_TOP - 30}
          scale={0.74}
          mood="happy"
          lookX={0.7}
          lookY={-0.9}
          armR={50 + Math.sin(frame / 3.1 + 1) * 6}
          blinkOffset={23}
          occlude={occlude}
        />
      )}
      <Desk x={-60} topY={DESK_TOP} />
      <Sketchbook x={lia ? 20 : 60} y={DESK_TOP + 13} />
      {lia && <Sketchbook x={-110} y={DESK_TOP + 13} />}
      {phoneOnDesk !== undefined && <PhoneOnDesk x={-150} y={DESK_TOP + 12} on={phoneOnDesk} />}
      <DeskLamp x={LAMP_X} baseY={DESK_TOP + 8} on={lamp} coneBottomY={DESK_TOP + 8} />
      <Darkness
        dark={dark}
        lights={[
          {x: -50, y: DESK_TOP + 100, r: 580, strength: 1.3 * lamp, squash: 1.15},
          {x: LAMP_X + 48, y: DESK_TOP + 150, r: 260, strength: 0.6 * lamp},
          {x: -468, y: 182, r: 220, strength: 0.4},
          ...extraLights,
        ]}
      />
    </>
  );
};
