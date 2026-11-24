import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {drawFace, type Mood as FaceMood} from '../kit3d/face';
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

// shared geometry (built once). v3 anatomy (RicksClips-measured): small round white head straight on a THIN pill
// torso that IS the outfit, long ink-stick legs and arms, small ink hands, hair/caps for identity.
const pillTorso = (wBottom: number, wTop: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-wBottom / 2 + r, 0);
  s.lineTo(wBottom / 2 - r, 0);
  s.quadraticCurveTo(wBottom / 2, 0, wBottom / 2, r);
  s.lineTo(wTop / 2, h - r);
  s.quadraticCurveTo(wTop / 2, h, wTop / 2 - r, h);
  s.lineTo(-wTop / 2 + r, h);
  s.quadraticCurveTo(-wTop / 2, h, -wTop / 2, h - r);
  s.lineTo(-wBottom / 2, r);
  s.quadraticCurveTo(-wBottom / 2, 0, -wBottom / 2 + r, 0);
  return s;
};
/** circle segment above y = cut (hair caps, cap domes) */
const capShape = (r: number, cut: number) => {
  const a = Math.asin(Math.max(-1, Math.min(1, cut / r)));
  const s = new THREE.Shape();
  s.absarc(0, 0, r, a, Math.PI - a, false);
  s.closePath();
  return s;
};
const tri = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  s.moveTo(...pts[0]);
  pts.slice(1).forEach((p) => s.lineTo(...p));
  s.closePath();
  return s;
};

const HEAD_R = 58;
const TORSO_H = 128;
const HEAD_Y = TORSO_H + HEAD_R - 6; // sits straight on the body
const LEG_H = 112;
const SKIN = '#F7F5F0';

const S = {
  torso: pillTorso(88, 72, TORSO_H, 30),
  dress: pillTorso(118, 70, TORSO_H, 26),
  head: ellipse(HEAD_R, HEAD_R),
  arm: roundedRect(9, 118, 4.5),
  hand: ellipse(10, 10),
  leg: roundedRect(10, LEG_H, 5),
  shoe: roundedRect(32, 15, 7),
  cast: roundedRect(22, 40, 8),
  hood: ellipse(50, 17),
  string: roundedRect(3.5, 30, 1.75),
  pocket: roundedRect(48, 20, 7),
  button: ellipse(3.5, 3.5),
  zip: roundedRect(3, 104, 1.5),
  belt: roundedRect(96, 9, 4),
  collarL: tri([[-2, 0], [-26, 4], [-14, -18]]),
  collarR: tri([[2, 0], [26, 4], [14, -18]]),
  hairMessy: capShape(HEAD_R + 4, 14),
  hairNeat: capShape(HEAD_R + 4, 22),
  hairBack: ellipse(HEAD_R + 4, HEAD_R + 4),
  fringe: ellipse(36, 15),
  bun: ellipse(21, 21),
  capDome: capShape(HEAD_R + 5, 20),
  brim: roundedRect(52, 10, 5),
  glassRing: ring(15, 3),
  bridge: roundedRect(10, 3, 1.5),
  shades: roundedRect(30, 16, 6),
  shadesBridge: roundedRect(12, 3, 1.5),
  miniPhone: roundedRect(30, 54, 7),
  miniScreen: roundedRect(23, 44, 4),
};

/** any expression of the shared face system (kit3d/face.ts): 34 presets ('fake' = laughing mouth, dead eyes) */
export type Mood = FaceMood;
/** outfit + identity pieces. hood = Mo's hoodie, hair = messy hair with fringe, neat = side-part hair */
export type Accessory = 'hood' | 'glasses' | 'buns' | 'cap' | 'shades' | 'hair' | 'neat' | 'vest' | 'jacket' | 'dress';

/** the face as a canvas-textured plane over the head (drawn by kit3d/face.ts) */
const FacePlane: React.FC<{mood: Mood; lookX?: number; lookY?: number; blink?: number; eyeScale?: number; browY?: number}> = (p) => {
  const {canvas, tex} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return {canvas: c, tex: t};
  }, []);
  drawFace(canvas.getContext('2d')!, {mood: p.mood, lookX: p.lookX, lookY: p.lookY, blink: p.blink, eyeScale: p.eyeScale, browY: p.browY});
  tex.needsUpdate = true;
  return (
    <mesh position={[0, -2, 0.1]}>
      <planeGeometry args={[HEAD_R * 2, HEAD_R * 2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

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
  hairColor?: string;
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
  /** seen from behind: no face, hair covers the back of the head */
  back?: boolean;
  /** 0..1 idle life (head drift, weight shift, arm sway) */
  alive?: number;
};

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  z = 10,
  scale = 1,
  color = '#8A8FA3',
  shade = '#767B8E',
  mood = 'neutral',
  lookX = 0,
  lookY = 0,
  armR = 10,
  armL = -10,
  armsFront = false,
  accessories = [],
  capColor = '#3E7C7A',
  hairColor = '#2E2420',
  castOn,
  standing = false,
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
  alive = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame + blinkOffset;
  const blinking = t % 96 < 4 && mood !== 'laugh';
  const breath = breathe ? Math.sin((frame + blinkOffset) / 22) * 2 : 0;
  // idle life: slow head drift + arm sway, each character on its own rhythm
  const sec = (frame + blinkOffset * 7) / 30;
  const lifeTilt = alive * (Math.sin(sec * 0.9) * 3 + Math.sin(sec * 2.3) * 1.2);
  const lifeArm = alive * Math.sin(sec * 1.1) * 3;
  const legLift = standing ? LEG_H : 0;
  const hop = bounce * 10 + (walk !== undefined ? Math.abs(Math.sin(walk)) * 5 : 0);
  const has = (a: Accessory) => accessories.includes(a);
  const ink = C.ink;
  const armZ = armsFront ? 0.6 : -0.5;
  const hx = lookX * 10;
  const hy = lookY * 6;
  const torso = has('dress') ? S.dress : S.torso;

  const arm = (side: 'L' | 'R', angle: number) => (
    <group position={[side === 'R' ? 34 : -34, TORSO_H - 18 + breath, armZ]} rotation={[0, 0, THREE.MathUtils.degToRad(angle + (side === 'R' ? lifeArm : -lifeArm))]}>
      <Flat shape={S.arm} color={ink} position={[0, -59, 0]} />
      <Flat shape={S.hand} color={ink} position={[0, -120, 0.02]} />
      {castOn === side && <Flat shape={S.cast} color="#F4F1EA" outline={ink} position={[0, -84, 0.05]} />}
      {holdPhone === side && (
        <>
          <Flat shape={S.miniPhone} color="#1A1D24" outline="#3A4050" outlineWidth={2} position={[0, -128, 0.2]} />
          <Flat shape={S.miniScreen} color="#BFD2FF" opacity={0.85 * phoneGlow} position={[0, -128, 0.25]} />
          <Glow x={0} y={-128} z={36} size={260} color="#BFD2FF" intensity={0.35 * phoneGlow} />
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
            <group key={side} position={[side * 18, LEG_H, -0.3]} rotation={[0, 0, swing + side * 0.04]}>
              <Flat shape={S.leg} color={ink} position={[0, -LEG_H / 2, 0]} />
              <Flat shape={S.shoe} color={has('hood') ? '#F4F1EA' : '#2A2E38'} outline={ink} outlineWidth={3} position={[side * 4 + 7, -LEG_H + 4, 0.1]} />
            </group>
          );
        })}
      <group position={[0, legLift, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(bodyTilt)]}>
        {arm('R', armR)}
        {arm('L', armL)}
        {has('hood') && <Flat shape={S.hood} color={shade} outline={ink} position={[0, TORSO_H - 6 + breath * 0.6, back ? 0.15 : -0.2]} />}
        <Flat shape={torso} color={color} outline={ink} position={[0, breath * 0.3, 0]} />
        {!back && (
          <>
            {has('hood') && (
              <>
                <Flat shape={S.pocket} color={shade} outline={ink} outlineWidth={2.5} position={[0, 30 + breath * 0.3, 0.1]} />
                <Flat shape={S.string} color="#F4F1EA" position={[-10, TORSO_H - 26 + breath * 0.3, 0.12]} />
                <Flat shape={S.string} color="#F4F1EA" position={[10, TORSO_H - 26 + breath * 0.3, 0.12]} />
              </>
            )}
            {(has('vest') || has('jacket') || has('dress')) && (
              <>
                <Flat shape={S.collarL} color="#F4F1EA" outline={ink} outlineWidth={2} position={[0, TORSO_H - 2, 0.15]} />
                <Flat shape={S.collarR} color="#F4F1EA" outline={ink} outlineWidth={2} position={[0, TORSO_H - 2, 0.15]} />
              </>
            )}
            {has('vest') && [0, 1, 2].map((k) => <Flat key={k} shape={S.button} color={ink} position={[0, TORSO_H - 40 - k * 28, 0.12]} />)}
            {has('jacket') && <Flat shape={S.zip} color={shade} position={[0, TORSO_H / 2 - 6, 0.12]} />}
            {has('dress') && <Flat shape={S.belt} color={shade} position={[0, 50, 0.12]} />}
          </>
        )}
        {occlude && (
          <>
            <Flat shape={torso} color="#000" occluder position={[0, breath * 0.3, 60]} />
            <Flat shape={S.head} color="#000" occluder position={[0, HEAD_Y + breath, 60]} />
          </>
        )}
        {/* head */}
        <group position={[0, HEAD_Y + breath, 0.2]} rotation={[0, 0, THREE.MathUtils.degToRad(headTilt + lifeTilt)]}>
          {has('buns') && (
            <>
              <Flat shape={S.bun} color={hairColor} outline={ink} position={[-44, 46, -0.1]} />
              <Flat shape={S.bun} color={hairColor} outline={ink} position={[44, 46, -0.1]} />
            </>
          )}
          <Flat shape={S.head} color={SKIN} outline={ink} />
          {!back && (
            <>
              {/* face: the shared expression renderer (kit3d/face.ts), same faces as the 3D kit */}
              <FacePlane mood={mood} lookX={lookX} lookY={lookY} blink={blinking ? 1 : 0} eyeScale={eyeScale} browY={(browLiftProp ?? 0) / 5} />
              {has('shades') && (
                <>
                  <Flat shape={S.shades} color="#0E0F13" position={[-20 + hx * 0.8, 4 + hy, 0.16]} />
                  <Flat shape={S.shades} color="#0E0F13" position={[20 + hx * 0.8, 4 + hy, 0.16]} />
                  <Flat shape={S.shadesBridge} color="#0E0F13" position={[hx * 0.8, 8 + hy, 0.16]} />
                </>
              )}
              {has('glasses') && (
                <>
                  <Flat shape={S.glassRing} color={ink} position={[-20 + hx * 0.8, 3 + hy, 0.15]} />
                  <Flat shape={S.glassRing} color={ink} position={[20 + hx * 0.8, 3 + hy, 0.15]} />
                  <Flat shape={S.bridge} color={ink} position={[hx * 0.8, 6 + hy, 0.15]} />
                </>
              )}
            </>
          )}
          {/* hair: the identity (messy + fringe for Mo, neat side part, buns) */}
          {back && (has('hair') || has('neat') || has('buns')) && <Flat shape={S.hairBack} color={hairColor} outline={ink} position={[0, 0, 0.3]} />}
          {!back && has('hair') && (
            <>
              <Flat shape={S.hairMessy} color={hairColor} outline={ink} position={[0, 0, 0.3]} />
              <group position={[-18, 22, 0.31]} rotation={[0, 0, 0.42]}>
                <Flat shape={S.fringe} color={hairColor} />
              </group>
            </>
          )}
          {!back && (has('neat') || has('buns')) && <Flat shape={S.hairNeat} color={hairColor} outline={ink} position={[0, 0, 0.3]} />}
          {has('cap') && (
            <>
              <Flat shape={S.capDome} color={capColor} outline={ink} position={[0, 0, 0.32]} />
              <Flat shape={S.brim} color={capColor} outline={ink} position={[lookX >= 0 ? -48 : 48, 30, 0.33]} />
            </>
          )}
        </group>
      </group>
    </group>
  );
};

/* ---------- Mo (the hero) = Person in his mustard hoodie, messy dark hair, white sneakers ---------- */

type HeroProps = Omit<PersonProps, 'accessories' | 'armR'> & {armAngle?: number; armR?: number; extra?: Accessory[]};

export const Hero: React.FC<HeroProps> = ({armAngle, armR, extra = [], color, shade, ...p}) => (
  <Person {...p} color={color ?? '#E8A33D'} shade={shade ?? '#C98424'} armR={armR ?? armAngle ?? 10} accessories={['hood', 'hair', ...extra]} />
);

/* ---------- cast (same outfits as the 3D cast in assets/blender/characters/person.py) ---------- */
export const CAST = {
  theo: {color: '#6E9A7E', shade: '#58806A', accessories: ['glasses', 'neat', 'vest'] as Accessory[], hairColor: '#6B4A32'},
  lia: {color: '#E8766E', shade: '#C95C56', accessories: ['buns', 'dress'] as Accessory[], hairColor: '#3A2A22'},
  dex: {color: '#C9443C', shade: '#A8362F', accessories: ['cap', 'jacket'] as Accessory[], capColor: '#3E9C93'},
  friendA: {color: '#9C7B6B', shade: '#86685A', accessories: ['neat'] as Accessory[], hairColor: '#4A3428'},
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
