/** every expression of the face system on a RicksClips-style white head (review sheet) */
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {drawFace, MOODS, type FaceState} from '../kit3d/face';
import {CAPTION_FONT} from '../kit3d/Captions';

const Head: React.FC<{f: FaceState; size: number}> = ({f, size}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    drawFace(ctx, f);
  });
  return (
    <div style={{width: size, height: size * 1.06, borderRadius: '48% 48% 46% 46%', background: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #F4F2EE 55%, #D9D6D0 100%)', border: `${size * 0.035}px solid #16181E`, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
      <canvas ref={ref} width={512} height={512} style={{position: 'absolute', left: 0, top: size * 0.03, width: size, height: size}} />
    </div>
  );
};

export const FaceSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#2A3352', padding: 36, flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignContent: 'flex-start'}}>
    {MOODS.map((m) => (
      <div key={m} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 172}}>
        <Head f={{mood: m}} size={150} />
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 24, color: '#F4F1EA', marginTop: 6}}>{m}</div>
      </div>
    ))}
  </AbsoluteFill>
);
