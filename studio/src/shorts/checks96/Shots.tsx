/**
 * "The 96 Checks": every shot of the short. Script: videos/02-the-96-checks/script.md. Cuts come from timing.ts (VO words).
 * Each shot is a component rendered inside a <Sequence>, so useCurrentFrame() is local to the shot.
 */
import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Stage, Practical, type Cam} from '../../kit3d/Stage';
import type {PostSettings} from '../../kit3d/post';
import {BEDROOM as B, BedroomNight, Island, ISLANDS, STADIUM as S, StadiumNight, useStadium, type V3} from '../../kit3d/envs';
import {CrowdInstances, stadiumSeats} from '../../kit3d/Crowd';
import {blinkAt, Character, POSES, type Pose} from '../../kit3d/Character';
import type {FaceState} from '../../kit3d/face';
import {drawGrip, PovArm, drawLikesBig, drawScreenTime, drawTheirPost, GlowText, gripPoints, PencilBetween, Phone3D, Sketchbook, strokeToPage} from '../../kit3d/Props';
import {Dust, GlowCard} from '../../kit3d/fx';
import {BIG_DRAGON, DRAGON, drawDeleteDialog, drawPage, drawPaper, drawPostDeleted, drawPostScreen, drawStrokes, strokeTip, type Stroke} from '../../kit/canvas';

// ---------------------------------------------------------------- helpers
const ease = Easing.bezier(0.2, 0.42, 0.36, 1); // non-zero start velocity: motion carries through the cut
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const D = THREE.MathUtils.degToRad;
/** progress 0..1 over [a, b] frames, eased */
const prog = (f: number, a: number, b: number, e = ease) => e(clamp01((f - a) / Math.max(1, b - a)));
type Key = {pos: V3; target: V3; fov?: number; roll?: number};
/** camera move between two keys over `len` frames (the camera never stops: RicksClips) */
const move = (f: number, len: number, a: Key, b: Key, shake = 0.005): Cam => {
  const t = prog(f, 0, len);
  return {pos: mix3(a.pos, b.pos, t), target: mix3(a.target, b.target, t), fov: mix(a.fov ?? 40, b.fov ?? 40, t), roll: mix(a.roll ?? 0, b.roll ?? 0, t), shake};
};
/** point in front of a character: yaw deg (0 = +Z), d metres forward, up metres */
const fwd = (p: V3, yawDeg: number, d: number, up = 0): V3 => [p[0] + Math.sin(D(yawDeg)) * d, p[1] + up, p[2] + Math.cos(D(yawDeg)) * d];
/** sideways (character's left) */
const side = (p: V3, yawDeg: number, d: number): V3 => [p[0] + Math.cos(D(yawDeg)) * d, p[1], p[2] - Math.sin(D(yawDeg)) * d];
/** phone held with POSES.holdPhone (same offset sitting or standing, verified in looks/LookTest) */
const phoneIn = (root: V3, yaw: number): {at: V3; rot: V3} => ({at: fwd(root, yaw, 0.3, 0.74), rot: [-50, yaw + 180, 0]});
const headOf = (root: V3, yaw: number, sit = true): V3 => fwd(root, yaw, sit ? 0.1 : 0.02, 1.22);

type Screen = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
const LOOK: PostSettings = {bloom: 0.85};

// ---------------------------------------------------------------- recurring setups
/** Mo on the bed edge with the phone (the hook image and the "2 AM" world) */
const MoOnBed: React.FC<{face: FaceState; screen?: Screen | null; glow?: number; pose?: Pose; fill?: number}> = ({face, screen, glow = 1.35, pose, fill = 0.12}) => {
  const f = useCurrentFrame();
  const ph = phoneIn(B.moBed, B.moBedYaw);
  return (
    <>
      <Character id="mo" position={B.moBed} rotation={B.moBedYaw} pose={{...POSES.holdPhone, sit: 1, slump: 0.3, breathe: f * 0.09, ...pose}} face={{blink: blinkAt(f), lookY: -0.8, ...face}}
        reach={gripPoints(ph.at, ph.rot)} />
      <Phone3D at={ph.at} rot={ph.rot} screen={screen === undefined ? (ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 9}) : screen} glow={glow} />
      {fill > 0 && glow > 0.05 && <Practical at={fwd(B.moBed, B.moBedYaw, 0.5, 1.0)} color="#9DB8FF" intensity={fill * Math.min(1, glow)} distance={1.0} shadow={false} />}
    </>
  );
};

const BED_HEAD = headOf(B.moBed, B.moBedYaw);
const closeOnBed = (f: number, len: number, push = 0.4): Cam =>
  move(f, len, {pos: add3(BED_HEAD, [0.45, -0.05, 2.5]), target: add3(BED_HEAD, [-0.05, -0.12, 0]), fov: 32}, {pos: add3(BED_HEAD, [0.32, -0.08, 2.5 - push]), target: add3(BED_HEAD, [-0.05, -0.12, 0]), fov: 32}, 0.006);
const CLOSE_POST = (head: V3): PostSettings => ({aperture: 2.0, focusAt: head, maxBlur: 26, bloom: 0.7, bloomThreshold: 1.05});

/** Mo drawing at the desk */
const deskPose = (f: number, drawing = true): Pose => ({
  sit: 1, lean: 12, headNod: 30, armL: 10, fwdL: 40, elbowL: 50,
  fwdR: 55 + (drawing ? Math.sin(f * 0.9) * 3 : 0), elbowR: 40 + (drawing ? Math.sin(f * 0.55) * 6 : 0), twist: drawing ? Math.sin(f * 0.3) * 1.5 : 0, breathe: f * 0.09,
});
const SKETCH_AT: V3 = [-0.95, B.deskTop, -1.97];
// through the (ghosted) back wall: Mo's face, the page, and the room behind him
const DESK_A: Key = {pos: [-0.35, 1.45, -4.1], target: [-0.98, 1.0, -1.7], fov: 34};
const DESK_B: Key = {pos: [-0.55, 1.42, -3.75], target: [-0.98, 1.02, -1.72], fov: 34};
const CUT = B.deskCutaway;
const MO_DESK_HEAD: V3 = [B.moDesk[0], 1.28, B.moDesk[2] - 0.12];

/** a phone filling the frame, held in front of Mo at the desk (camera sits where his eyes are) */
const DESK_PHONE: V3 = [-0.98, 1.02, -1.86];
const PhoneMacro: React.FC<{screen: Screen; len: number; glow?: number; tilt?: number; children?: React.ReactNode; lamp?: number; time?: 'day' | 'night'}> = ({screen, len, glow = 0.92, tilt = 0, children, lamp = 1, time = 'day'}) => {
  const f = useCurrentFrame();
  const cam = move(f, len,
    {pos: add3(DESK_PHONE, [0.06, 0.06, 0.36]), target: add3(DESK_PHONE, [0.01, -0.005, 0]), fov: 30, roll: -3},
    {pos: add3(DESK_PHONE, [0.02, 0.03, 0.27]), target: add3(DESK_PHONE, [0.0, 0, 0]), fov: 30, roll: 1}, 0.003);
  return (
    <Stage background={B.bg} fog={B.fog} cam={cam} post={{aperture: 2.6, focusAt: DESK_PHONE, maxBlur: 30, bloom: 0.6, bloomThreshold: 1.25}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} lamp={lamp} time={time}>
        <Phone3D at={DESK_PHONE} rot={[-8 + tilt, 0, 0]} screen={screen} glow={glow} />
        <Sketchbook at={SKETCH_AT} draw={(ctx, w, h) => drawPage(ctx, w, h, DRAGON, 'mon', 1)} />
        {children}
      </BedroomNight>
    </Stage>
  );
};

/** Mo drawing at the desk: the right mitten holds a real pencil whose tip rides the stroke being drawn (strokeTip),
 *  the left hand holds the page. p = drawing progress 0..1 (the page shows exactly what the pencil has drawn) */
// Mo's shoulders when seated at the desk (for POV arms)
const SH_R: V3 = [-0.8, 0.98, -1.58];
const SH_L: V3 = [-1.2, 0.98, -1.58];
const DeskDrawing: React.FC<{strokes: Stroke[]; label: string; p: number; face?: FaceState; lean?: number; pov?: boolean}> = ({strokes, label, p, face, lean = 14, pov = false}) => {
  const f = useCurrentFrame();
  const uv = strokeToPage(strokeTip(strokes, Math.max(0.001, p)));
  const g = drawGrip(SKETCH_AT, undefined, uv);
  return (
    <>
      {pov ? (
        <>
          <PovArm shoulder={SH_R} hand={g.hand} />
          <PovArm shoulder={SH_L} hand={g.rest} />
        </>
      ) : (
        <Character id="mo" position={B.moDesk} rotation={B.moDeskYaw} pose={{sit: 1, lean, headNod: 30, breathe: f * 0.09}}
          reach={{R: g.hand, L: g.rest}} face={{mood: 'happy', lookY: -1, blink: blinkAt(f), ...face}} />
      )}
      <Sketchbook at={SKETCH_AT} draw={(ctx, w, h) => drawPage(ctx, w, h, strokes, label, p)} />
      <PencilBetween tip={g.tip} butt={g.butt} />
    </>
  );
};
/** top-down over Mo's right shoulder: the page fills the frame, the drawing reads upright, the pencil draws it */
const PAGE_C: V3 = [-0.85, B.deskTop, -1.97];
// Mo's point of view: the camera sits in his head, near-clip 0.34 cuts the head away -> his mitten, his pencil, his page
const INSERT_A: Key = {pos: [-0.9, 1.5, -1.52], target: add3(PAGE_C, [0.0, 0, -0.02]), fov: 44};
const INSERT_B: Key = {pos: [-0.88, 1.44, -1.6], target: add3(PAGE_C, [0.0, 0, -0.01]), fov: 42};
const POV = (c: Cam): Cam => ({...c, near: 0.34});

/** the phone camera's viewfinder pointed at the page */
const drawViewfinder = (ctx: CanvasRenderingContext2D, w: number, h: number, flash: number) => {
  ctx.fillStyle = '#0A0B0F';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(0, 140);
  drawPaper(ctx, w, w * 1.3);
  drawStrokes(ctx, DRAGON, 1, {x: 30, y: 60, w: w - 60, h: w - 60}, {color: '#2A2A30', width: 7});
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 4;
  for (const [x, y, dx, dy] of [[40, 180, 1, 1], [w - 40, 180, -1, 1], [40, 140 + w * 1.3 - 40, 1, -1], [w - 40, 140 + w * 1.3 - 40, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 40);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 40, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#F3EFE6';
  ctx.beginPath();
  ctx.arc(w / 2, h - 90, 42, 0, Math.PI * 2);
  ctx.fill();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0, 0, w, h);
  }
};

// ---------------------------------------------------------------- stadium shared
const HERO_SEATS: {t: number; a: number}[] = [
  {t: 4, a: 9}, {t: 4, a: 14}, {t: 4, a: 19}, {t: 4, a: 24}, {t: 4, a: 29}, {t: 4, a: 34},

];
const heroRoot = (t: number, a: number): V3 => {
  const p = S.seat(t, a);
  return [p[0], p[1] - 0.44 + 0.0, p[2]];
};
const heroYaw = (t: number, a: number) => {
  const p = S.seat(t, a);
  return THREE.MathUtils.radToDeg(Math.atan2(-p[0], -p[2]));
};

/** the stadium with the instanced crowd + hero crowd members (real rigs with phones where the camera goes) */
/** seats emptied for cameras that travel through the stands */
const CLEAR = [{t0: 0, t1: 4, a0: -2, a1: 44}, {t0: 5, t1: 7, a0: -2, a1: 44}, {t0: 4, t1: 5, a0: -2, a1: 7}];
const Arena: React.FC<{down: number; wave?: number; clear?: boolean; hideHero?: number; spot?: number; spotColor?: string; floods?: number; eyes?: number; heroes?: boolean; nervous?: number; mo?: {pose?: Pose; face?: FaceState; visible?: boolean}; children?: React.ReactNode}> = ({
  down, wave = 0.6, clear = false, hideHero = -1, spot = 1, spotColor, floods = 0.5, eyes = 1, heroes = true, nervous = -1, mo, children,
}) => {
  const set = useStadium();
  const f = useCurrentFrame();
  const seats = React.useMemo(() => stadiumSeats(set?.markData.MARK_stands), [set]);
  const skip = React.useMemo(() => HERO_SEATS.map(({t, a}) => {
    const p = S.seat(t, a);
    return [p[0], p[2]] as [number, number];
  }), []);
  return (
    <StadiumNight set={set} spot={spot} spotColor={spotColor} floods={floods}>
      <CrowdInstances seats={seats} skip={heroes ? skip : []} clear={clear ? CLEAR : []} look={[0, 1.1, 0]} down={down} wave={wave} eyeGlow={3.2 * eyes} />
      {heroes && HERO_SEATS.map(({t, a}, i) => {
        const root = heroRoot(t, a);
        const yaw = heroYaw(t, a);
        // each bows a few frames apart (follows the wave)
        const d = clamp01(down * (1 + wave) - wave * ((a + 180) / 360));
        const dd = d * d * (3 - 2 * d);
        const ph = phoneIn(root, yaw);
        const isNervous = i === 1 && nervous >= 0;
        const look = isNervous ? Math.sin(nervous * 0.35) * 35 * clamp01(nervous / 6) : 0;
        const lift = isNervous ? clamp01(nervous / 6) * 0.8 : 0;
        return (
          <group key={i}>
            <Character id="crowd" visible={i !== hideHero} position={root} rotation={yaw} recolor={{GLOW_amber: dd > 0.5 ? '#2A2010' : '#F2A93B'}}
              pose={{...POSES.holdPhone, sit: 1, headNod: mix(8, 42, dd * (1 - lift)) , headTurn: look + (i % 3 - 1) * 4, breathe: f * 0.08 + i}}
              reach={gripPoints(ph.at, ph.rot)} />
            <Phone3D at={ph.at} rot={ph.rot} glow={(i === hideHero ? 0.95 : 1.8) * dd} screen={dd > 0.02 ? (ctx, w, h) => drawTheirPost(ctx, w, h, {likes: [3, 7, 1, 12, 4, 2, 9, 5][i], hue: i * 47, seed: i}) : null} />
            {dd > 0.05 && i !== hideHero && <Practical at={fwd(root, yaw, 0.36, 0.95)} color="#FFC27A" intensity={2.2 * dd} distance={1.0} shadow={false} />}
            {dd > 0.05 && i !== hideHero && <GlowCard at={add3(ph.at, [0, 0.03, 0])} size={0.55} color="#FFC98A" opacity={0.55 * dd} />}
          </group>
        );
      })}
      {mo?.visible !== false && (
        <Character id="mo" position={S.center} rotation={0} pose={{armL: 12, armR: 12, breathe: f * 0.1, ...mo?.pose}} face={{blink: blinkAt(f, 20), ...mo?.face}} />
      )}
      {children}
    </StadiumNight>
  );
};
const STAD: PostSettings = {bloom: 0.9, bloomThreshold: 0.95};
const MO_HEAD_ST: V3 = [0, 1.32, 0.03];

// ================================================================ the shots
// S01a  hook: phone lights Mo's face at night
export const S01a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const on = clamp01((f - 3) / 3);
  return (
    <Stage background={B.bg} fog={B.fog} cam={closeOnBed(f, len, 0.6)} post={{...CLOSE_POST(BED_HEAD), fade: 1 - clamp01(f / 4)}}>
      <BedroomNight lamp={0.35}>
        <MoOnBed face={{mood: 'worried', blink: f < 8 ? 1 : blinkAt(f)}} glow={1.35 * on} fill={0.16} screen={(ctx, w, h) => drawPostScreen(ctx, w, h, {likes: 9, pop: 0})} />
      </BedroomNight>
    </Stage>
  );
};

// S01b  "for a crowd that wasn't even looking": teaser of the stadium eyes (in the dark)
export const S01b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = move(f, len, {pos: [0, 2.2, 3.5], target: [0, 3.2, -6], fov: 55}, {pos: [0, 2.0, 1.2], target: [0, 3.4, -6], fov: 50});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, vignette: 0.45}}>
      <Arena down={0} spot={0} floods={0.12} heroes={false} mo={{visible: false}} />
    </Stage>
  );
};

// S02  "every drawing he posted turned into a scoreboard": Mo drawing at his desk, warm afternoon
export const S02: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = move(f, len, DESK_A, DESK_B);
  return (
    <Stage cam={cam} fog={B.fog} post={{aperture: 1.2, focusAt: MO_DESK_HEAD, maxBlur: 20, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} ghost={CUT} time="day" lamp={0.4}>
        <DeskDrawing strokes={DRAGON} label="mon" p={0.45 + 0.5 * (f / len)} />
      </BedroomNight>
    </Stage>
  );
};
// S03  "And the score was likes": the like counter as a scoreboard
export const S03: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  return <PhoneMacro len={len} screen={(ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 9, from: 0, roll: prog(f, 2, len - 4, Easing.out(Easing.cubic))})} />;
};

// S04  "Monday, he posts a dragon": top-down, he holds the phone over the finished page and snaps it
export const S04: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const snap = Math.round(len * 0.62);
  const flash = f >= snap && f < snap + 5 ? 1 - (f - snap) / 5 : 0;
  const at: V3 = [-0.86, 1.1 + Math.sin(f * 0.2) * 0.004, -1.93];
  const rot: V3 = [-72, 0, 0];
  const cam = POV(move(f, len, {pos: [-0.94, 1.4, -1.58], target: [-0.86, 0.9, -1.99], fov: 44}, {pos: [-0.92, 1.36, -1.64], target: [-0.86, 0.95, -1.98], fov: 42}));
  return (
    <Stage cam={cam} fog={B.fog} post={{aperture: 1.4, focusAt: at, maxBlur: 20, flash: flash * 0.25, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} time="day" lamp={0.4}>
        <PovArm shoulder={SH_R} hand={gripPoints(at, rot).R!} />
        <PovArm shoulder={SH_L} hand={gripPoints(at, rot).L!} />
        <Phone3D at={at} rot={rot} glow={1.0} screen={(ctx, w, h) => (f < snap + 8 ? drawViewfinder(ctx, w, h, flash) : drawPostScreen(ctx, w, h, {likes: 0, pop: 0, caption: 'my dragon :) #art'}))} />
        <Sketchbook at={SKETCH_AT} draw={(ctx, w, h) => drawPage(ctx, w, h, DRAGON, 'mon', 1)} />
        <PencilBetween tip={[-0.74, B.deskTop + 0.006, -1.86]} butt={[-0.58, B.deskTop + 0.006, -1.9]} />
      </BedroomNight>
    </Stage>
  );
};
// S05  "Nine likes. He deletes it." (one continuous phone beat: 9 -> delete dialog -> gone)
export const S05: React.FC<{len: number; del: number}> = ({len, del}) => {
  const f = useCurrentFrame();
  const screen: Screen = (ctx, w, h) => {
    if (f < del - 6) drawPostScreen(ctx, w, h, {likes: Math.min(9, Math.floor(f * 0.9)), pop: f > 9 && f < 15 ? 1 - (f - 9) / 6 : 0});
    else if (f < del + 10) drawDeleteDialog(ctx, w, h, {likes: 9, hover: clamp01((f - del + 6) / 8)});
    else drawPostDeleted(ctx, w, h, {toast: clamp01((f - del - 10) / 6)});
  };
  return <PhoneMacro len={len} screen={screen} />;
};

// S07a  "Tuesday, he redraws it for three hours": the redraw, top-down; dusk falls (colour script)
export const S07a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const p = clamp01(f / len) * 0.98;
  return (
    <Stage cam={POV(move(f, len, INSERT_A, INSERT_B, 0.003))} fog={B.fog} post={{aperture: 1.0, focusAt: PAGE_C, maxBlur: 16, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} lamp={1}>
        <DeskDrawing strokes={BIG_DRAGON} label="tue" p={p} face={{mood: 'determined'}} pov />
        {[0, 1, 2, 3].filter((k) => f > (k + 1) * len * 0.18).map((k) => (
          <mesh key={k} position={[-1.45 + k * 0.07, B.deskTop + 0.035, -1.95 + (k % 2) * 0.08]}>
            <icosahedronGeometry args={[0.035, 0]} />
            <meshToonMaterial color="#E8E0CC" />
          </mesh>
        ))}
      </BedroomNight>
    </Stage>
  );
};
// S07b  "posts at 2 AM": the alarm clock
export const S07b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = move(f, len, {pos: add3(B.clock, [0.04, 0.08, 0.6]), target: B.clock, fov: 36}, {pos: add3(B.clock, [0.02, 0.06, 0.48]), target: B.clock, fov: 36});
  const t = f < len * 0.35 ? '1:59' : '2:00';
  return (
    <Stage background={B.bg} fog={B.fog} cam={cam} post={{aperture: 2.2, focusAt: B.clock, maxBlur: 28, bloom: 0.7, bloomThreshold: 1.1}}>
      <BedroomNight lamp={0.8}>
        <GlowText at={[B.clock[0], B.clock[1] + 0.002, B.clock[2] + 0.0315]} text={t + ' AM'} size={[0.1, 0.045]} glow={1.25} />
      </BedroomNight>
    </Stage>
  );
};

// S08  "Eleven. Better.": back on the bed, the counter says 11
export const S08: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  return (
    <Stage background={B.bg} fog={B.fog} cam={closeOnBed(f, len, 0.3)} post={CLOSE_POST(BED_HEAD)}>
      <BedroomNight lamp={0.5}>
        <MoOnBed face={{mood: f > len * 0.45 ? 'smirk' : 'neutral', lookY: -0.8}} fill={0.16} screen={(ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 11, from: 9, roll: prog(f, 0, 12)})} />
      </BedroomNight>
    </Stage>
  );
};

// S09  "in class, at dinner, in the shower": three vignette islands
export const S09: React.FC<{len: number; which: 'class' | 'dinner' | 'shower'}> = ({len, which}) => {
  const f = useCurrentFrame();
  const I = ISLANDS[which];
  const sit = which !== 'shower';
  const yaw = which === 'shower' ? 0 : which === 'dinner' ? 60 : 180;
  const head = headOf(I.mo, yaw, sit);
  const keys: Record<string, [Key, Key]> = {
    class: [{pos: [-6.05, 1.3, -0.75], target: [-7.0, 1.05, 0.75], fov: 44}, {pos: [-6.25, 1.25, -0.55], target: [-7.0, 1.07, 0.75], fov: 42}],
    dinner: [{pos: [0.15, 1.3, 0.55], target: [-0.85, 1.12, -0.7], fov: 44}, {pos: [0.0, 1.26, 0.35], target: [-0.85, 1.14, -0.72], fov: 42}],
    shower: [{pos: [8.0, 1.45, 1.1], target: [7.25, 1.25, -1.2], fov: 42}, {pos: [7.8, 1.4, 0.75], target: [7.25, 1.28, -1.2], fov: 40}],
  };
  const [a, b] = keys[which];
  const ph = phoneIn(I.mo, yaw);
  return (
    <Stage background={I.bg} fog={[I.bg, 9, 22]} cam={move(f, len, a, b, 0.006)} post={{aperture: 0.7, focusAt: head, maxBlur: 14, bloom: 0.7, bloomThreshold: 1.15}}>
      <Island name={which}>
        <Character id="mo" position={I.mo} rotation={yaw} pose={{...POSES.holdPhone, sit: sit ? 1 : 0, breathe: f * 0.1}} face={{mood: which === 'shower' ? 'shock' : 'neutral', lookY: -0.8, blink: blinkAt(f, 30)}}
          reach={gripPoints(ph.at, ph.rot)} />
        <Phone3D at={ph.at} rot={ph.rot} screen={(ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 11})} />
        <Practical at={fwd(I.mo, yaw, 0.5, 1.0)} color="#9DB8FF" intensity={0.12} distance={1.0} shadow={false} />
        {which === 'shower' && <Dust center={[7.1, 1.4, -1.1]} size={[1.8, 1.6, 1.0]} count={120} color="#E8F4FF" opacity={0.3} point={0.1} seed={5} />}
        {which === 'dinner' && (
          // family at the table, eating (and looking at Mo)
          <Character id="lia" position={[0.91, 0.13, -0.775]} rotation={-60} scale={0.8} pose={{sit: 1, fwdR: 40, elbowR: 70, headTurn: -25}} face={{mood: 'neutral', lookX: 0.6, blink: blinkAt(f, 60)}} />
        )}
      </Island>
    </Stage>
  );
};

// S10a  "By Friday, he isn't drawing anymore": the abandoned half dragon, grey overcast day
export const S10a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  return (
    <Stage cam={POV(move(f, len, INSERT_A, INSERT_B, 0.002))} fog={B.fog} post={{aperture: 1.2, focusAt: PAGE_C, maxBlur: 20, bloom: 0.6}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} lamp={0} time="day" moon={0.7} shaft={0.6}>
        <Sketchbook at={SKETCH_AT} draw={(ctx, w, h) => drawPage(ctx, w, h, BIG_DRAGON, 'fri', 0.42)} />
        <PencilBetween tip={[-0.74, B.deskTop + 0.006, -1.86]} butt={[-0.58, B.deskTop + 0.006, -1.9]} />
        <Dust center={[-0.9, 1.0, -1.95]} size={[0.8, 0.6, 0.6]} count={90} color="#E8EEF8" opacity={0.8} seed={9} />
      </BedroomNight>
    </Stage>
  );
};
// S10b  "He's just refreshing": phone-lit face, the screen pulses on every refresh
export const S10b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.35 * Math.max(0, Math.sin(f * 0.55)) ** 8;
  return (
    <Stage background={B.bg} fog={B.fog} cam={closeOnBed(f, len, 0.45)} post={CLOSE_POST(BED_HEAD)}>
      <BedroomNight lamp={0} time="day">
        <MoOnBed face={{mood: 'tired', lookY: -0.8, blink: 0}} glow={1.35 * pulse} fill={0.2}
          screen={(ctx, w, h) => {
            drawPostScreen(ctx, w, h, {likes: 11, pop: 0});
            ctx.strokeStyle = '#9AA3B5';
            ctx.lineWidth = 6;
            ctx.beginPath();
            const a = f * 0.5;
            ctx.arc(w / 2, 70, 20, a, a + Math.PI * 1.4);
            ctx.stroke();
          }} />
      </BedroomNight>
    </Stage>
  );
};

// S11  "96 checks. Zero drawings.": screen time
export const S11: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  return <PhoneMacro len={len} lamp={0} screen={(ctx, w, h) => drawScreenTime(ctx, w, h, {pickups: 96, p: prog(f, 0, 22, Easing.out(Easing.cubic))})} />;
};

// S12  the skeptic: little sister at the door, deadpan
export const S12: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const lia: V3 = [-1.55, 0, 0.35];
  const liaHead: V3 = [lia[0], 1.07, lia[2]];
  const cam = move(f, len, {pos: [1.55, 1.3, -1.75], target: [-1.2, 1.0, 0.3], fov: 36}, {pos: [1.35, 1.25, -1.55], target: [-1.3, 1.0, 0.3], fov: 33});
  const talk = f > 4 && f < len - 8 ? Math.abs(Math.sin(f * 0.9)) : 0;
  return (
    <Stage background={B.bg} fog={B.fog} cam={cam} post={{aperture: 1.3, focusAt: liaHead, maxBlur: 22, ...LOOK}}>
      <BedroomNight time="day" lamp={0.2}>
        <MoOnBed face={{mood: 'tired', lookY: -0.3, lookX: -0.4}} pose={{headTurn: -25}} />
        <Character id="lia" position={lia} rotation={118} scale={0.8} pose={{armL: 30, armR: 30, elbowL: 100, elbowR: 100, fwdL: 30, fwdR: 30, headTilt: 8}} face={{mood: 'tired', talk, blink: blinkAt(f, 50)}} />
      </BedroomNight>
    </Stage>
  );
};

// S13a  "He doesn't laugh."
export const S13a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  return (
    <Stage background={B.bg} fog={B.fog} cam={closeOnBed(f, len, 0.3)} post={CLOSE_POST(BED_HEAD)}>
      <BedroomNight lamp={0.4}>
        <MoOnBed face={{mood: 'tired', lookY: -0.8}} fill={0.18} />
      </BedroomNight>
    </Stage>
  );
};

// S13b  "Because in his head...": push into Mo's eye (dissolves into the stadium)
export const S13b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const eye = add3(fwd(B.moBed, B.moBedYaw, 0.27, 1.22 + 0.03), [0.07, 0, 0]);
  const t = prog(f, 0, len, Easing.in(Easing.cubic));
  const cam: Cam = {pos: mix3(add3(eye, [0.25, -0.02, 1.4]), add3(eye, [0.005, 0, 0.06]), t), target: eye, fov: mix(30, 22, t), shake: 0.002};
  return (
    <Stage background={B.bg} fog={B.fog} cam={cam} post={{aperture: 1.2, focusAt: eye, maxBlur: 20, bloom: 0.7}}>
      <BedroomNight lamp={0.4}>
        <MoOnBed face={{mood: 'tired', lookY: -0.3, lookX: 0, blink: 0}} fill={0.18} pose={{headNod: 8}} />
      </BedroomNight>
    </Stage>
  );
};

// S14a  "...there's a stadium. Thousands of seats, every one of them watching him": lights clunk on, crane out
export const S14a: React.FC<{len: number; on: number}> = ({len, on}) => {
  const f = useCurrentFrame();
  const lit = f >= on ? 1 : 0;
  const eyes = clamp01((f - on) / 18);
  const cam = move(f, len, {pos: [0, 1.5, 2.2], target: [0, 1.2, 0], fov: 40}, {pos: [0, 7.5, 12.5], target: [0, 2.2, -1], fov: 52}, 0.004);
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, flash: f >= on && f < on + 3 ? 0.25 : 0}}>
      <Arena down={0} spot={lit} floods={0.5 * lit} eyes={eyes} heroes={false} mo={{face: {mood: 'worried', lookY: 0.3}, pose: {armL: 10, armR: 10}}} />
    </Stage>
  );
};

// S14b  "waiting for him to mess up": low angle, Mo small under the stands
export const S14b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = move(f, len, {pos: [0.5, 0.35, 2.6], target: [0, 2.2, -3], fov: 46, roll: 4}, {pos: [0.35, 0.3, 2.1], target: [0, 2.3, -3], fov: 46, roll: 6});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 0.6, focusAt: MO_HEAD_ST}}>
      <Arena down={0} heroes={false} mo={{face: {mood: 'worried', lookY: 0.5, lookX: Math.sin(f * 0.2) * 0.6, sweat: true}, pose: {armL: 6, armR: 6, slump: 0.25}}} />
    </Stage>
  );
};

// S15  "But here's where it gets weird.": Mo looks up into the stands
export const S15: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const turn = mix(0, 35, prog(f, 4, len - 6));
  const cam = move(f, len, {pos: [0.5, 1.2, 2.1], target: MO_HEAD_ST, fov: 34, roll: 0}, {pos: [0.4, 1.15, 1.8], target: MO_HEAD_ST, fov: 34, roll: -5});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 1.6, focusAt: MO_HEAD_ST, maxBlur: 24}}>
      <Arena down={0} heroes={false} mo={{face: {mood: f > len * 0.5 ? 'neutral' : 'worried', lookY: 0.7, lookX: -0.5}, pose: {headTurn: turn, headNod: -12, armL: 10, armR: 10}}} />
    </Stage>
  );
};

// S16  "Walk up into those seats and look closer. Nobody's looking at Mo.": fly up into the stands; the crowd bows
export const S16: React.FC<{len: number; reveal: number}> = ({len, reveal}) => {
  const f = useCurrentFrame();
  const t = prog(f, 0, reveal + 6, Easing.inOut(Easing.cubic));
  const from: V3 = [0.4, 1.5, 1.6];
  const to: V3 = add3(S.seat(2, 18), [0.2, 1.25, 0.6]);
  const mid: V3 = [-0.6, 3.6, -2.6];
  // quadratic bezier path (up the aisle, then settle a row below the heroes)
  const pos: V3 = mix3(mix3(from, mid, t), mix3(mid, to, t), t);
  const target: V3 = mix3([-0.8, 2.6, -6], add3(S.seat(4, 20), [0, 0.6, 0]), t);
  const down = clamp01((f - reveal) / 34);
  return (
    <Stage background={S.bg} fog={S.fog} cam={{pos, target, fov: 46, shake: 0.006}} post={{...STAD, aperture: 0.8 * t, focusAt: S.seat(4, 20, 0.7), bloom: mix(0.9, 0.55, t), bloomThreshold: mix(0.95, 1.2, t)}}>
      <Arena down={down} wave={0.5} clear mo={{face: {mood: 'neutral', lookY: 0.6}}} />
    </Stage>
  );
};

// S17  "Every single one of them is staring at their own phone.": track along the row
export const S17: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  // low front 3/4 along the row: bowed heads, under-lit by their own screens
  const a = mix(8, 24, prog(f, 0, len, Easing.linear));
  const pos2 = add3(S.seat(1.6, a), [0, 1.3, 0]);
  const target = add3(S.seat(4, a + 5), [0, 0.8, 0]);
  return (
    <Stage background={S.bg} fog={S.fog} cam={{pos: pos2, target, fov: 40, shake: 0.004}} post={{...STAD, aperture: 1.4, focusAt: target, maxBlur: 22}}>
      <Arena down={1} clear mo={{face: {mood: 'neutral'}}} />
    </Stage>
  );
};

// S18a  "Counting their own likes.": over a stranger's shoulder, their own little number
export const S18a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const h = HERO_SEATS[0];
  const root = heroRoot(h.t, h.a);
  const yaw = heroYaw(h.t, h.a);
  // their point of view: their own little number, Mo a blur in the spotlight far behind it
  const ph = phoneIn(root, yaw).at;
  const eye = fwd(root, yaw, 0.08, 1.3);
  const cam = move(f, len, {pos: eye, target: add3(ph, [0, 0.03, 0]), fov: 34}, {pos: mix3(eye, ph, 0.18), target: add3(ph, [0, 0.03, 0]), fov: 34}, 0.003);
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 2.4, focusAt: ph, maxBlur: 26, bloom: 0.6, bloomThreshold: 1.25}}>
      <Arena down={1} clear hideHero={0} />
    </Stage>
  );
};

// S18b  "Scared of their own crowd.": one of them glances around, terrified someone saw
export const S18b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const h = HERO_SEATS[1];
  const root = heroRoot(h.t, h.a);
  const yaw = heroYaw(h.t, h.a);
  const head = add3(root, [0, 1.3, 0]);
  const cam = move(f, len, {pos: fwd(root, yaw, 2.3, 1.45), target: head, fov: 38}, {pos: fwd(root, yaw, 2.0, 1.4), target: head, fov: 38});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 1.6, focusAt: head, maxBlur: 22}}>
      <Arena down={1} clear nervous={f} />
    </Stage>
  );
};

// S19  "It's called the spotlight effect.": high wide, a field of tiny screens; Mo alone in the light
export const S19: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = move(f, len, {pos: [0, 15, 8.5], target: [0, 0, -0.5], fov: 44}, {pos: [0, 12, 7.2], target: [0, 0.2, -0.4], fov: 44}, 0.003);
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={STAD}>
      <Arena down={1} mo={{face: {mood: 'neutral', lookY: 1}, pose: {headNod: -25}}} />
    </Stage>
  );
};

// S20  "You feel like the whole world is watching, when almost nobody is.": he looks around; the spotlight dies
export const S20: React.FC<{len: number; off: number}> = ({len, off}) => {
  const f = useCurrentFrame();
  const spot = f < off ? 1 : f < off + 2 ? 0.3 : 0;
  const turn = Math.sin(f * 0.07) * 40;
  const cam = move(f, len, {pos: [0.9, 1.0, 3.2], target: [0, 1.4, 0], fov: 40}, {pos: [0.6, 1.05, 2.6], target: [0, 1.4, 0], fov: 40});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 0.7, focusAt: MO_HEAD_ST}}>
      <Arena down={1} spot={spot} mo={{face: {mood: f < off ? 'worried' : 'shock', lookY: 0.5, lookX: turn / 60}, pose: {headTurn: f < off ? turn : 0, armL: 12, armR: 12}}} />
    </Stage>
  );
};

// S21  "Nobody was watching.": the one still shot. No camera move, no music.
export const S21: React.FC<{len: number}> = () => (
  <Stage background={S.bg} fog={S.fog} cam={{pos: [0, 1.6, 7.5], target: [0, 2.0, 0], fov: 46, shake: 0}} post={STAD}>
    <Arena down={1} spot={0} mo={{face: {mood: 'neutral', lookY: 0.3}, pose: {armL: 8, armR: 8}}} />
  </Stage>
);

// S22  "And that was the good news.": relief; a warm light finds him (he lit it himself)
export const S22: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const warm = prog(f, 4, len - 4);
  const cam = move(f, len, {pos: [0.45, 1.3, 2.3], target: MO_HEAD_ST, fov: 34}, {pos: [0.3, 1.3, 1.9], target: MO_HEAD_ST, fov: 34});
  return (
    <Stage background={S.bg} fog={S.fog} cam={cam} post={{...STAD, aperture: 1.6, focusAt: MO_HEAD_ST, maxBlur: 24}}>
      <Arena down={1} spot={0.55 * warm} spotColor="#FFB45E" mo={{face: {mood: f > len * 0.35 ? 'content' : 'neutral', lookY: 0.1}, pose: {armL: 8, armR: 8, headNod: -4}}} />
    </Stage>
  );
};

// S23a  "So Mo puts the phone face down": macro on the desk, the screen light goes out
export const S23a: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const flip = prog(f, 4, 16, Easing.inOut(Easing.cubic));
  const at: V3 = [-0.6, B.deskTop + 0.006 + Math.sin(flip * Math.PI) * 0.06, -1.92];
  const cam = move(f, len, {pos: [-0.35, 1.05, -1.62], target: [-0.6, B.deskTop, -1.92], fov: 36}, {pos: [-0.4, 1.0, -1.7], target: [-0.6, B.deskTop, -1.92], fov: 36});
  return (
    <Stage background={B.bg} fog={B.fog} cam={cam} post={{aperture: 2.0, focusAt: [-0.6, B.deskTop, -1.92], maxBlur: 26, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']}>
        <Phone3D at={at} rot={[-90 + flip * 180, 20, 0]} glow={1.3 * (1 - flip)} screen={flip < 0.55 ? (ctx, w, h) => drawLikesBig(ctx, w, h, {likes: 11}) : null} />
        <Sketchbook at={SKETCH_AT} draw={(ctx, w, h) => drawPage(ctx, w, h, BIG_DRAGON, 'sat', 0.42)} />
      </BedroomNight>
    </Stage>
  );
};

// S23b  "picks up his pencil": morning sun, the new dragon drawn to the last line (fully shown)
export const S23b: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const p = 0.42 + 0.58 * prog(f, 0, len - 6, Easing.inOut(Easing.sin));
  return (
    <Stage cam={POV(move(f, len, INSERT_B, INSERT_A, 0.003))} fog={B.fog} post={{aperture: 0.9, focusAt: PAGE_C, maxBlur: 14, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} time="day" lamp={0.3}>
        <DeskDrawing strokes={BIG_DRAGON} label="sat" p={p} face={{mood: 'content'}} pov />
        <Phone3D at={[-0.55, B.deskTop + 0.006, -1.95]} rot={[90, 20, 0]} screen={null} />
      </BedroomNight>
    </Stage>
  );
};
// S23c  "and for once, he doesn't check.": pull back; the phone buzzes face-down; he keeps drawing, sun on the room
export const S23c: React.FC<{len: number; buzz: number}> = ({len, buzz}) => {
  const f = useCurrentFrame();
  const b = f >= buzz && f < buzz + 14 ? 1 : 0;
  const jit = b ? Math.sin(f * 3) * 0.004 : 0;
  return (
    <Stage cam={move(f, len, DESK_B, {pos: [0.4, 1.7, -4.6], target: [-0.9, 1.0, -1.6], fov: 40}, 0.004)} fog={B.fog} post={{aperture: 0.6, focusAt: MO_DESK_HEAD, ...LOOK}}>
      <BedroomNight hide={['ceiling', 'laptop', 'paper']} ghost={CUT} time="day" lamp={0.3}>
        <DeskDrawing strokes={BIG_DRAGON} label="sat" p={1} face={{mood: 'content'}} lean={10 + Math.sin(f * 0.1) * 2} />
        <Phone3D at={[-0.55 + jit, B.deskTop + 0.006, -1.95]} rot={[90, 20, 0]} screen={null} />
        {b > 0 && <Practical at={[-0.55, B.deskTop + 0.01, -1.95]} color="#9DB8FF" intensity={0.25} distance={0.35} shadow={false} />}
      </BedroomNight>
    </Stage>
  );
};
// ---------------------------------------------------------------- end
export {AbsoluteFill, interpolate};
