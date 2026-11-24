/**
 * A Blender-built character (mo | theo | lia | dex | crowd) posed per frame.
 * Bones are rotated in CHARACTER space (x = character's left/right axis, y = up, z = toward the camera when the
 * character faces the camera), so poses read the same whatever way the rig was authored.
 */
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {instantiate, useGLB} from './assets';
import {drawFace, type FaceState} from './face';
import {CHAR_RAMP, toon} from './materials';

export type Pose = {
  /** arm raise from hanging, degrees (90 = straight out sideways, 160 = up) */
  armL?: number;
  armR?: number;
  /** arm swing forward (+) / back (-), degrees */
  fwdL?: number;
  fwdR?: number;
  /** elbow bend, degrees (+ = forearm forward/up) */
  elbowL?: number;
  elbowR?: number;
  headTilt?: number; // roll, deg (+ = toward character's left)
  headNod?: number; // pitch, deg (+ = look down)
  headTurn?: number; // yaw, deg (+ = toward character's left)
  lean?: number; // spine pitch forward, deg
  side?: number; // spine roll, deg
  twist?: number; // spine yaw, deg
  sit?: number; // 0 stand .. 1 sitting (hips at chair height)
  walk?: number; // phase in cycles (0..1 repeats); amplitude via walkAmp
  walkAmp?: number;
  slump?: number; // 0..1 sad posture (head down, shoulders in)
  breathe?: number; // frame-driven breathing phase (radians)
  /** stance (RicksClips poses are never stiff): legs apart (deg), knee bend (deg), hip shift sideways (m) */
  legL?: number;
  legR?: number;
  kneeL?: number;
  kneeR?: number;
  hipShift?: number;
};

/** tested pose presets (see looks/CharTest.tsx) */
export const POSES = {
  holdPhone: {fwdL: 35, fwdR: 35, armL: -12, armR: -12, elbowL: 95, elbowR: 95, headNod: 18} as Pose,
  holdPhoneLow: {fwdL: 25, fwdR: 25, armL: -10, armR: -10, elbowL: 70, elbowR: 70, headNod: 22} as Pose,
  cheer: {armL: 150, armR: 150, elbowL: 20, elbowR: 20} as Pose,
  shrug: {armL: 35, armR: 35, elbowL: 80, elbowR: 80, headTilt: 8} as Pose,
  wave: {armR: 140, elbowR: 30, headTilt: -6} as Pose,
  defeated: {slump: 1, armL: 4, armR: 4} as Pose,
};

const AX = {x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1)};
const D = THREE.MathUtils.degToRad;

export type CharacterProps = {
  id: 'mo' | 'theo' | 'lia' | 'dex' | 'crowd';
  position?: [number, number, number];
  rotation?: number; // yaw degrees (0 = facing camera / +Z)
  scale?: number;
  pose?: Pose;
  face?: FaceState;
  outline?: number;
  recolor?: Record<string, string>;
  visible?: boolean;
  /** IK: put the hands EXACTLY here (world space). The arms solve themselves (two-bone IK, elbows down/out).
   *  Use with gripPoints() / drawGrip() in Props.tsx so held things are really held. */
  reach?: {L?: [number, number, number]; R?: [number, number, number]; poleL?: [number, number, number]; poleR?: [number, number, number]};
  /** 0..1 idle life: head drift + tilt, weight shift, arm sway (each character on its own rhythm). 0 = frozen */
  alive?: number;
};

export const Character: React.FC<CharacterProps> = ({
  id, position = [0, 0, 0], rotation = 0, scale = 1, pose = {}, face = {}, outline = 4, recolor, visible = true, reach, alive = 1,
}) => {
  const frame = useCurrentFrame();
  const g = useGLB(id);
  const {canvas, tex, faceMat} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 1024; // sharp faces in close-ups
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.flipY = false; // glTF UV convention
    // lit like the head (cel), so the face sits IN the light instead of glowing on top of it
    // the face is lit like the head (same self-lit share), so it sits IN the head, crisp and white
    const m = toon({color: '#FFFFFF', pattern: 'plain', map: t, ramp: CHAR_RAMP, transparent: true, selfLit: 0.6, rimStrength: 0});
    m.depthWrite = false;
    m.polygonOffset = true;
    m.polygonOffsetFactor = -2;
    m.polygonOffsetUnits = -2;
    return {canvas: c, tex: t, faceMat: m};
  }, []);

  const inst = useMemo(() => {
    if (!g) return null;
    const r = instantiate(g, {outline, recolor, faceMaterial: faceMat});
    const rest: Record<string, THREE.Quaternion> = {};
    for (const [n, b] of Object.entries(r.bones)) rest[n] = b.quaternion.clone();
    return {...r, rest, hips0: r.bones.hips?.position.clone()};
  }, [g, outline, recolor, faceMat]);

  // ---------------------------------------------------------------- face
  useLayoutEffect(() => {
    const ctx = canvas.getContext('2d')!;
    drawFace(ctx, face);
    tex.needsUpdate = true;
  });

  // ---------------------------------------------------------------- pose
  useLayoutEffect(() => {
    if (!inst) return;
    const {root, bones, rest} = inst;
    root.position.set(...position);
    root.rotation.set(0, D(rotation), 0);
    root.scale.setScalar(scale);
    root.visible = visible;
    for (const [n, b] of Object.entries(bones)) b.quaternion.copy(rest[n]);
    const hips = bones.hips;
    if (hips && inst.hips0) hips.position.copy(inst.hips0);
    root.updateMatrixWorld(true);
    const rootQ = root.getWorldQuaternion(new THREE.Quaternion());

    /** rotate bone by `deg` around a CHARACTER-space axis (applied on top of what's there) */
    // GLTFLoader sanitizes node names ('arm.L.1' -> 'armL1')
    const bone = (n: string) => bones[n] ?? bones[n.replace(/[.\s]/g, '')];
    const rot = (name: string, axis: THREE.Vector3, deg: number) => {
      const b = bone(name);
      if (!b || !deg) return;
      b.updateWorldMatrix(true, false);
      const pq = b.parent ? b.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
      const wAxis = axis.clone().applyQuaternion(rootQ);
      const dq = new THREE.Quaternion().setFromAxisAngle(wAxis, D(deg));
      const local = pq.clone().invert().multiply(dq).multiply(pq);
      b.quaternion.premultiply(local);
      b.updateMatrixWorld(true);
    };

    // idle life: a slow, per-character drift (never a frozen statue)
    const seed = (id.length * 1.7 + position[0] * 3.1 + position[2] * 1.3) % 6.28;
    const t = frame / 30;
    const life = {
      headTilt: alive * (Math.sin(t * 0.9 + seed) * 3 + Math.sin(t * 2.3 + seed * 2) * 1.2),
      headTurn: alive * Math.sin(t * 0.55 + seed * 1.3) * 4,
      headNod: alive * Math.sin(t * 1.4 + seed) * 1.5,
      side: alive * Math.sin(t * 0.7 + seed) * 1.6,
      arm: alive * Math.sin(t * 1.1 + seed) * 3,
    };
    const p = {...pose,
      headTilt: (pose.headTilt ?? 0) + life.headTilt, headTurn: (pose.headTurn ?? 0) + life.headTurn,
      headNod: (pose.headNod ?? 0) + life.headNod, side: (pose.side ?? 0) + life.side,
      armL: (pose.armL ?? 8) + life.arm, armR: (pose.armR ?? 8) - life.arm,
      breathe: pose.breathe ?? t * 2.6 + seed};
    const br = Math.sin(p.breathe ?? 0);
    if (p.hipShift) root.position.x += p.hipShift * Math.cos(D(rotation));
    const slump = p.slump ?? 0;
    const walkA = p.walkAmp ?? 1;
    const ph = (p.walk ?? 0) * Math.PI * 2;
    const walking = p.walk !== undefined;
    const sit = p.sit ?? 0;

    // hips: bob when walking, drop when sitting
    if (walking) root.position.y += Math.abs(Math.sin(ph)) * 0.03 * walkA;
    // spine
    rot('spine', AX.x, (p.lean ?? 0) + slump * 14 + br * 0.8);
    rot('spine', AX.z, p.side ?? 0);
    rot('spine', AX.y, (p.twist ?? 0) + (walking ? Math.sin(ph) * 4 * walkA : 0));
    rot('chest', AX.x, slump * 8);
    // head
    rot('head', AX.y, p.headTurn ?? 0);
    rot('head', AX.x, (p.headNod ?? 0) + slump * 18 - br * 0.6);
    rot('head', AX.z, p.headTilt ?? 0);
    // arms: raise sideways (L = +x side -> rotate around +z positive raises it), then swing forward
    const swingL = walking ? -Math.sin(ph) * 22 * walkA : 0;
    const swingR = walking ? Math.sin(ph) * 22 * walkA : 0;
    rot('arm.L.1', AX.x, -((p.fwdL ?? 0) + swingL));
    rot('arm.R.1', AX.x, -((p.fwdR ?? 0) + swingR));
    rot('arm.L.1', AX.z, (p.armL ?? 8) - slump * 6);
    rot('arm.R.1', AX.z, -((p.armR ?? 8) - slump * 6));
    rot('arm.L.2', AX.x, -(p.elbowL ?? 6));
    rot('arm.R.2', AX.x, -(p.elbowR ?? 6));
    // legs
    if (sit > 0) {
      rot('leg.L.1', AX.x, -88 * sit);
      rot('leg.R.1', AX.x, -88 * sit);
      rot('leg.L.2', AX.x, 88 * sit);
      rot('leg.R.2', AX.x, 88 * sit);
    }
    // stance: legs apart + knee bend (the counter-rotation keeps the feet under the body)
    if (p.legL) rot('leg.L.1', AX.z, p.legL);
    if (p.legR) rot('leg.R.1', AX.z, -p.legR);
    if (p.kneeL) { rot('leg.L.1', AX.x, -p.kneeL * 0.5); rot('leg.L.2', AX.x, p.kneeL); }
    if (p.kneeR) { rot('leg.R.1', AX.x, -p.kneeR * 0.5); rot('leg.R.2', AX.x, p.kneeR); }
    if (p.kneeL || p.kneeR) root.position.y -= 0.002 * Math.max(p.kneeL ?? 0, p.kneeR ?? 0);
    if (walking) {
      rot('leg.L.1', AX.x, -Math.sin(ph) * 28 * walkA);
      rot('leg.R.1', AX.x, Math.sin(ph) * 28 * walkA);
      rot('leg.L.2', AX.x, Math.max(0, Math.cos(ph)) * 30 * walkA);
      rot('leg.R.2', AX.x, Math.max(0, -Math.cos(ph)) * 30 * walkA);
    }
    root.updateMatrixWorld(true);

    // ---------------------------------------------------------------- IK (after FK, so spine/head poses still apply)
    if (reach) {
      const aim = (b: THREE.Bone, dir: THREE.Vector3) => {
        b.updateWorldMatrix(true, false);
        const qw = b.getWorldQuaternion(new THREE.Quaternion());
        const cur = new THREE.Vector3(0, 1, 0).applyQuaternion(qw); // bones point along local +Y (checked in the GLB)
        const dq = new THREE.Quaternion().setFromUnitVectors(cur, dir.clone().normalize());
        const pq = b.parent ? b.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
        b.quaternion.copy(pq.invert().multiply(dq.multiply(qw)));
        b.updateMatrixWorld(true);
      };
      const solve = (side: 'L' | 'R', T?: [number, number, number], pole?: [number, number, number]) => {
        if (!T) return;
        const b1 = bone(`arm.${side}.1`);
        const b2 = bone(`arm.${side}.2`);
        if (!b1 || !b2) return;
        root.updateMatrixWorld(true);
        const S = b1.getWorldPosition(new THREE.Vector3());
        const E0 = b2.getWorldPosition(new THREE.Vector3());
        const L1 = S.distanceTo(E0);
        const L2 = L1 * 1.08; // forearm + mitten centre
        const t = new THREE.Vector3(...T);
        const D = t.clone().sub(S);
        const d = THREE.MathUtils.clamp(D.length(), Math.abs(L1 - L2) + 0.01, (L1 + L2) * 0.999);
        const dir = D.normalize();
        const sgn = side === 'L' ? 1 : -1;
        // elbow hint: down, out to the side, a little back (character space)
        const P = pole ? new THREE.Vector3(...pole) : S.clone().add(new THREE.Vector3(sgn * 0.45, -0.6, -0.25).multiplyScalar(scale).applyQuaternion(rootQ));
        const toP = P.sub(S);
        const perp = toP.sub(dir.clone().multiplyScalar(toP.dot(dir))).normalize();
        const cosA = THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * d * L1), -1, 1);
        const E = S.clone().add(dir.clone().multiplyScalar(L1 * cosA)).add(perp.multiplyScalar(L1 * Math.sqrt(1 - cosA * cosA)));
        aim(b1, E.clone().sub(S));
        const H = S.clone().add(dir.clone().multiplyScalar(d));
        aim(b2, H.sub(b2.getWorldPosition(new THREE.Vector3())));
      };
      solve('L', reach.L, reach.poleL);
      solve('R', reach.R, reach.poleR);
      root.updateMatrixWorld(true);
    }
  });

  if (!inst) return null;
  return <primitive object={inst.root} />;
};

/** deterministic blink: returns 0..1 for frame f (blinks every ~3.3 s, offset per character) */
export const blinkAt = (f: number, offset = 40, every = 100) => {
  const t = (f + offset) % every;
  return t < 2 ? 0.6 : t < 4 ? 1 : t < 6 ? 0.5 : 0;
};
