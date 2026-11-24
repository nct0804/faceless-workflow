/**
 * <Stage>: one perspective three.js view with the finishing stack. Works for 9:16 shorts and 16:9 films.
 *   <Stage cam={{pos, target, fov}} post={{aperture: 0.6, focus: 3}}> ...set, characters, lights... </Stage>
 * Everything is frame-driven: pass camera values computed from useCurrentFrame().
 */
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Post, type PostSettings} from './post';
import {usePreload} from './assets';
import {useGrade} from './mood';

export type Cam = {
  pos: [number, number, number];
  target: [number, number, number];
  fov?: number; // vertical fov, degrees
  roll?: number; // degrees (dutch angle)
  shake?: number; // handheld amount (metres); deterministic noise
  near?: number; // near clip: >0.3 for POV shots from inside a character's head (clips the head away)
};

const noise = (t: number, seed: number) =>
  Math.sin(t * 1.3 + seed) * 0.5 + Math.sin(t * 2.7 + seed * 2.1) * 0.3 + Math.sin(t * 5.1 + seed * 3.7) * 0.2;

const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera} = useThree();
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const t = frame / 30;
    const sh = cam.shake ?? 0.004;
    c.position.set(cam.pos[0] + noise(t, 1) * sh, cam.pos[1] + noise(t, 2) * sh, cam.pos[2] + noise(t, 3) * sh * 0.5);
    c.up.set(0, 1, 0);
    c.lookAt(cam.target[0] + noise(t, 4) * sh * 0.6, cam.target[1] + noise(t, 5) * sh * 0.6, cam.target[2]);
    if (cam.roll) c.rotateZ(THREE.MathUtils.degToRad(cam.roll));
    c.fov = cam.fov ?? 40;
    c.near = cam.near ?? 0.05;
    c.far = 120;
    c.updateProjectionMatrix();
  });
  return null;
};

const Setup: React.FC<{background: string; fog?: [string, number, number]}> = ({background, fog}) => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = new THREE.Color(background);
    scene.fog = fog ? new THREE.Fog(new THREE.Color(fog[0]), fog[1], fog[2]) : null;
  }, [gl, scene, background, fog]);
  return null;
};

export const Stage: React.FC<{
  cam: Cam;
  post?: PostSettings;
  background?: string;
  fog?: [string, number, number];
  children: React.ReactNode;
}> = ({cam, post, background = '#0B0D12', fog, children}) => {
  const {width, height} = useVideoConfig();
  const ready = usePreload();
  // the colour script (kit3d/mood.tsx) grades every shot; per-shot post settings override it
  const g = useGrade();
  post = {...g.post, ...post};
  if (fog) fog = [g.bg, fog[1], fog[2]];
  background = g.bg;
  if (!ready) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{fov: cam.fov ?? 40, position: cam.pos, near: 0.05, far: 120}}
        gl={{antialias: false, preserveDrawingBuffer: true}}
        flat
        linear
        dpr={1}
      >
        <Setup background={background} fog={fog} />
        <CameraRig cam={cam} />
        {children}
        <Post {...post} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- lights (practicals first, like the reference)

/** warm practical: point light + shadow. Put a GLOW mesh where it is (lamp bulb, phone, screen) */
export const Practical: React.FC<{
  at: THREE.Vector3 | [number, number, number];
  color?: string;
  intensity?: number;
  distance?: number;
  shadow?: boolean;
}> = ({at, color = '#FFB866', intensity = 6, distance = 7, shadow = true}) => {
  const p = Array.isArray(at) ? at : ([at.x, at.y, at.z] as [number, number, number]);
  return (
    <pointLight
      position={p}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={1.6}
      castShadow={shadow}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.002}
      shadow-radius={4}
    />
  );
};

/** cool key from a window / moon: directional with crisp shadows (the hard window-shadow shapes) */
export const Moonlight: React.FC<{
  from: [number, number, number];
  to?: [number, number, number];
  color?: string;
  intensity?: number;
  size?: number;
}> = ({from, to = [0, 0, 0], color = '#8FA6FF', intensity = 1.4, size = 6}) => {
  const ref = React.useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.target.position.set(...to);
    ref.current.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={ref}
      position={from}
      color={color}
      intensity={intensity}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0006}
      shadow-normalBias={0.02}
      shadow-radius={2}
      shadow-camera-left={-size}
      shadow-camera-right={size}
      shadow-camera-top={size}
      shadow-camera-bottom={-size}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
    />
  );
};

/** flat navy fill so shadows are navy, never dead black (our low-key base). Flat (not hemisphere) keeps the
 *  cel bands clean: a gradient fill would make the toon shading look like soft plastic */
export const Ambient: React.FC<{color?: string; intensity?: number}> = ({color = '#5468A8', intensity = 1}) => (
  // physical light units: x3.2 so intensity 1 = a readable navy night fill (shadows ~luma 25-40, never black)
  <ambientLight color={color} intensity={intensity * 3.2} />
);
