/** Cast sheet (v3, RicksClips proportions): lively poses + expressions, front-lit. Render: remotion still CharTest */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Ambient, Moonlight, Practical, Stage} from '../kit3d/Stage';
import {Character, type Pose} from '../kit3d/Character';
import type {Mood} from '../kit3d/face';

type V3 = [number, number, number];
type Row = {id: 'mo' | 'theo' | 'lia' | 'dex' | 'crowd'; pose: Pose; mood: Mood; rot?: number; reach?: (x: number) => {L?: V3; R?: V3}; look?: number};

// hands on hips / chin are IK targets (relative to the character's x)
const hips = (x: number): {L: V3; R: V3} => ({L: [x + 0.19, 0.58, 0.03], R: [x - 0.19, 0.58, 0.03]});
const CAST: Row[] = [
  {id: 'mo', pose: {legL: 4, legR: 4}, mood: 'happy'},
  {id: 'mo', pose: {armR: 150, elbowR: 25, headTilt: -8, legL: 6, kneeL: 12, hipShift: 0.03}, mood: 'excited'},
  {id: 'mo', pose: {headTilt: 10, legL: 7, legR: 3, kneeR: 14, hipShift: -0.03}, mood: 'smug', reach: hips, rot: -18},
  {id: 'mo', pose: {slump: 0.8, headNod: 10}, mood: 'gloom'},
  {id: 'mo', pose: {armL: 35, armR: 35, elbowL: 80, elbowR: 80, headTilt: 6}, mood: 'nervous', rot: 12},
  {id: 'theo', pose: {headTilt: -8, legL: 4, legR: 4}, mood: 'thinking', reach: (x) => ({R: [x - 0.02, 0.97, 0.2]})},
  {id: 'lia', pose: {armL: 140, armR: 140, elbowL: 20, elbowR: 20, legL: 10, legR: 10}, mood: 'laugh'},
  {id: 'dex', pose: {legL: 8, legR: 8, kneeL: 10, headTilt: 7}, mood: 'smirk', reach: hips, rot: 15},
  {id: 'crowd', pose: {legL: 3, legR: 3}, mood: 'neutral'},
];

export const CharTest: React.FC = () => (
  <AbsoluteFill>
    <Stage cam={{pos: [0, 0.95, 8.4], target: [0, 0.72, 0], fov: 26, shake: 0}} background="#2A3350"
      post={{aperture: 0, bloom: 0.4, ink: 1, vignette: 0.2}}>
      <Ambient intensity={0.7} />
      <Moonlight from={[3, 6, 6]} to={[0, 0, 0]} color="#FFFFFF" intensity={1.8} size={8} />
      <Practical at={[-3, 2, 2]} color="#FFB45E" intensity={3} distance={8} shadow={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#3B4566" />
      </mesh>
      {CAST.map((p, i) => {
        const x = (i - 4) * 0.78;
        return (
          <Character key={i} id={p.id} position={[x, 0, 0]} rotation={p.rot ?? 0} pose={p.pose} face={{mood: p.mood}}
            reach={p.reach?.(x)} alive={0} />
        );
      })}
    </Stage>
  </AbsoluteFill>
);
