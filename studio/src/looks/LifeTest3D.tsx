/** Ambient life test (3D sets): locked cameras, so everything that moves is the set's own life (kit3d/Set.tsx).
 *  Render: bin/render.sh LifeTest3D _lookdev draft */
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Stage} from '../kit3d/Stage';
import {BEDROOM, Bedroom, Island} from '../kit3d/envs';

const SEG = 120;
type V3 = [number, number, number];
const SHOTS: {label: string; pos: V3; target: V3; fov: number; el: React.ReactNode; bg: string}[] = [
  {label: 'bedroom day', pos: [0.6, 1.45, 1.9], target: [-0.6, 1.25, -2.4], fov: 62, el: <Bedroom time="day" lamp={0.4} />, bg: BEDROOM.bg},
  {label: 'bedroom night', pos: [0.6, 1.45, 1.9], target: [-0.6, 1.25, -2.4], fov: 62, el: <Bedroom lamp={1} />, bg: BEDROOM.bg},
  {label: 'dinner island', pos: [0.4, 1.7, 2.6], target: [0, 1.1, -0.6], fov: 50, el: <Island name="dinner" />, bg: '#1E1A28'},
  {label: 'class island', pos: [-6.6, 1.6, 3.2], target: [-7.2, 1.1, 0], fov: 55, el: <Island name="class" />, bg: '#1A2236'},
];
export const LIFETEST3D_FRAMES = SHOTS.length * SEG;

export const LifeTest3D: React.FC = () => (
  <AbsoluteFill>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={i * SEG} durationInFrames={SEG}>
        <Stage background={s.bg} cam={{pos: s.pos, target: s.target, fov: s.fov, shake: 0}} post={{aperture: 0, bloom: 0.5}}>
          {s.el}
        </Stage>
        <div style={{position: 'absolute', left: 40, top: 32, fontSize: 44, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 18px', borderRadius: 12, fontFamily: 'sans-serif'}}>{s.label}</div>
      </Sequence>
    ))}
  </AbsoluteFill>
);
