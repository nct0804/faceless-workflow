/**
 * The crowd, instanced: hundreds of faceless navy silhouettes with amber eyes, filling any seat layout.
 * Our antagonist image (MERGED_STYLE.md section 1). One draw call per part, so a full stadium costs nothing.
 *
 *   const seats = stadiumSeats(set.markData.MARK_stands)        // from the Blender set's layout numbers
 *   <CrowdInstances seats={seats} look={[0,1,0]} down={0..1} wave={0.6} />
 *
 * down = 0: heads up, amber eyes stare at `look` (what Mo imagines)
 * down = 1: heads bowed over their own phones; the amber was their screens all along (the reveal)
 * wave: the bow travels around the stadium (0 = all at once, 1 = a full lap of delay)
 */
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {toon} from './materials';

export type Seat = {x: number; y: number; z: number; yaw: number; tier: number; angle: number; seed: number};

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** seats of a ring of bleachers (Blender layout: angle 0 = +Y blender = -Z three.js, CCW from above).
 *  Values come from MARK_stands' custom props (assets/blender/sets/stadium.py) */
export const stadiumSeats = (
  d: Record<string, unknown> | undefined,
  o: {spacing?: number; fill?: number; tiers?: [number, number]} = {},
): Seat[] => {
  if (!d) return [];
  const r0 = Number(d.r0), depth = Number(d.depth), rise = Number(d.rise), tiers = Number(d.tiers);
  const a0 = Number(d.a0), a1 = Number(d.a1), aisleW = Number(d.aisleW), seatZ = Number(d.seatZ);
  const aisles = (d.aisles as number[]) ?? [];
  const spacing = o.spacing ?? 0.62;
  const fill = o.fill ?? 0.92;
  const [t0, t1] = o.tiers ?? [0, tiers];
  const out: Seat[] = [];
  for (let t = t0; t < t1; t++) {
    const r = r0 + t * depth + 0.25;
    const step = (spacing / r) * (180 / Math.PI);
    for (let a = a0 + step / 2; a < a1; a += step) {
      if (aisles.some((c) => Math.abs(a - c) < aisleW / 2 + 0.6)) continue;
      const seed = t * 1000 + Math.round(a * 10);
      if (rnd(seed) > fill) continue;
      const ar = THREE.MathUtils.degToRad(a);
      const x = -Math.sin(ar) * r;
      const z = -Math.cos(ar) * r;
      out.push({x, y: seatZ + t * rise, z, yaw: Math.atan2(-x, -z), tier: t, angle: a, seed});
    }
  }
  return out;
};

const BODY = toon({color: '#1A2030', pattern: 'fabric', rimStrength: 0.22});
const HEAD = toon({color: '#1C2235', pattern: 'plain', rimStrength: 0.3});
const glowMat = () => new THREE.MeshBasicMaterial({color: '#FFFFFF', toneMapped: false});

export const CrowdInstances: React.FC<{
  seats: Seat[];
  look?: [number, number, number]; // where heads/eyes aim while up
  down?: number; // 0..1
  wave?: number;
  eye?: string; // amber
  eyeGlow?: number;
  skip?: [number, number][]; // [x, z] seats taken by hero characters
  /** empty blocks of seats (tiers t0..t1-1, angles a0..a1) so a camera can travel through the stands */
  clear?: {t0: number; t1: number; a0: number; a1: number}[];
  scale?: number;
}> = ({seats, look = [0, 1.2, 0], down = 0, wave = 0, eye = '#F2A93B', eyeGlow = 3.2, skip = [], clear = [], scale = 1}) => {
  const list = useMemo(
    () => seats.filter((s) => !skip.some(([x, z]) => Math.hypot(s.x - x, s.z - z) < 0.45)
      && !clear.some((c) => s.tier >= c.t0 && s.tier < c.t1 && s.angle >= c.a0 && s.angle <= c.a1)),
    [seats, skip.map((p) => p.join()).join('|'), JSON.stringify(clear)],
  );
  const n = list.length;
  const {body, head, eyes, phones} = useMemo(() => {
    const cap = new THREE.CapsuleGeometry(0.2, 0.26, 6, 14);
    const sph = new THREE.SphereGeometry(1, 20, 14);
    const bar = new THREE.PlaneGeometry(0.2, 0.05);
    const ph = new THREE.PlaneGeometry(0.065, 0.12);
    const mk = (g: THREE.BufferGeometry, m: THREE.Material, shadow: boolean) => {
      const im = new THREE.InstancedMesh(g, m, Math.max(1, n));
      im.castShadow = shadow;
      im.receiveShadow = shadow;
      im.frustumCulled = false;
      return im;
    };
    const e = mk(bar, glowMat(), false);
    const p = mk(ph, glowMat(), false);
    e.userData.noInk = true;
    p.userData.noInk = true;
    return {body: mk(cap, BODY, true), head: mk(sph, HEAD, true), eyes: e, phones: p};
  }, [n]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const v = new THREE.Vector3();
    const amber = new THREE.Color(eye);
    const col = new THREE.Color();
    const Y = new THREE.Vector3(0, 1, 0);
    const X = new THREE.Vector3(1, 0, 0);
    list.forEach((st, i) => {
      const k = 0.94 + rnd(st.seed + 3) * 0.12;
      // per-seat bow with a travelling delay around the stadium
      const delay = wave * (((st.angle + 180) % 360) / 360);
      const d = THREE.MathUtils.clamp((down * (1 + wave) - delay) / 1, 0, 1);
      const dd = d * d * (3 - 2 * d);
      // aim at `look` while up
      const yawLook = Math.atan2(look[0] - st.x, look[2] - st.z);
      const yaw = yawLook + (rnd(st.seed + 9) - 0.5) * 0.25;
      const bodyQ = new THREE.Quaternion().setFromAxisAngle(Y, st.yaw);
      // body
      s.set(k * scale, k * scale * (0.95 + rnd(st.seed + 5) * 0.1), k * scale);
      v.set(st.x, st.y + 0.36 * k * scale, st.z);
      body.setMatrixAt(i, m.compose(v, bodyQ, s));
      // head: yaw toward look, pitch down when bowed
      const pitch = dd * 0.62 + (rnd(st.seed + 7) - 0.5) * 0.08;
      q.setFromAxisAngle(Y, THREE.MathUtils.lerp(yaw, st.yaw, dd)).multiply(new THREE.Quaternion().setFromAxisAngle(X, pitch));
      const hc = new THREE.Vector3(st.x, st.y + 0.86 * k * scale, st.z);
      s.set(0.27 * k * scale, 0.31 * k * scale, 0.24 * k * scale);
      head.setMatrixAt(i, m.compose(hc, q, s));
      // eyes: a band on the head front (follows the head)
      const fwd = new THREE.Vector3(0, -0.02, 0.245 * k * scale).applyQuaternion(q);
      eyes.setMatrixAt(i, m.compose(hc.clone().add(fwd), q, new THREE.Vector3(k * scale, k * scale, 1)));
      const blink = rnd(st.seed + Math.floor(i / 7)) > 0.985 ? 0.2 : 1;
      col.copy(amber).multiplyScalar(eyeGlow * blink * (1 - 0.85 * dd));
      eyes.setColorAt(i, col);
      // phone in the lap, tilted up to the face; glows in when bowed
      const pq = new THREE.Quaternion().setFromAxisAngle(Y, st.yaw).multiply(new THREE.Quaternion().setFromAxisAngle(X, -0.9));
      const pp = new THREE.Vector3(0, 0.5 * k * scale, 0.26 * k * scale).applyQuaternion(bodyQ).add(new THREE.Vector3(st.x, st.y, st.z));
      const ps = dd > 0.02 ? k * scale : 0; // no dark rectangle in the lap before the reveal
      phones.setMatrixAt(i, m.compose(pp, pq, new THREE.Vector3(ps, ps, 1)));
      col.set('#FFD08A').multiplyScalar(2.6 * dd * (0.8 + rnd(st.seed + 11) * 0.4));
      phones.setColorAt(i, col);
    });
    for (const im of [body, head, eyes, phones]) {
      im.count = list.length;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <primitive object={body} />
      <primitive object={head} />
      <primitive object={eyes} />
      <primitive object={phones} />
    </>
  );
};
