// Shots 53–57: closing cards on black (2:50–3:20).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT, PostFX, TypeText} from '../kit/overlay';
import {CLAMP} from './util';

export const SHOT53_FRAMES = 150;
export const SHOT54_FRAMES = 150;
export const SHOT55_FRAMES = 120;
export const SHOT56_FRAMES = 180;
export const SHOT57_FRAMES = 300;

const Black: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: '#050609'}}>
    {children}
    <PostFX vignette={0.6} grain={0.05} />
  </AbsoluteFill>
);

/** 2:50 — N: "Nobody is watching as closely as you think." typed letter by letter */
export const Shot53: React.FC = () => (
  <Black>
    <TypeText text="Nobody is watching as closely as you think." from={12} cpf={0.9} />
  </Black>
);

/** 2:55 — N: "So stop performing. Start living." */
export const Shot54: React.FC = () => (
  <Black>
    <TypeText text="So stop performing. Start living." from={12} cpf={0.75} />
  </Black>
);

/** 3:00 — title card, small */
export const Shot55: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Black>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: FONT,
          fontSize: 62,
          letterSpacing: 10,
          color: '#F3EFE6',
          opacity: interpolate(frame, [6, 16], [0, 1], CLAMP),
          whiteSpace: 'nowrap',
        }}
      >
        NOBODY IS WATCHING.
      </div>
    </Black>
  );
};

/** 3:04 — our twist on the CTA */
export const Shot56: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Black>
      <div style={{position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%, -50%)', textAlign: 'center', fontFamily: FONT, whiteSpace: 'nowrap'}}>
        <div style={{fontSize: 52, color: '#F3EFE6', opacity: interpolate(frame, [6, 16], [0, 1], CLAMP)}}>Only like this if it actually hit you.</div>
        <div style={{fontSize: 32, color: '#9AA3B5', marginTop: 26, opacity: interpolate(frame, [34, 44], [0, 1], CLAMP)}}>subscribe for more short films.</div>
      </div>
    </Black>
  );
};

/** 3:10 — end screen: two slots for YouTube's end-screen video elements */
export const Shot57: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15], [0, 1], CLAMP);
  const slot: React.CSSProperties = {
    position: 'absolute',
    top: 330,
    width: 640,
    height: 360,
    borderRadius: 18,
    border: '3px solid rgba(203,210,224,0.25)',
    background: 'rgba(20,24,33,0.6)',
    opacity: o,
  };
  return (
    <Black>
      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 34, letterSpacing: 4, color: '#9AA3B5', opacity: o}}>
        watch next
      </div>
      <div style={{...slot, left: 250}} />
      <div style={{...slot, right: 250}} />
    </Black>
  );
};
