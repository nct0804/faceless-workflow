/**
 * Look-dev for the merged "Ink & Ember" style: two shots in Mo's bedroom at night (9:16 and 16:9).
 *   A  wide establishing, slow push-in + drift (RicksClips: the camera never stops)
 *   B  close-up, phone-lit face, lamp bokeh behind (our amber, their depth)
 */
import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Easing, interpolate, Series, useCurrentFrame} from 'remotion';
import {Ambient, Moonlight, Practical, Stage} from '../kit3d/Stage';
import {SetView, useSet, v3} from '../kit3d/Set';
import {blinkAt, Character, POSES} from '../kit3d/Character';
import {Dust, GlowCard, LightShaft} from '../kit3d/fx';
import {Captions, timeLine} from '../kit3d/Captions';
import {glow} from '../kit3d/materials';

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp3 = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i] - x) * t) as [number, number, number];

const PHONE = glow('#BFD3FF', 1.5);
const Phone: React.FC<{pos: [number, number, number]; tilt?: number; yaw?: number}> = ({pos, tilt = -20, yaw = 0}) => (
  <group position={pos} rotation={[(tilt * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ']}>
    <mesh castShadow>
      <boxGeometry args={[0.075, 0.14, 0.012]} />
      <meshBasicMaterial color="#14161C" />
    </mesh>
    <mesh position={[0, 0, 0.0065]} material={PHONE} userData={{noInk: true}}>
      <planeGeometry args={[0.066, 0.128]} />
    </mesh>
  </group>
);

// Mo sits on the bed edge, 3/4 toward camera, holding the phone low
const MO_POS: [number, number, number] = [0.85, 0.13, -0.85];
const MO_YAW = 13;

const fwd = (d: number): [number, number] => [Math.sin((MO_YAW * Math.PI) / 180) * d, Math.cos((MO_YAW * Math.PI) / 180) * d];
const PHONE_AT: [number, number, number] = [MO_POS[0] + fwd(0.3)[0], MO_POS[1] + 0.74, MO_POS[2] + fwd(0.3)[1]];
const PHONE_LIGHT: [number, number, number] = [MO_POS[0] + fwd(0.5)[0], MO_POS[1] + 1.02, MO_POS[2] + fwd(0.45)[1]];
const WIN: [number, number, number] = [-0.95, 1.6, -2.62];
const MOON: [number, number, number] = [-2.48, 2.2, -5.6];

const Bedroom: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const set = useSet('bedroom');
  const lamp = set?.marks.LIGHT_lamp;
  return (
    <>
      <SetView set={set} hide={['ceiling']} />
      <Ambient intensity={1} />
      <Moonlight from={[-2.0, 4.6, -9.5]} to={[0.3, 0, -0.2]} intensity={1.8} />
      <LightShaft from={WIN} to={[-0.1, 0.0, 0.9]} r0={0.62} r1={1.15} square opacity={0.11} color="#8FA8FF" />
      <Dust center={[-0.4, 1.0, -0.9]} size={[1.6, 1.8, 2.6]} count={220} color="#CFDCFF" opacity={0.55} />
      <Dust center={[0.25, 0.95, -2.2]} size={[0.8, 0.8, 0.8]} count={60} color="#FFD9A0" opacity={0.7} seed={3} />
      <mesh position={MOON} userData={{noInk: true}}>
        <circleGeometry args={[0.28, 48]} />
        <meshBasicMaterial color={new THREE.Color('#E9EEF8').multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      <GlowCard at={MOON} size={2.4} color="#9FB4FF" opacity={0.5} />
      {lamp && <Practical at={v3(lamp)} color="#FFB45E" intensity={5} distance={6} />}
      {children}
    </>
  );
};

export const SHOT_A = 90;
const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  const t = ease(Math.min(1, f / SHOT_A));
  const pos = lerp3([1.85, 1.15, 2.9], [1.55, 1.05, 2.2], t);
  const target = lerp3([0.05, 1.1, -2.0], [0.15, 1.05, -1.9], t);
  return (
    <AbsoluteFill>
      <Stage background="#141A2E" fog={['#141A2E', 4, 14]} cam={{pos, target, fov: 50}} post={{aperture: 0.5, focusAt: [MO_POS[0], 1.2, MO_POS[2]], bloom: 0.8}}>
        <Bedroom>
          <Character id="mo" position={MO_POS} rotation={MO_YAW}
            pose={{...POSES.holdPhone, sit: 1, slump: 0.35, breathe: f * 0.09}}
            face={{mood: 'worried', lookY: -0.8, blink: blinkAt(f)}} />
          <Phone pos={PHONE_AT} tilt={-50} yaw={MO_YAW + 180} />
          {/* wide: no phone fill (it hot-spots the face at this size); the glow reads from the screen itself */}
        </Bedroom>
      </Stage>
      <Captions words={timeLine('It was *2 AM.* He checked again.', 6, SHOT_A)} />
    </AbsoluteFill>
  );
};

export const SHOT_B = 75;
const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const t = ease(Math.min(1, f / SHOT_B));
  const head = [MO_POS[0] + fwd(0.1)[0], MO_POS[1] + 1.22, MO_POS[2] + fwd(0.1)[1]];
  const pos = lerp3([head[0] + 0.45, head[1] - 0.05, head[2] + 2.5], [head[0] + 0.32, head[1] - 0.08, head[2] + 2.1], t);
  return (
    <AbsoluteFill>
      <Stage background="#141A2E" fog={['#141A2E', 4, 14]} cam={{pos, target: [head[0] - 0.05, head[1] - 0.12, head[2]], fov: 32, shake: 0.006}}
        post={{aperture: 2.0, focusAt: head as [number, number, number], maxBlur: 26, bloom: 0.7, bloomThreshold: 1.05}}>
        <Bedroom>
          <Character id="mo" position={MO_POS} rotation={MO_YAW}
            pose={{...POSES.holdPhone, sit: 1, slump: 0.35, breathe: f * 0.09}}
            face={{mood: f > 40 ? 'sad' : 'worried', lookY: -0.8, blink: blinkAt(f, 70), tears: f > 40 ? Math.min(1, (f - 40) / 30) : 0}} />
          <Phone pos={PHONE_AT} tilt={-50} yaw={MO_YAW + 180} />
          <Practical at={PHONE_LIGHT} color="#9DB8FF" intensity={0.12}
            distance={1.0} shadow={false} />
        </Bedroom>
      </Stage>
      <Captions words={timeLine('*9 likes.*', 10, SHOT_B)} />
    </AbsoluteFill>
  );
};

export const LOOKTEST_FRAMES = SHOT_A + SHOT_B;
export const LookTest: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={SHOT_A}>
      <ShotA />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SHOT_B}>
      <ShotB />
    </Series.Sequence>
  </Series>
);
