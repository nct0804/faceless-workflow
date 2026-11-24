import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C} from '../theme';
import {ellipse, Flat, Glow, GLOW_ORDER, roundedRect} from './three';

/* =====================================================================
   Person: capsule head + soft trapezoid body. Everyone in the film is one.
   Origin: body bottom (sitting) or feet (standing=true).
   Arm angles in degrees: 0 = hanging down, +90 = pointing right, 180 = up,
   -90 = pointing left.
   ===================================================================== */

const softBody = (bw: number, bh: number) => {
  const s = new THREE.Shape();
  s.moveTo(-bw / 2, 0);
  s.lineTo(-bw / 2 + 10, bh - 34);
  s.quadraticCurveTo(-bw / 2 + 14, bh, -bw / 2 + 46, bh);
  s.lineTo(bw / 2 - 46, bh);
  s.quadraticCurveTo(bw / 2 - 14, bh, bw / 2 - 10, bh - 34);
  s.lineTo(bw / 2, 0);
  s.closePath();
  return s;
};

const arcShape = (r: number, thick: number, a0: number, a1: number) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, a0, a1, false);
  s.absarc(0, 0, r - thick, a1, a0, true);
  return s;
};

const ring = (r: number, thick: number) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, r - thick, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
};

const bowl = (r: number) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, Math.PI, Math.PI * 2, false);
  s.closePath();
  return s;
};

// shared geometry (built once)
const S = {
  body: softBody(150, 150),
  hood: roundedRect(170, 64, 30),
  head: roundedRect(112, 136, 56),
  eye: ellipse(7, 12),
  eyeClosedHappy: arcShape(10, 4, 0.15, Math.PI - 0.15),
  arm: roundedRect(34, 112, 17),
  cast: roundedRect(42, 58, 14),
  pocket: roundedRect(80, 6, 3),
  brow: roundedRect(22, 4, 2),
  string: roundedRect(4, 22, 2),
  mouthHappy: arcShape(12, 4, Math.PI * 1.1, Math.PI * 1.9),
  mouthSad: arcShape(10, 4, Math.PI * 0.15, Math.PI * 0.85),
  mouthLaugh: bowl(15),
  mouthO: ellipse(6, 8),
  mouthFlat: roundedRect(18, 4, 2),
  glassRing: ring(19, 4),
  bridge: roundedRect(12, 4, 2),
  bun: ellipse(22, 22),
  capDome: (() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 62, 40, 0, Math.PI, false, 0);
    s.closePath();
    return s;
  })(),
  brim: roundedRect(70, 12, 6),
  leg: roundedRect(32, 96, 14),
  shoe: roundedRect(52, 20, 10),
  shades: roundedRect(32, 17, 6),
  shadesBridge: roundedRect(14, 4, 2),
  miniPhone: roundedRect(34, 62, 8),
  miniScreen: roundedRect(26, 50, 5),
};

/** 'fake' = laughing mouth, dead eyes */
export type Mood = 'neutral' | 'happy' | 'laugh' | 'shock' | 'sad' | 'smirk' | 'tired' | 'fake';
export type Accessory = 'hood' | 'glasses' | 'buns' | 'cap' | 'shades';

export type PersonProps = {
  x: number;
  y: number;
  z?: number;
  scale?: number;
  color?: string;
  shade?: string;
  mood?: Mood;
  lookX?: number;
  lookY?: number;
  armR?: number;
  armL?: number;
  /** draw arms in front of the body instead of behind */
  armsFront?: boolean;
  accessories?: Accessory[];
  capColor?: string;
  castOn?: 'L' | 'R';
  standing?: boolean;
  pants?: string;
  blinkOffset?: number;
  headTilt?: number;
  bodyTilt?: number;
  breathe?: boolean;
  /** override eye height scale (e.g. eyes widening) */
  eyeScale?: number;
  browLift?: number;
  occlude?: boolean;
  /** 0..1, small hop/pop for laughs and bumps */
  bounce?: number;
  /** whole-body rotation in degrees (90 = lying with head to the left) */
  rotation?: number;
  /** walk-cycle phase in radians (standing only); undefined = still */
  walk?: number;
  /** hand that holds a phone, with screen glow */
  holdPhone?: 'L' | 'R';
  phoneGlow?: number;
  /** seen from behind: no face, hood lies over the shoulders */
  back?: boolean;
};

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  z = 10,
  scale = 1,
  color = C.hero,
  shade = C.heroShade,
  mood = 'neutral',
  lookX = 0,
  lookY = 0,
  armR = 10,
  armL = -10,
  armsFront = false,
  accessories = [],
  capColor = '#3E7C7A',
  castOn,
  standing = false,
  pants = '#2A2F3D',
  blinkOffset = 40, // never blink on a cut (frame 0 of a shot)
  headTilt = 0,
  bodyTilt = 0,
  breathe = true,
  eyeScale,
  browLift: browLiftProp,
  occlude = false,
  bounce = 0,
  rotation = 0,
  walk,
  holdPhone,
  phoneGlow = 1,
  back = false,
}) => {
  const frame = useCurrentFrame();
  const t = frame + blinkOffset;
  const blinking = t % 96 < 4 && mood !== 'laugh';
  const breath = breathe ? Math.sin((frame + blinkOffset) / 22) * 2 : 0;
  const legLift = standing ? 92 : 0;
  const hop = bounce * 10 + (walk !== undefined ? Math.abs(Math.sin(walk)) * 5 : 0);

  const eyeBase = mood === 'shock' ? 1.3 : mood === 'sad' || mood === 'tired' || mood === 'fake' ? 0.72 : 1;
  const eyeY = blinking ? 0.12 : (eyeScale ?? eyeBase);
  const browTilt = mood === 'sad' || mood === 'tired' ? 0.25 : mood === 'shock' ? -0.05 : 0;
  const browLift = browLiftProp ?? (mood === 'shock' ? 10 : mood === 'sad' ? -2 : mood === 'laugh' ? 4 : 0);
  const hx = lookX * 10;
  const hy = lookY * 6;
  const has = (a: Accessory) => accessories.includes(a);
  const ink = C.ink;
  const armZ = armsFront ? 0.6 : -0.5;

  const arm = (side: 'L' | 'R', angle: number) => (
    <group position={[side === 'R' ? 52 : -52, 112 + breath, armZ]} rotation={[0, 0, THREE.MathUtils.degToRad(angle)]}>
      <Flat shape={S.arm} color={shade} outline={ink} position={[0, -50, 0]} />
      {castOn === side && <Flat shape={S.cast} color="#F4F1EA" outline={ink} position={[0, -72, 0.05]} />}
      {holdPhone === side && (
        <>
          <Flat shape={S.miniPhone} color="#1A1D24" outline="#3A4050" outlineWidth={2} position={[0, -112, 0.2]} />
          <Flat shape={S.miniScreen} color="#BFD2FF" opacity={0.85 * phoneGlow} position={[0, -112, 0.25]} />
          <Glow x={0} y={-112} z={36} size={260} color="#BFD2FF" intensity={0.35 * phoneGlow} />
        </>
      )}
    </group>
  );

  return (
    <group position={[x, y + hop * scale, z]} scale={[scale, scale, 1]} rotation={[0, 0, THREE.MathUtils.degToRad(rotation)]}>
      {standing &&
        ([-1, 1] as const).map((side) => {
          const swing = walk !== undefined ? Math.sin(walk + (side > 0 ? 0 : Math.PI)) * 0.42 : 0;
          return (
            <group key={side} position={[side * 30, 92, -0.3]} rotation={[0, 0, swing]}>
              <Flat shape={S.leg} color={pants} outline={ink} position={[0, -44, 0]} />
              <Flat shape={S.shoe} color="#15171D" position={[side * 4 + 6, -84, 0.1]} />
            </group>
          );
        })}
      <group position={[0, legLift, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(bodyTilt)]}>
        {arm('R', armR)}
        {arm('L', armL)}
        {has('hood') && <Flat shape={S.hood} color={shade} outline={ink} position={[0, 150 + breath * 0.6, back ? 0.15 : -0.2]} />}
        <Flat shape={S.body} color={color} outline={ink} position={[0, breath * 0.3, 0]} />
        {has('hood') && !back && (
          <>
            <Flat shape={S.pocket} color={shade} position={[0, 40 + breath * 0.3, 0.1]} />
            <Flat shape={S.string} color={shade} position={[-14, 128 + breath * 0.3, 0.1]} />
            <Flat shape={S.string} color={shade} position={[14, 128 + breath * 0.3, 0.1]} />
          </>
        )}
        {occlude && (
          <>
            <Flat shape={S.body} color="#000" occluder position={[0, breath * 0.3, 60]} />
            <Flat shape={S.head} color="#000" occluder position={[0, 210 + breath, 60]} />
          </>
        )}
        {/* head */}
        <group position={[0, 210 + breath, 0.2]} rotation={[0, 0, THREE.MathUtils.degToRad(headTilt)]}>
          {has('buns') && (
            <>
              <Flat shape={S.bun} color={shade} outline={ink} position={[-48, 58, -0.1]} />
              <Flat shape={S.bun} color={shade} outline={ink} position={[48, 58, -0.1]} />
            </>
          )}
          <Flat shape={S.head} color={color} outline={ink} />
          {!back && (
          <>
          {/* eyes */}
          {mood === 'laugh' ? (
            <>
              <Flat shape={S.eyeClosedHappy} color={ink} position={[-20 + hx, 6 + hy, 0.1]} />
              <Flat shape={S.eyeClosedHappy} color={ink} position={[20 + hx, 6 + hy, 0.1]} />
            </>
          ) : (
            <>
              <Flat shape={S.eye} color={ink} position={[-20 + hx, 8 + hy, 0.1]} scale={[1, eyeY]} />
              <Flat shape={S.eye} color={ink} position={[20 + hx, 8 + hy, 0.1]} scale={[1, eyeY]} />
            </>
          )}
          {has('shades') && (
            <>
              <Flat shape={S.shades} color="#0E0F13" position={[-21 + hx * 0.8, 8 + hy, 0.16]} />
              <Flat shape={S.shades} color="#0E0F13" position={[21 + hx * 0.8, 8 + hy, 0.16]} />
              <Flat shape={S.shadesBridge} color="#0E0F13" position={[hx * 0.8, 12 + hy, 0.16]} />
            </>
          )}
          {has('glasses') && (
            <>
              <Flat shape={S.glassRing} color={ink} position={[-21 + hx * 0.8, 8 + hy, 0.15]} />
              <Flat shape={S.glassRing} color={ink} position={[21 + hx * 0.8, 8 + hy, 0.15]} />
              <Flat shape={S.bridge} color={ink} position={[hx * 0.8, 10 + hy, 0.15]} />
            </>
          )}
          {/* brows */}
          <Flat shape={S.brow} color={ink} position={[-21 + hx, 32 + hy + browLift, 0.1]} rotation={browTilt} />
          <Flat
            shape={S.brow}
            color={ink}
            position={[21 + hx, 32 + hy + browLift + (mood === 'smirk' ? 5 : 0), 0.1]}
            rotation={-browTilt + (mood === 'smirk' ? 0.15 : 0)}
          />
          {/* mouth */}
          {mood === 'happy' && <Flat shape={S.mouthHappy} color={ink} position={[hx, -14 + hy, 0.1]} />}
          {(mood === 'laugh' || mood === 'fake') && <Flat shape={S.mouthLaugh} color={ink} position={[hx, -14 + hy, 0.1]} />}
          {mood === 'shock' && <Flat shape={S.mouthO} color={ink} position={[hx, -24 + hy, 0.1]} />}
          {mood === 'sad' && <Flat shape={S.mouthSad} color={ink} position={[hx, -34 + hy, 0.1]} />}
          {mood === 'smirk' && <Flat shape={S.mouthFlat} color={ink} position={[6 + hx, -24 + hy, 0.1]} rotation={0.25} />}
          </>
          )}
          {has('cap') && (
            <>
              <Flat shape={S.capDome} color={capColor} outline={ink} position={[0, 42, 0.3]} />
              <Flat shape={S.brim} color={capColor} outline={ink} position={[lookX >= 0 ? 46 : -46, 44, 0.32]} />
            </>
          )}
        </group>
      </group>
    </group>
  );
};

/* ---------- Mo (the hero) = Person with the hoodie ---------- */

type HeroProps = Omit<PersonProps, 'accessories' | 'armR'> & {armAngle?: number; armR?: number; extra?: Accessory[]};

export const Hero: React.FC<HeroProps> = ({armAngle, armR, extra = [], ...p}) => (
  <Person {...p} armR={armR ?? armAngle ?? 10} accessories={['hood', ...extra]} />
);

/* ---------- cast ---------- */
export const CAST = {
  theo: {color: C.sage, shade: '#6A7868', accessories: ['glasses'] as Accessory[]},
  lia: {color: '#E9D9C6', shade: '#D6C1A8', accessories: ['buns'] as Accessory[]},
  dex: {color: C.slate, shade: '#5E6A82', accessories: ['cap'] as Accessory[], capColor: '#3E7C7A'},
  friendA: {color: C.clay, shade: '#86685A', accessories: [] as Accessory[]},
  friendB: {color: '#8A8FA3', shade: '#767B8E', accessories: ['cap'] as Accessory[], capColor: '#4A4F63'},
};

/* =====================================================================
   The Bleachers: rows of faceless spectators with amber phone-eyes
   ===================================================================== */

type BleachersProps = {
  rows: number;
  perRow: number;
  /** 0..1 how much of the crowd is visible (rows fade in bottom-up) */
  reveal: number;
  /** 0..1 how many amber eyes are on (staggered) */
  eyesOn: number;
  x?: number;
  baseY: number;
  width: number;
  z?: number;
  rowGap?: number;
  seed?: number;
  /** 0..1: restless bobbing / clapping */
  excite?: number;
};

const rand = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const B = {head: roundedRect(60, 74, 30), shoulders: roundedRect(108, 70, 34), eye: roundedRect(30, 12, 3)};

export const Bleachers: React.FC<BleachersProps> = ({
  rows,
  perRow,
  reveal,
  eyesOn,
  x = 0,
  baseY,
  width,
  z = -20,
  rowGap = 120,
  seed = 1,
  excite = 0,
}) => {
  const frame = useCurrentFrame();
  const people: React.ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const rowReveal = Math.min(1, Math.max(0, reveal * rows - r));
    const y = baseY + r * rowGap;
    const zz = z - r;
    const sc = 1 - r * 0.06;
    people.push(
      <mesh key={`b${r}`} position={[x, y - 34 * sc, zz - 0.5]}>
        <planeGeometry args={[width, 10 * sc]} />
        <meshBasicMaterial color={C.crowdRim} transparent opacity={rowReveal * 0.8} />
      </mesh>,
    );
    for (let i = 0; i < perRow; i++) {
      const idx = r * perRow + i + seed * 1000;
      const px = x - width / 2 + (width / perRow) * (i + 0.5) + (r % 2 ? width / perRow / 2 : 0) * 0.5;
      const bob = Math.sin(frame / ((18 + rand(idx) * 10) / (1 + excite * 3)) + rand(idx) * 6) * (3 + excite * 9);
      const order = rand(idx + 7) * 0.9;
      const on = eyesOn > order + 0.0001 ? Math.min(1, (eyesOn - order) * 8) : 0;
      const flicker = on > 0 && rand(idx + Math.floor(frame / 3)) > 0.97 ? 0.4 : 1;
      people.push(
        <group key={`p${k++}`} position={[px, y + bob, zz]} scale={[sc, sc, 1]}>
          <Flat shape={B.shoulders} color={C.crowd} outline={C.crowdRim} outlineWidth={2} opacity={rowReveal} />
          <Flat shape={B.head} color={C.crowd} outline={C.crowdRim} outlineWidth={2} opacity={rowReveal} position={[0, 62, 0.1]} />
          {on > 0 && rowReveal > 0.2 && (
            <>
              {/* eyes sit above the Darkness layer (z=40) so they glow in the dark */}
              <Flat shape={B.eye} color={C.amber} opacity={on * flicker} position={[0, 66, 50]} renderOrder={GLOW_ORDER} />
              <Glow x={0} y={66} z={51} size={110} sy={0.6} color={C.amber} intensity={0.5 * on * flicker} renderOrder={GLOW_ORDER} />
            </>
          )}
        </group>,
      );
    }
  }
  return <group>{people}</group>;
};

/* =====================================================================
   Empty stands: seats, and phones left lying on them (amber screens)
   ===================================================================== */

export const EmptySeats: React.FC<{
  rows: number;
  perRow: number;
  width: number;
  baseY: number;
  rowGap?: number;
  z?: number;
  /** 0..1 fraction of phones still glowing (they switch off in random order) */
  phonesOn: number;
  /** 0..1 how lit the seats look */
  lit?: number;
  seed?: number;
}> = ({rows, perRow, width, baseY, rowGap = 128, z = -30, phonesOn, lit = 1, seed = 3}) => {
  const seat = new THREE.Color('#1A1F2E').lerp(new THREE.Color('#3A4460'), lit);
  const seatStr = '#' + seat.getHexString();
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y = baseY + r * rowGap;
    const sc = 1 - r * 0.06;
    const zz = z - r;
    out.push(
      <mesh key={`step${r}`} position={[0, y - 40 * sc, zz - 0.6]}>
        <planeGeometry args={[width + 200, 22 * sc]} />
        <meshBasicMaterial color={'#' + new THREE.Color('#141824').lerp(new THREE.Color('#2A3044'), lit).getHexString()} />
      </mesh>,
    );
    for (let i = 0; i < perRow; i++) {
      const idx = r * perRow + i + seed * 1000;
      const px = -width / 2 + (width / perRow) * (i + 0.5) + (r % 2 ? width / perRow / 4 : 0);
      const hasPhone = rand(idx + 3) > 0.45;
      const order = rand(idx + 11);
      const on = hasPhone && phonesOn > order ? 1 : 0;
      out.push(
        <group key={`s${idx}`} position={[px, y, zz]} scale={[sc, sc, 1]}>
          <Flat shape={SEAT.back} color={seatStr} outline="#0E1118" outlineWidth={2} position={[0, 12, 0]} />
          <Flat shape={SEAT.seat} color={seatStr} outline="#0E1118" outlineWidth={2} position={[0, -24, 0.1]} />
          {hasPhone && (
            <>
              <Flat shape={SEAT.phone} color="#111318" position={[6, -14, 0.2]} rotation={(rand(idx) - 0.5) * 0.3} />
              {on > 0 && (
                <>
                  <Flat shape={SEAT.screen} color={C.amber} position={[6, -12, 50]} rotation={(rand(idx) - 0.5) * 0.3} renderOrder={GLOW_ORDER} />
                  <Glow x={6} y={-6} z={51} size={110} sy={0.5} color={C.amber} intensity={0.55} renderOrder={GLOW_ORDER} />
                </>
              )}
            </>
          )}
        </group>,
      );
    }
  }
  return <group>{out}</group>;
};

const SEAT = {
  back: roundedRect(84, 64, 14),
  seat: roundedRect(96, 16, 6),
  phone: roundedRect(40, 9, 3),
  screen: roundedRect(34, 5, 2),
};
