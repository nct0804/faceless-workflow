/**
 * Reusable hero props with live canvas surfaces (frame-driven, deterministic).
 *   <Phone3D at rot screen={(ctx,w,h)=>...} glow={1.4} />   a phone whose screen is any 2D drawing (posts, likes,
 *                                                           screen time, refresh); screen={null} = dark glass
 *   <Sketchbook at rot draw={(ctx,w,h)=>...} />             open sketchbook, the right page is a live canvas
 *   <Pencil at rot />
 * Screen drawers for the phone live in ../kit/canvas.tsx (drawPostScreen, drawFeedRefresh, ...) and here
 * (drawLikesBig, drawScreenTime).
 */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CAPTION_FONT as FONT} from './Captions';
import {outlineMat, toon} from './materials';

type V3 = [number, number, number];
const D = THREE.MathUtils.degToRad;
const eul = (r: V3 = [0, 0, 0]) => new THREE.Euler(D(r[0]), D(r[1]), D(r[2]), 'YXZ');

const useCanvas = (w: number, h: number) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return {c, t};
  }, [w, h]);

const BODY = toon({color: '#1A1D26', pattern: 'plain', rimStrength: 0.5});
const BEZEL = new THREE.MeshBasicMaterial({color: '#08090C'});

export const SCREEN_W = 450;
export const SCREEN_H = 922;

/** a phone: 7.5 x 14.6 cm. Origin at the centre of the screen face; +Z out of the screen. */
export const Phone3D: React.FC<{
  at: V3;
  rot?: V3; // degrees [x pitch, y yaw, z roll], applied yaw first (YXZ)
  screen?: ((ctx: CanvasRenderingContext2D, w: number, h: number) => void) | null;
  glow?: number; // screen brightness (>1 blooms)
  scale?: number;
}> = ({at, rot, screen, glow = 1.35, scale = 1}) => {
  const {c, t} = useCanvas(SCREEN_W, SCREEN_H);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({map: t, toneMapped: false}), [t]);
  if (screen) {
    const ctx = c.getContext('2d')!;
    ctx.save();
    screen(ctx, SCREEN_W, SCREEN_H);
    ctx.restore();
    t.needsUpdate = true;
  }
  mat.color.setScalar(screen ? glow : 0.0);
  const sw = 0.066;
  const sh = (sw * SCREEN_H) / SCREEN_W;
  return (
    <group position={at} rotation={eul(rot)} scale={scale}>
      <mesh material={BODY} castShadow position={[0, 0, -0.0045]}>
        <boxGeometry args={[0.075, sh + 0.012, 0.009]} />
      </mesh>
      <mesh material={BEZEL} position={[0, 0, 0.0002]} userData={{noInk: true}}>
        <planeGeometry args={[0.072, sh + 0.008]} />
      </mesh>
      <mesh material={screen ? mat : BEZEL} position={[0, 0, 0.0006]} userData={{noInk: true}}>
        <planeGeometry args={[sw, sh]} />
      </mesh>
    </group>
  );
};

const PAPER = toon({color: '#E8E0CC', pattern: 'paper', rimStrength: 0.15});
const COVER = toon({color: '#3E5B74', pattern: 'fabric', rimStrength: 0.2});

/** open A4-ish sketchbook lying flat (spine along X). draw() paints the right-hand page (portrait 512x700) */
export const Sketchbook: React.FC<{at: V3; rot?: V3; draw?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void}> = ({
  at, rot, draw,
}) => {
  const {c, t} = useCanvas(512, 700);
  const pageMat = useMemo(() => toon({color: '#FFFFFF', pattern: 'plain', map: t, rimStrength: 0.1}), [t]);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#E8E0CC';
  ctx.fillRect(0, 0, 512, 700);
  if (draw) {
    ctx.save();
    draw(ctx, 512, 700);
    ctx.restore();
  }
  t.needsUpdate = true;
  const W = 0.2;
  const H = 0.28;
  return (
    <group position={at} rotation={eul(rot)}>
      <mesh material={COVER} position={[0, 0.002, 0]} receiveShadow castShadow>
        <boxGeometry args={[W * 2 + 0.02, 0.004, H + 0.016]} />
      </mesh>
      <mesh material={PAPER} position={[-W / 2 - 0.002, 0.007, 0]} receiveShadow>
        <boxGeometry args={[W, 0.006, H]} />
      </mesh>
      <mesh material={pageMat} position={[W / 2 + 0.002, 0.0101, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, H]} />
      </mesh>
    </group>
  );
};

const PENCIL = toon({color: '#D9B26A', pattern: 'plain', rimStrength: 0.3});
const LEAD = new THREE.MeshBasicMaterial({color: '#2A2A30'});
/** pencil along +X with the tip at +X */
export const Pencil: React.FC<{at: V3; rot?: V3}> = ({at, rot}) => (
  <group position={at} rotation={eul(rot)}>
    <mesh material={PENCIL} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.0045, 0.0045, 0.16, 6]} />
    </mesh>
    <mesh material={LEAD} position={[0.088, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.0045, 0.016, 6]} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- phone screens (450 x 922)

const heart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
};

/** the scoreboard: one giant like counter (digits roll like a stadium board). roll 0..1 animates to `likes` */
export const drawLikesBig = (
  ctx: CanvasRenderingContext2D, w: number, h: number,
  o: {likes: number; from?: number; roll?: number; label?: string; tint?: string},
) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, w);
  g.addColorStop(0, 'rgba(242,169,59,0.22)');
  g.addColorStop(1, 'rgba(242,169,59,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const roll = Math.max(0, Math.min(1, o.roll ?? 1));
  const from = o.from ?? 0;
  const v = from + (o.likes - from) * roll;
  const n = Math.floor(v);
  const frac = v - n;
  heart(ctx, w / 2, h * 0.2, 120);
  ctx.fillStyle = o.tint ?? '#F2A93B';
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = `bold 230px ${FONT}`;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, h * 0.36, w, 240);
  ctx.clip();
  ctx.fillStyle = '#F3EFE6';
  ctx.fillText(String(n), w / 2, h * 0.36 + 200 - frac * 240);
  if (frac > 0) ctx.fillText(String(n + 1), w / 2, h * 0.36 + 200 + 240 - frac * 240);
  ctx.restore();
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `44px ${FONT}`;
  ctx.fillText(o.label ?? 'likes', w / 2, h * 0.68);
  ctx.textAlign = 'left';
};

/** OS "screen time" card: pickups today, a bar chart, and drawings = 0 */
export const drawScreenTime = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {pickups: number; p?: number}) => {
  const p = Math.max(0, Math.min(1, o.p ?? 1));
  ctx.fillStyle = '#10131A';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `30px ${FONT}`;
  ctx.fillText('Screen Time · Friday', 34, 90);
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `bold 64px ${FONT}`;
  ctx.fillText('Pickups', 34, 180);
  ctx.fillStyle = '#F2A93B';
  ctx.font = `bold 190px ${FONT}`;
  ctx.fillText(String(Math.round(o.pickups * p)), 30, 370);
  // hourly bars
  for (let i = 0; i < 16; i++) {
    const v = [2, 1, 0, 0, 3, 6, 8, 5, 7, 9, 6, 8, 10, 9, 7, 5][i] / 10;
    const bh = 220 * v * Math.min(1, p * 1.4);
    ctx.fillStyle = i > 11 ? '#F2A93B' : '#5468A8';
    ctx.fillRect(34 + i * 24, 640 - bh, 16, bh);
  }
  ctx.fillStyle = '#2B3245';
  ctx.fillRect(34, 642, w - 68, 3);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `30px ${FONT}`;
  ctx.fillText('Drawings', 34, 740);
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `bold 70px ${FONT}`;
  ctx.fillText('0', 34, 820);
};

/** a stranger's own post with a tiny like count: "counting their own likes" */
export const drawTheirPost = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {likes: number; hue: number; seed: number}) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `hsl(${o.hue}, 35%, 45%)`;
  ctx.fillRect(0, 140, w, w);
  // simple photo shapes
  ctx.fillStyle = `hsl(${(o.hue + 40) % 360}, 40%, 70%)`;
  ctx.beginPath();
  ctx.arc(w * (0.3 + (o.seed % 5) * 0.1), 140 + w * 0.4, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `hsl(${(o.hue + 200) % 360}, 30%, 25%)`;
  ctx.fillRect(0, 140 + w * 0.7, w, w * 0.3);
  heart(ctx, 60, 140 + w + 40, 50);
  ctx.strokeStyle = '#F3EFE6';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `bold 64px ${FONT}`;
  ctx.fillText(String(o.likes), 110, 140 + w + 86);
};

/** glowing text card (alarm-clock digits, signs, scoreboards): canvas text on an emissive plane */
export const GlowText: React.FC<{at: V3; rot?: V3; text: string; size: [number, number]; color?: string; glow?: number; bg?: string; font?: string}> = ({
  at, rot, text, size, color = '#F2A93B', glow = 2.2, bg = '#0A0B0F', font,
}) => {
  const W = 512;
  const H = Math.round((512 * size[1]) / size[0]);
  const {c, t} = useCanvas(W, H);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({map: t, toneMapped: false}), [t]);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let px = Math.round(H * 0.72);
  ctx.font = font ?? `bold ${px}px ${FONT}`;
  const tw = ctx.measureText(text).width;
  if (!font && tw > W * 0.9) {
    px = Math.floor((px * W * 0.9) / tw); // fit the card
    ctx.font = `bold ${px}px ${FONT}`;
  }
  ctx.fillText(text, W / 2, H / 2 + H * 0.04);
  t.needsUpdate = true;
  mat.color.setScalar(glow);
  return (
    <mesh position={at} rotation={eul(rot)} material={mat} userData={{noInk: true}}>
      <planeGeometry args={size} />
    </mesh>
  );
};

// ---------------------------------------------------------------- holding things (use with <Character reach>)

/** world point of a local offset on an object placed with (at, rot) like Phone3D / Sketchbook */
export const localToWorld = (at: V3, rot: V3 | undefined, local: V3): V3 => {
  const v = new THREE.Vector3(...local).applyEuler(eul(rot));
  return [at[0] + v.x, at[1] + v.y, at[2] + v.z];
};

/** where two mittens go to hold a phone at (at, rot): on its long sides, a little behind the glass */
export const gripPoints = (at: V3, rot?: V3, oneHand?: 'L' | 'R'): {L?: V3; R?: V3} => {
  // phone local +X = viewer's right of the screen. The holder looks at the screen, so their RIGHT hand is at +X.
  const R = localToWorld(at, rot, [0.058, -0.025, -0.02]);
  const L = localToWorld(at, rot, [-0.058, -0.025, -0.02]);
  if (oneHand === 'R') return {R: localToWorld(at, rot, [0.0, -0.05, -0.035])};
  if (oneHand === 'L') return {L: localToWorld(at, rot, [0.0, -0.05, -0.035])};
  return {L, R};
};

/** the page point (u right, v down; 0..1 over the right-hand page) of an open <Sketchbook at rot> */
export const pagePoint = (book: V3, rot: V3 | undefined, u: number, v: number, lift = 0.012): V3 =>
  localToWorld(book, rot, [0.102 + (u - 0.5) * 0.2, lift, (v - 0.5) * 0.28]);

/** drawPage() box -> page coords: a stroke point (0..1) to (u, v) on the page */
export const strokeToPage = (p: [number, number]): [number, number] => [0.06 + 0.88 * p[0], 0.12 + 0.84 * p[1]];

/** pencil from its tip to its butt (a real pencil: hexagon body, sharpened cone, eraser) */
export const PencilBetween: React.FC<{tip: V3; butt: V3}> = ({tip, butt}) => {
  const a = new THREE.Vector3(...tip);
  const b = new THREE.Vector3(...butt);
  const len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <group position={mid.toArray() as V3} quaternion={q}>
      <mesh material={PENCIL} position={[0, 0.008, 0]} castShadow>
        <cylinderGeometry args={[0.0048, 0.0048, len - 0.016, 6]} />
      </mesh>
      <mesh material={WOODTIP} position={[0, -len / 2 + 0.0095, 0]}>
        <coneGeometry args={[0.0048, 0.013, 6]} />
      </mesh>
      <mesh material={LEAD} position={[0, -len / 2 + 0.002, 0]}>
        <coneGeometry args={[0.0016, 0.004, 6]} />
      </mesh>
      <mesh material={ERASER} position={[0, len / 2 - 0.004, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.012, 10]} />
      </mesh>
    </group>
  );
};
const WOODTIP = toon({color: '#E8C99A', pattern: 'plain', rimStrength: 0.1});
const ERASER = toon({color: '#E58C8A', pattern: 'plain', rimStrength: 0.2});

/** a hand drawing on an open sketchbook: pencil tip on the page at (u, v), the mitten wrapped around the pencil.
 *  Returns everything a shot needs: <Character reach={{R: g.hand, L: g.rest}}> + <PencilBetween tip butt>. */
export const drawGrip = (book: V3, rot: V3 | undefined, uv: [number, number], bookYaw = 0) => {
  const tip = pagePoint(book, rot, uv[0], uv[1], 0.011);
  // pencil leans back toward the drawer (+Z of the book) and to their right (+X), like a real grip
  const dir = new THREE.Vector3(0.3, 0.78, 0.55).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(bookYaw));
  const t = new THREE.Vector3(...tip);
  const butt = t.clone().add(dir.clone().multiplyScalar(0.16));
  const hand = t.clone().add(dir.clone().multiplyScalar(0.075)).add(new THREE.Vector3(0.012, 0.012, 0.01));
  const rest = pagePoint(book, rot, -0.75, 0.62, 0.035); // other hand flat on the left page
  return {tip, butt: butt.toArray() as V3, hand: hand.toArray() as V3, rest};
};

const SKIN = toon({color: '#EDE6D6', pattern: 'plain', rimStrength: 0.25, ramp: [168, 168, 255, 255]});
const ARMINK = new THREE.MeshBasicMaterial({color: '#16181E'});
/** a first-person arm for POV shots: ink stick from an off-screen shoulder to a round mitten (same look as the rig) */
export const PovArm: React.FC<{shoulder: V3; hand: V3; skin?: string}> = ({shoulder, hand}) => {
  const a = new THREE.Vector3(...shoulder);
  const b = new THREE.Vector3(...hand);
  const len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  const hull = useMemo(() => outlineMat(3.2), []);
  return (
    <>
      <mesh material={ARMINK} position={mid.toArray() as V3} quaternion={q}>
        <cylinderGeometry args={[0.022, 0.022, len, 10]} />
      </mesh>
      <group position={hand}>
        <mesh material={SKIN} scale={[0.048, 0.05, 0.048]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        <mesh material={hull} scale={[0.048, 0.05, 0.048]} userData={{noInk: true}}>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
      </group>
    </>
  );
};
