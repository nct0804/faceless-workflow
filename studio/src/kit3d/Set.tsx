/**
 * A Blender-built set (studio/public/assets/set_<name>.glb). Screen-space ink draws its lines, so no hulls.
 *   const set = useSet('bedroom');  set?.marks.MARK_mo_desk  (three.js coords)
 *   <SetView set={set} hide={['ceiling']} />
 */
import React, {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {instantiate, styleMaterial, useGLB} from './assets';
import {breeze, hash} from '../kit/wave';

export const useSet = (name: string) => {
  const g = useGLB('set_' + name);
  return useMemo(() => (g ? instantiate(g, {outline: 0, rimStrength: 0.12}) : null), [g]);
};

export const SetView: React.FC<{
  set: ReturnType<typeof useSet>;
  hide?: string[]; // object-name prefixes to hide for this shot (e.g. 'ceiling', 'wall_left')
  /** cutaway walls: invisible to the camera (and to the ink pass) but still casting their shadows, so the camera
   *  can stand "inside" a wall and the light in the room does not change */
  ghost?: string[];
  /** per-shot recolour by Blender material name (time of day: night sky -> day sky, city windows off, ...) */
  recolor?: Record<string, string>;
  /** ambient motion of the set (leaves, curtains, pinned drawings, banners, pendant lamps); 0 = still */
  life?: number;
}> = ({set, hide = [], ghost = [], recolor, life = 1}) => {
  const frame = useCurrentFrame();
  const movers = useMemo(() => (set ? findMovers(set.root) : []), [set]);
  useLayoutEffect(() => {
    const t = frame / 30;
    for (const m of movers) {
      const a = life * m.amp * breeze(t, m.speed, m.seed);
      const q = Q.setFromAxisAngle(m.axis, a);
      m.o.quaternion.copy(q).multiply(m.q0);
      m.o.position.copy(m.p0).sub(m.pivot).applyQuaternion(q).add(m.pivot);
    }
  }, [frame, movers, life]);
  useLayoutEffect(() => {
    if (!set) return;
    set.root.traverse((o) => {
      if (o === set.root) return;
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.visible = !hide.some((h) => o.name.startsWith(h));
      const gh = ghost.some((h) => o.name.startsWith(h));
      if (m.userData.realMat === undefined) m.userData.realMat = m.material;
      const src = m.userData.src as THREE.Material | undefined;
      const rc = recolor && src && recolor[src.name] ? styleMaterial(src, !!m.userData.ao, false, {recolor, rimStrength: 0.12}) : m.userData.realMat;
      m.material = gh ? GHOST : rc;
      m.userData.noInk = gh;
    });
  });
  if (!set) return null;
  return <primitive object={set.root} />;
};

const GHOST = new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false});

export const v3 = (v?: THREE.Vector3, dy = 0): [number, number, number] => (v ? [v.x, v.y + dy, v.z] : [0, 0, 0]);

/* ---------- ambient life: things that hang or grow sway about their pin / stem (parent space) ---------- */
type Mover = {o: THREE.Object3D; p0: THREE.Vector3; q0: THREE.Quaternion; pivot: THREE.Vector3; axis: THREE.Vector3; amp: number; speed: number; seed: number};
type Rule = {test: (n: string) => boolean; pivot: 'top' | 'bottom' | 'pendant'; axis: 'x' | 'thin' | 'xz'; amp: number; speed: number};
const RULES: Rule[] = [
  {test: (n) => n.startsWith('leaf'), pivot: 'bottom', axis: 'xz', amp: 0.07, speed: 0.22},
  {test: (n) => n.startsWith('flower'), pivot: 'bottom', axis: 'xz', amp: 0.1, speed: 0.25},
  {test: (n) => n.startsWith('curtain') && !n.startsWith('curtain_rod'), pivot: 'top', axis: 'x', amp: 0.018, speed: 0.15},
  {test: (n) => n.startsWith('drawing'), pivot: 'top', axis: 'thin', amp: 0.03, speed: 0.18},
  {test: (n) => n.startsWith('banner'), pivot: 'top', axis: 'thin', amp: 0.02, speed: 0.14},
  {test: (n) => n.startsWith('pendant'), pivot: 'pendant', axis: 'xz', amp: 0.05, speed: 0.14},
];
const Q = new THREE.Quaternion();

const parentBox = (o: THREE.Object3D) => {
  const m = o as THREE.Mesh;
  if (!m.geometry) return null;
  if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
  o.updateMatrix();
  return m.geometry.boundingBox!.clone().applyMatrix4(o.matrix);
};

const findMovers = (root: THREE.Object3D): Mover[] => {
  const out: Mover[] = [];
  const cords: THREE.Box3[] = [];
  root.traverse((o) => {
    if (o.name.startsWith('pendant_cord')) {
      const b = parentBox(o);
      if (b) cords.push(b);
    }
  });
  let i = 0;
  root.traverse((o) => {
    const r = RULES.find((x) => x.test(o.name));
    if (!r) return;
    const b = parentBox(o);
    if (!b) return;
    const c = b.getCenter(new THREE.Vector3());
    let pivot = new THREE.Vector3(c.x, r.pivot === 'top' ? b.max.y : b.min.y, c.z);
    if (r.pivot === 'pendant') {
      const near = cords.sort((A, B) => A.getCenter(new THREE.Vector3()).distanceTo(c) - B.getCenter(new THREE.Vector3()).distanceTo(c))[0];
      if (!near) return;
      pivot = new THREE.Vector3((near.min.x + near.max.x) / 2, near.max.y, (near.min.z + near.max.z) / 2);
    }
    const seed = r.pivot === 'pendant' ? pivot.x * 3.1 : i++ * 1.37 + c.x;
    let axis: THREE.Vector3;
    if (r.axis === 'x') axis = new THREE.Vector3(1, 0, 0);
    else if (r.axis === 'xz') axis = new THREE.Vector3(1, 0, (hash(seed) - 0.5) * 1.4).normalize();
    else {
      // the thinnest side of the object's own box = its face normal (it swings in its own plane)
      const s = b.getSize(new THREE.Vector3());
      axis = s.x < s.z ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    }
    out.push({o, p0: o.position.clone(), q0: o.quaternion.clone(), pivot, axis, amp: r.amp, speed: r.speed, seed});
  });
  return out;
};
