/**
 * Ready-lit environments: a set + its lighting recipe (MERGED_STYLE.md section 3), reusable in every video.
 *   <BedroomNight lamp moon shaft>   Mo's room at night: warm lamp practical, moon key + window shaft + dust
 *   <StadiumNight spot floods>       the arena in Mo's head: one hard spotlight on centre court, floodlight towers
 *   <Island name="class|dinner|shower">  vignette islands in the navy void (montage beats)
 * Each also exports its useful points (MO_BED, DESK, ...) in three.js coordinates.
 */
import React from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {Ambient, Moonlight, Practical} from './Stage';
import {SetView, useSet, v3} from './Set';
import {Dust, GlowCard, LightShaft, SkyDome} from './fx';
import {useGrade} from './mood';

export type V3 = [number, number, number];

// ---------------------------------------------------------------- bedroom (assets/blender/sets/bedroom.py)
export const BEDROOM = {
  bg: '#141A2E',
  fog: ['#141A2E', 4, 14] as [string, number, number],
  /** Mo sitting on the bed edge, 3/4 to camera (yaw 13) */
  moBed: [0.85, 0.13, -0.85] as V3,
  moBedYaw: 13,
  /** Mo on the desk chair, facing the desk (-Z) */
  moDesk: [-1.0, 0.05, -1.5] as V3,
  moDeskYaw: 180,
  deskTop: 0.787,
  /** desk centre (front edge z = -1.8) */
  desk: [-0.95, 0.787, -2.15] as V3,
  door: [-1.8, 0, 0.5] as V3,
  window: [-0.95, 1.6, -2.62] as V3,
  moon: [-2.48, 2.2, -5.6] as V3,
  lamp: [0.2, 0.88, -2.3] as V3,
  /** cutaway for desk shots (camera behind the back wall, looking at Mo's face): pass as ghost */
  deskCutaway: ['wall_back', 'window', 'curtain', 'sky', 'building', 'citywin', 'moon', 'skirting_back', 'drawing'],
  clock: [0.33, 0.59, -2.22] as V3, // alarm clock on the nightstand (front face at z ~ -2.19)
};

/** Mo's room at any time of day. Light colours/strengths follow the colour script (useGrade), so a shot only says
 *  WHEN it is; HOW it feels comes from the mood. day: sun through the window, blue sky, warm shaft. night: moon + lamp */
export const Bedroom: React.FC<{
  time?: 'day' | 'night';
  lamp?: number; // 0..1 lamp practical
  moon?: number; // key strength (sun or moon)
  shaft?: number;
  dust?: boolean;
  hide?: string[];
  ghost?: string[];
  children?: React.ReactNode;
}> = ({time = 'night', lamp = 1, moon = 1, shaft = 1, dust = true, hide = ['ceiling'], ghost, children}) => {
  const set = useSet('bedroom');
  const g = useGrade();
  const lp = set?.marks.LIGHT_lamp;
  const B = BEDROOM;
  const day = time === 'day';
  const recolor = day
    ? {TOON_plain_nightsky: '#8EC8FF', TOON_plain_skyline: '#7A93BE', GLOW_citywin: '#5E7090', GLOW_moon: '#A8D2FF'}
    : undefined;
  return (
    <>
      <SetView set={set} hide={hide} ghost={ghost} recolor={recolor} />
      <Ambient color={g.ambient} intensity={g.ambientK} />
      <Moonlight from={[-2.0, 4.6, -9.5]} to={[0.3, 0, -0.2]} color={day ? g.key : '#8FA6FF'} intensity={(day ? 2.2 : 1.8) * moon * g.keyK} />
      {shaft > 0 && <LightShaft from={B.window} to={[-0.1, 0.0, 0.9]} r0={0.62} r1={1.15} square opacity={(day ? 0.16 : 0.11) * shaft} color={day ? '#FFE6B8' : '#8FA8FF'} />}
      {dust && <Dust center={[-0.4, 1.0, -0.9]} size={[1.6, 1.8, 2.6]} count={220} color={day ? '#FFF0D0' : '#CFDCFF'} opacity={0.55} />}
      {dust && <Dust center={[0.25, 0.95, -2.2]} size={[0.8, 0.8, 0.8]} count={60} color="#FFD9A0" opacity={0.7 * lamp} seed={3} />}
      {!day && (
        <>
          <mesh position={B.moon} userData={{noInk: true}}>
            <circleGeometry args={[0.28, 48]} />
            <meshBasicMaterial color={new THREE.Color('#E9EEF8').multiplyScalar(2.2)} toneMapped={false} />
          </mesh>
          <GlowCard at={B.moon} size={2.4} color="#9FB4FF" opacity={0.5} />
        </>
      )}
      {day && <GlowCard at={[-1.6, 3.2, -6]} size={4.5} color="#FFF2D0" opacity={0.65} />}
      {lp && lamp > 0 && <Practical at={v3(lp)} color="#FFB45E" intensity={5 * lamp * g.warm} distance={6} />}
      {children}
    </>
  );
};
/** back-compat */
export const BedroomNight = Bedroom;

// ---------------------------------------------------------------- stadium (assets/blender/sets/stadium.py)
export const STADIUM = {
  bg: '#10162A',
  fog: ['#10162A', 9, 34] as [string, number, number],
  center: [0, 0.02, 0] as V3,
  spot: [0, 8.6, 0] as V3,
  r0: 4.2,
  depth: 0.78,
  rise: 0.42,
  tiers: 12,
  /** point on the stands: tier t (0..11), angle a (deg, 0 = back, + = CCW from above i.e. toward -x) */
  seat: (t: number, a: number, up = 0): V3 => {
    const r = 4.2 + t * 0.78 + 0.25;
    const ar = THREE.MathUtils.degToRad(a);
    return [-Math.sin(ar) * r, 0.97 + t * 0.42 + up, -Math.cos(ar) * r];
  },
};

export const useStadium = () => useSet('stadium');

export const StadiumNight: React.FC<{
  set: ReturnType<typeof useSet>;
  spot?: number; // centre spotlight 0..1
  spotColor?: string;
  floods?: number; // floodlight towers 0..1
  ambient?: number;
  children?: React.ReactNode;
}> = ({set, spot = 1, spotColor = '#FFE2B8', floods = 0.5, ambient = 0.8, children}) => {
  const frame = useCurrentFrame();
  const g = useGrade();
  const ref = React.useRef<THREE.SpotLight>(null);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.target.position.set(0, 0, 0);
    ref.current.target.updateMatrixWorld();
  });
  const S = STADIUM;
  return (
    <>
      <SetView set={set} />
      <SkyDome top={'#' + new THREE.Color(g.bg).lerp(new THREE.Color('#070A16'), 0.6).getHexString()} horizon={g.bg}
        sunDir={[0, 0.12, -1]} sunColor={g.warm < 0.8 && g.keyK >= 1 ? '#FFB07A' : '#000000'} sunSize={3} />
      <Ambient color={g.ambient} intensity={ambient * g.ambientK} />
      {/* key from the floodlights (or the sunrise): low so the spotlight owns the frame at night */}
      <Moonlight from={[-9, 14, 10]} to={[0, 0, 0]} intensity={1.3 * floods * g.keyK} size={16} color={g.key} />
      {spot > 0 && (
        <>
          <spotLight
            ref={ref}
            position={S.spot}
            color={spotColor}
            intensity={42 * spot}
            distance={20}
            decay={1.6}
            angle={0.2}
            penumbra={0.35}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
          />
          <LightShaft from={[0, 8.6, 0]} to={[0, 0, 0]} r0={0.36} r1={1.9} opacity={0.16 * spot} color={spotColor} />
          <Dust center={[0, 3.5, 0]} size={[2.6, 6.5, 2.6]} count={260} color="#FFE6C2" opacity={0.75 * spot} seed={7} point={0.06} />
        </>
      )}
      {/* far floodlight glows */}
      {[-135, -45, 45, 135].map((a) => {
        const ar = THREE.MathUtils.degToRad(a);
        const r = 14.8;
        return <GlowCard key={a} at={[-Math.sin(ar) * r, 11.1, -Math.cos(ar) * r]} size={7} color="#DCE6FF" opacity={0.55 * floods * (0.95 + 0.05 * Math.sin(frame * 0.3 + a))} />;
      })}
      {children}
    </>
  );
};

// ---------------------------------------------------------------- vignette islands (assets/blender/sets/vignettes.py)
export const ISLANDS = {
  class: {x: -7, mo: [-7, 0.03, 0.85] as V3, light: [-8.2, 2.6, 0.6] as V3, color: '#CFE0FF', bg: '#1A2236'},
  dinner: {x: 0, mo: [-0.91, 0.04, -0.775] as V3, light: [0, 1.6, -0.25] as V3, color: '#FFB45E', bg: '#1E1A28'},
  shower: {x: 7, mo: [7.25, 0.1, -1.2] as V3, light: [7.3, 2.5, -0.4] as V3, color: '#BFE3E8', bg: '#14202A'},
};

export const Island: React.FC<{name: keyof typeof ISLANDS; children?: React.ReactNode}> = ({name, children}) => {
  const set = useSet('vignettes');
  const I = ISLANDS[name];
  const g = useGrade();
  return (
    <>
      <SetView set={set} recolor={{GLOW_daysky: '#7FA8D8'}} />
      <Ambient color={g.ambient} intensity={0.9 * g.ambientK} />
      <Practical at={I.light} color={I.color} intensity={name === 'dinner' ? 0.7 : name === 'shower' ? 1.1 : 1.6} distance={7} />
      <Moonlight from={[I.x - 4, 6, 6]} to={[I.x, 0, 0]} intensity={1.6 * g.keyK} color={g.key} size={4} />
      {children}
    </>
  );
};
