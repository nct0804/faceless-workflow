/** Character sheet: rig poses, outline, faces. Front view, neutral light. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Ambient, Moonlight, Practical, Stage} from '../kit3d/Stage';
import {Character, type Pose} from '../kit3d/Character';
import type {Mood} from '../kit3d/face';

const POSES: {pose: Pose; mood: Mood; id?: 'mo' | 'theo' | 'lia' | 'dex' | 'crowd'; rot?: number}[] = [
  {pose: {fwdL: 25, fwdR: 25, armL: -10, armR: -10, elbowL: 70, elbowR: 70}, mood: 'neutral'},
  {pose: {fwdL: 30, fwdR: 30, armL: -18, armR: -18, elbowL: 80, elbowR: 80}, mood: 'neutral', rot: -35},
  {pose: {fwdL: 20, fwdR: 20, armL: -25, armR: -25, elbowL: 90, elbowR: 90}, mood: 'neutral', rot: -70},
  {pose: {fwdL: 35, fwdR: 35, armL: -12, armR: -12, elbowL: 95, elbowR: 95, headNod: 18}, mood: 'worried', rot: 0},
  {pose: {fwdL: 35, fwdR: 35, armL: -12, armR: -12, elbowL: 95, elbowR: 95, headNod: 18}, mood: 'worried', rot: -70},
  {pose: {sit: 1, fwdL: 30, fwdR: 30, armL: -18, armR: -18, elbowL: 80, elbowR: 80}, mood: 'shock', rot: -20},
  {pose: {armR: 100, elbowR: 70, headTilt: 10}, mood: 'smirk', id: 'theo'},
  {pose: {armL: 40, armR: 40}, mood: 'happy', id: 'lia'},
  {pose: {}, mood: 'neutral', id: 'crowd'},
];

export const CharTest: React.FC = () => (
  <AbsoluteFill>
    <Stage cam={{pos: [0, 1.0, 9.5], target: [0, 0.85, 0], fov: 28, shake: 0}} background="#2A3350"
      post={{aperture: 0, bloom: 0.5, ink: 1}}>
      <Ambient intensity={0.6} />
      <Moonlight from={[3, 6, 6]} to={[0, 0, 0]} color="#FFFFFF" intensity={1.6} size={8} />
      <Practical at={[-3, 2, 2]} color="#FFB45E" intensity={4} distance={8} shadow={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#3B4566" />
      </mesh>
      {POSES.map((p, i) => (
        <Character key={i} id={p.id ?? 'mo'} position={[(i - 4) * 0.95, p.pose.sit ? 0.0 : 0, 0]} rotation={p.rot ?? 0}
          pose={p.pose} face={{mood: p.mood}} />
      ))}
    </Stage>
  </AbsoluteFill>
);
