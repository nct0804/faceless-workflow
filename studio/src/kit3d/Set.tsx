/**
 * A Blender-built set (studio/public/assets/set_<name>.glb). Screen-space ink draws its lines, so no hulls.
 *   const set = useSet('bedroom');  set?.marks.MARK_mo_desk  (three.js coords)
 *   <SetView set={set} hide={['ceiling']} />
 */
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {instantiate, styleMaterial, useGLB} from './assets';

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
}> = ({set, hide = [], ghost = [], recolor}) => {
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
