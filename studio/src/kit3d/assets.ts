/**
 * Load Blender-built GLBs (studio/public/assets/*.glb) once, block rendering until ready, then hand out clones
 * whose materials are converted to the house style by name (see materials.ts).
 */
import {useEffect, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skeletonClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {CHAR_RAMP, glow, inkMat, outlineMat, toon} from './materials';

const cache = new Map<string, Promise<GLTF>>();
const done = new Map<string, GLTF>();

const load = (name: string) => {
  if (!cache.has(name)) {
    const p = new GLTFLoader().loadAsync(staticFile(`assets/${name}.glb`)).then((g) => {
      done.set(name, g);
      return g;
    });
    cache.set(name, p);
  }
  return cache.get(name)!;
};

/** every GLB a Stage may use. Stage preloads them BEFORE mounting the canvas: R3F only redraws when the
 *  Remotion frame changes, so an asset arriving after the first draw would otherwise be missing from the frame */
export const ALL_ASSETS = ['mo', 'theo', 'lia', 'dex', 'crowd', 'set_bedroom', 'set_stadium', 'set_vignettes'];

export const usePreload = (names: string[] = ALL_ASSETS) => {
  const ready = names.every((n) => done.has(n));
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender(`Preloading ${names.join(',')}`)));
  useEffect(() => {
    if (handle === null) return;
    Promise.all(names.map(load))
      .then(() => {
        setOk(true);
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle, names]);
  return ok;
};

/** returns the loaded GLTF (or null while loading; rendering is held with delayRender) */
export const useGLB = (name: string) => {
  const [g, setG] = useState<GLTF | null>(done.get(name) ?? null);
  const [handle] = useState(() => (done.has(name) ? null : delayRender(`Loading ${name}.glb`)));
  useEffect(() => {
    if (handle === null) return;
    load(name)
      .then((x) => {
        setG(x);
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [name, handle]);
  return g;
};

const matCache = new Map<string, THREE.Material>();

export type StyleOpts = {
  /** draw inverted-hull outlines on TOON meshes (characters, hero props). Sets get screen-space ink instead */
  outline?: number; // px at 1080 (0 = none)
  /** override colours per material name (e.g. recolour the hoodie) */
  recolor?: Record<string, string>;
  faceMaterial?: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  rim?: string;
  rimStrength?: number;
};

/** convert one Blender material to the house style */
export const styleMaterial = (m: THREE.Material, ao: boolean, skinned: boolean, o: StyleOpts) => {
  const name = m.name;
  const std = m as THREE.MeshStandardMaterial;
  const base = o.recolor?.[name] ?? '#' + (std.color ? std.color.getHexString(THREE.SRGBColorSpace) : 'ffffff');
  const key = `${name}|${ao}|${skinned}|${base}|${o.rim}|${o.rimStrength}`;
  if (name === 'FACE' && o.faceMaterial) return o.faceMaterial;
  if (matCache.has(key)) return matCache.get(key)!;
  let out: THREE.Material;
  if (name.startsWith('GLOW_')) {
    const e = std.emissive && std.emissive.getHex() ? '#' + std.emissive.getHexString(THREE.SRGBColorSpace) : base;
    out = glow(o.recolor?.[name] ?? e, 2.4);
  } else if (name === 'INK') {
    out = inkMat();
  } else {
    const pattern = name.startsWith('TOON_') ? name.split('_')[1] : 'plain';
    out = skinned
      ? toon({color: base, pattern: 'plain', ao: false, rim: o.rim, rimStrength: o.rimStrength ?? 0.28, ramp: CHAR_RAMP})
      : toon({color: base, pattern, ao, rim: o.rim, rimStrength: o.rimStrength});
  }
  matCache.set(key, out);
  return out;
};

/** deep clone (skeleton-aware) + restyle + optional outlines. Returns root + bones + marks */
export const instantiate = (g: GLTF, o: StyleOpts = {}) => {
  const root = skeletonClone(g.scene) as THREE.Group;
  const marks: Record<string, THREE.Vector3> = {};
  /** custom properties set in Blender (glTF extras), e.g. MARK_stands layout numbers */
  const markData: Record<string, Record<string, unknown>> = {};
  const bones: Record<string, THREE.Bone> = {};
  const outlines: THREE.Mesh[] = [];
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) bones[obj.name] = obj as THREE.Bone;
    if (obj.name.startsWith('MARK_') || obj.name.startsWith('LIGHT_')) {
      marks[obj.name] = obj.getWorldPosition(new THREE.Vector3());
      markData[obj.name] = obj.userData;
    }
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const ao = !!mesh.geometry.attributes.color;
    const skinned = !!(mesh as THREE.SkinnedMesh).isSkinnedMesh;
    const src = mesh.material as THREE.Material;
    mesh.material = styleMaterial(src, ao, skinned, o);
    mesh.userData.src = src; // original Blender material (for per-shot recolours: SetView recolor)
    mesh.userData.ao = ao;
    mesh.castShadow = o.castShadow ?? true;
    // characters don't receive shadows: self-shadowing made blotchy bands on the big round head
    mesh.receiveShadow = o.receiveShadow ?? !skinned;
    if (src.name.startsWith('GLOW_')) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
    if (src.name === 'FACE') {
      mesh.castShadow = false;
      mesh.userData.noInk = true;
    }
    if (o.outline && src.name !== 'FACE' && !src.name.startsWith('GLOW_')) {
      outlines.push(mesh);
    }
  });
  for (const mesh of outlines) {
    const om = outlineMat(o.outline!);
    let hull: THREE.Mesh;
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      const sm = mesh as THREE.SkinnedMesh;
      const h = new THREE.SkinnedMesh(sm.geometry, om);
      h.bind(sm.skeleton, sm.bindMatrix);
      hull = h;
    } else {
      hull = new THREE.Mesh(mesh.geometry, om);
    }
    hull.castShadow = false;
    hull.receiveShadow = false;
    hull.userData.noInk = true;
    hull.frustumCulled = false;
    mesh.add(hull);
    // the hull lives in the mesh's local space: undo the parent transform for skinned (skinning is world-based)
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      hull.matrixAutoUpdate = false;
      hull.matrix.identity();
    }
  }
  return {root, bones, marks, markData};
};

/** Blender (+Z up, -Y front) -> three (+Y up, +Z front) for raw Blender coords typed in code */
export const fromBlender = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y);
