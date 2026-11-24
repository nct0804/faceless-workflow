import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/PatrickHand';
import {C} from '../theme';
import {useFilm} from './film';

const {fontFamily, waitUntilDone} = loadFont();
export const FONT = fontFamily;
export const fontsLoaded = waitUntilDone();

/** vignette + film grain + optional amber anxiety grade (0..1) */
export const PostFX: React.FC<{amber?: number; vignette?: number; grain?: number}> = ({
  amber = 0,
  vignette: vig = 0.85,
  grain = 0.07,
}) => {
  let vignette = vig;
  const frame = useCurrentFrame();
  const film = useFilm();
  if (film) vignette = vignette * film.vign;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {film && (
        // the colour script grade: brightness / saturation on everything below, plus a soft mood tint
        <AbsoluteFill style={{backdropFilter: `brightness(${film.brightness}) saturate(${film.saturate * 1.04}) contrast(1.1)`}} />
      )}
      {film && <AbsoluteFill style={{backgroundColor: film.tint, mixBlendMode: 'soft-light', opacity: film.tintK * 2.5}} />}
      {amber > 0 && (
        <AbsoluteFill style={{backgroundColor: C.amber, mixBlendMode: 'multiply', opacity: amber * 0.7}} />
      )}
      {amber > 0 && (
        <AbsoluteFill style={{backgroundColor: C.amber, mixBlendMode: 'overlay', opacity: amber * 0.25}} />
      )}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 35%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: grain, mixBlendMode: 'screen'}}>
        <filter id={`grain-${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 997} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

type Voice = 'narrator' | 'crowd' | 'dialogue';

/** caption that fades in over 6 frames; `from`/`to` are frames relative to the shot */
export const Caption: React.FC<{
  text: string;
  voice?: Voice;
  from: number;
  to: number;
  x?: string;
  y?: string;
  size?: number;
}> = ({text, voice = 'narrator', from, to, x, y, size}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const opacity = interpolate(frame, [from, from + 6, to - 5, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: FONT,
    opacity,
    whiteSpace: 'pre',
    transform: 'translate(-50%, -50%)',
    left: x ?? '50%',
    top: y ?? (voice === 'narrator' ? '88%' : '30%'),
  };
  if (voice === 'narrator')
    return <div style={{...base, color: '#F3EFE6', fontSize: size ?? 46, textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{text}</div>;
  if (voice === 'crowd')
    return (
      <div style={{...base, color: C.amber, fontSize: size ?? 44, textShadow: `0 0 14px ${C.amber}99, 0 2px 6px #000`}}>
        {text}
      </div>
    );
  return (
    <div
      style={{
        ...base,
        color: '#F3EFE6',
        fontSize: size ?? 30,
        background: 'rgba(20,22,30,0.85)',
        padding: '6px 18px',
        borderRadius: 22,
      }}
    >
      {text}
    </div>
  );
};

/** scoreboard HUD top-left: LIKES / DRAWINGS */
export const Hud: React.FC<{likes?: number | null; drawings?: number; opacity?: number}> = ({
  likes,
  drawings,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      top: 52,
      fontFamily: FONT,
      fontSize: 30,
      lineHeight: '38px',
      color: '#CBD2E0',
      opacity,
      letterSpacing: 2,
    }}
  >
    {likes !== null && likes !== undefined && (
      <div>
        LIKES <span style={{color: C.amber, textShadow: `0 0 10px ${C.amber}88`}}>{likes.toLocaleString('en-US')}</span>
      </div>
    )}
    {drawings !== undefined && (
      <div>
        DRAWINGS <span style={{color: '#F3EFE6'}}>{drawings}</span>
      </div>
    )}
  </div>
);

/** small time stamp in the corner: "WEEK 1", "1:48 AM" (bottom-right by default) */
export const TimeLabel: React.FC<{text: string; corner?: 'br' | 'tc'; from?: number}> = ({text, corner = 'br', from = 0}) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  const style: React.CSSProperties =
    corner === 'br'
      ? {position: 'absolute', right: 70, bottom: 54}
      : {position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)'};
  return (
    <div style={{...style, fontFamily: FONT, fontSize: 34, letterSpacing: 4, color: '#CBD2E0', textShadow: '0 2px 6px #000'}}>
      {text}
    </div>
  );
};

/** camera-flash: white frame that decays over `len` frames from `at` */
export const Flash: React.FC<{at: number; len?: number; strength?: number}> = ({at, len = 6, strength = 0.85}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + len) return null;
  const o = strength * (1 - (frame - at) / len);
  return <AbsoluteFill style={{backgroundColor: '#FFFFFF', opacity: o, pointerEvents: 'none'}} />;
};

/** viewfinder corners for "photo" shots */
export const Viewfinder: React.FC = () => {
  const c: React.CSSProperties = {position: 'absolute', width: 70, height: 70, borderColor: 'rgba(240,240,240,0.8)', borderStyle: 'solid'};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...c, left: 120, top: 100, borderWidth: '5px 0 0 5px'}} />
      <div style={{...c, right: 120, top: 100, borderWidth: '5px 5px 0 0'}} />
      <div style={{...c, left: 120, bottom: 100, borderWidth: '0 0 5px 5px'}} />
      <div style={{...c, right: 120, bottom: 100, borderWidth: '0 5px 5px 0'}} />
    </AbsoluteFill>
  );
};

export type Whisper = {text: string; x: number; y: number; size: number; from: number; rot?: number};

/** amber crowd lines piling up; each fades in over 5 frames and keeps a slight drift */
export const Whispers: React.FC<{items: Whisper[]; fadeOutAt?: number}> = ({items, fadeOutAt}) => {
  const frame = useCurrentFrame();
  const out = fadeOutAt !== undefined ? interpolate(frame, [fadeOutAt, fadeOutAt + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((w, i) => {
        if (frame < w.from) return null;
        const o = Math.min(1, (frame - w.from) / 5) * out;
        const drift = (frame - w.from) * 0.15;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${w.x}%`,
              top: `${w.y}%`,
              transform: `translate(-50%, -50%) translateY(${-drift}px) rotate(${w.rot ?? 0}deg)`,
              fontFamily: FONT,
              fontSize: w.size,
              color: C.amber,
              opacity: o,
              whiteSpace: 'nowrap',
              textShadow: `0 0 14px ${C.amber}88, 0 2px 6px #000`,
            }}
          >
            {w.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** narrator line typed letter by letter, centered on black (closing cards) */
export const TypeText: React.FC<{text: string; from?: number; cpf?: number; size?: number; y?: string; color?: string}> = ({
  text,
  from = 0,
  cpf = 0.9,
  size = 56,
  y = '50%',
  color = '#F3EFE6',
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - from) * cpf)));
  const caret = n < text.length || Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: y,
        transform: 'translate(-50%, -50%)',
        fontFamily: FONT,
        fontSize: size,
        color,
        whiteSpace: 'pre',
      }}
    >
      {/* the full line is laid out invisibly so the text doesn't shift while typing */}
      <span>{text.slice(0, n)}</span>
      <span style={{display: 'inline-block', width: 0, overflow: 'visible', opacity: caret && frame >= from ? 0.8 : 0}}>|</span>
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </div>
  );
};
