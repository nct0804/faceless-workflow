import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFilm} from './film';
import {useThree} from '@react-three/fiber';

/* ---------- shapes ---------- */

export const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

export const ellipse = (rx: number, ry: number) => {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  return s;
};

/** points list -> closed shape */
export const poly = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
};

/* ---------- flat shape with optional outline ---------- */

type FlatProps = {
  shape: THREE.Shape;
  color: string;
  outline?: string;
  outlineWidth?: number;
  opacity?: number;
  position?: [number, number, number];
  rotation?: number;
  scale?: [number, number];
  /** invisible depth-only copy: hides glowing things (renderOrder > 1000) behind it */
  occluder?: boolean;
  renderOrder?: number;
};

export const OCCLUDER_ORDER = 1000;
export const GLOW_ORDER = 1001;

export const Flat: React.FC<FlatProps> = ({
  shape,
  color,
  outline,
  outlineWidth = 3,
  opacity = 1,
  position = [0, 0, 0],
  rotation = 0,
  scale = [1, 1],
  occluder = false,
  renderOrder = 0,
}) => {
  const geo = useMemo(() => new THREE.ShapeGeometry(shape, 24), [shape]);
  if (occluder) {
    return (
      <group position={position} rotation={[0, 0, rotation]} scale={[scale[0], scale[1], 1]}>
        <mesh geometry={geo} renderOrder={OCCLUDER_ORDER}>
          <meshBasicMaterial transparent colorWrite={false} depthWrite depthTest />
        </mesh>
      </group>
    );
  }
  const outlineGeo = useMemo(() => {
    if (!outline) return null;
    const pts = shape.getPoints(48);
    const line = new THREE.Shape(pts.map((p) => p.clone()));
    // fake stroke: a slightly bigger copy behind the fill
    const bb = new THREE.Box2().setFromPoints(pts);
    const size = bb.getSize(new THREE.Vector2());
    const sx = (size.x + outlineWidth * 2) / Math.max(size.x, 1);
    const sy = (size.y + outlineWidth * 2) / Math.max(size.y, 1);
    const c = bb.getCenter(new THREE.Vector2());
    const g = new THREE.ShapeGeometry(line, 24);
    g.translate(-c.x, -c.y, 0);
    g.scale(sx, sy, 1);
    g.translate(c.x, c.y, 0);
    return g;
  }, [shape, outline, outlineWidth]);
  return (
    <group position={position} rotation={[0, 0, rotation]} scale={[scale[0], scale[1], 1]}>
      {outlineGeo && (
        <mesh geometry={outlineGeo} position={[0, 0, -0.01]}>
          <meshBasicMaterial color={outline} transparent opacity={opacity} />
        </mesh>
      )}
      <mesh geometry={geo} renderOrder={renderOrder}>
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

/* ---------- rect helper ---------- */

export const Rect: React.FC<{
  w: number;
  h: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
  opacity?: number;
}> = ({w, h, color, x = 0, y = 0, z = 0, opacity = 1}) => (
  <mesh position={[x, y, z]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} />
  </mesh>
);

/* ---------- radial glow (fake bloom) ---------- */

let glowTex: THREE.Texture | null = null;
const getGlowTexture = () => {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
};

export const Glow: React.FC<{
  x: number;
  y: number;
  z?: number;
  size: number;
  color: string;
  intensity?: number;
  sy?: number;
  renderOrder?: number;
}> = ({x, y, z = 5, size, color, intensity = 1, sy = 1, renderOrder = 0}) => {
  const tex = useMemo(getGlowTexture, []);
  return (
    <mesh position={[x, y, z]} scale={[size, size * sy, 1]} renderOrder={renderOrder}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        color={color}
        transparent
        opacity={intensity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

/* ---------- light cone (trapezoid with soft falloff) ---------- */

const coneVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const coneFrag = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor; uniform float uOpacity; uniform float uTop;
void main(){
  // vUv.y: 0 = bottom (wide), 1 = top (source)
  float halfW = mix(0.5, uTop*0.5, vUv.y);
  float dx = abs(vUv.x - 0.5) / max(halfW, 0.0001);
  float edge = 1.0 - smoothstep(0.55, 1.0, dx);
  float fall = mix(0.35, 1.0, vUv.y);
  float a = edge * fall * uOpacity;
  if (dx > 1.0) a = 0.0;
  gl_FragColor = vec4(uColor * a, a);
}`;

export const LightCone: React.FC<{
  x: number;
  topY: number;
  bottomY: number;
  bottomW: number;
  topW: number;
  color: string;
  opacity: number;
  z?: number;
}> = ({x, topY, bottomY, bottomW, topW, color, opacity, z = 4}) => {
  const uniforms = useMemo(
    () => ({
      uColor: {value: new THREE.Color(color)},
      uOpacity: {value: opacity},
      uTop: {value: topW / bottomW},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  uniforms.uOpacity.value = opacity;
  uniforms.uColor.value.set(color);
  uniforms.uTop.value = topW / bottomW;
  const h = topY - bottomY;
  return (
    <mesh position={[x, bottomY + h / 2, z]}>
      <planeGeometry args={[bottomW, h]} />
      <shaderMaterial
        vertexShader={coneVert}
        fragmentShader={coneFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

/* ---------- vertical gradient plane (walls) ---------- */

const gradFrag = /* glsl */ `
varying vec2 vUv; uniform vec3 uTop; uniform vec3 uBottom;
void main(){ gl_FragColor = vec4(mix(uBottom, uTop, vUv.y), 1.0); }`;

export const GradientPlane: React.FC<{
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  top: string;
  bottom: string;
}> = ({w, h, x = 0, y = 0, z = -50, top, bottom}) => {
  const uniforms = useMemo(
    () => ({uTop: {value: new THREE.Color(top)}, uBottom: {value: new THREE.Color(bottom)}}),
    [top, bottom],
  );
  return (
    <mesh position={[x, y, z]}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial vertexShader={coneVert} fragmentShader={gradFrag} uniforms={uniforms} />
    </mesh>
  );
};

/* ---------- darkness layer: everything is dark except pools around light sources ---------- */

export type PoolLight = {x: number; y: number; r: number; strength: number; squash?: number};

const darkVert = /* glsl */ `
varying vec3 vWorld;
void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const darkFrag = /* glsl */ `
varying vec3 vWorld;
uniform float uDark; uniform vec3 uTint;
uniform vec4 uL[6]; uniform float uSq[6]; uniform int uN;
void main(){
  float lit = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= uN) break;
    vec2 d = vWorld.xy - uL[i].xy; d.y *= uSq[i];
    float k = length(d) / uL[i].z;
    lit += uL[i].w * (1.0 - smoothstep(0.0, 1.0, k));
  }
  float a = uDark * (1.0 - clamp(lit, 0.0, 1.0));
  gl_FragColor = vec4(uTint, a);
}`;

/** z=40: draw scene below it, glows/cones above it (z>40) */
export const Darkness: React.FC<{dark: number; lights: PoolLight[]; tint?: string}> = ({
  dark,
  lights,
  tint = '#03050A',
}) => {
  const uniforms = useMemo(
    () => ({
      uDark: {value: dark},
      uTint: {value: new THREE.Color(tint)},
      uL: {value: Array.from({length: 6}, () => new THREE.Vector4())},
      uSq: {value: new Array(6).fill(1)},
      uN: {value: 0},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  // enhanced film: the mood decides how dark the room is (positive moods = lit rooms), and the shadow colour
  const film = useFilm();
  uniforms.uDark.value = film ? Math.min(0.97, dark * film.dark) : dark;
  uniforms.uTint.value.set(film ? film.shadow : tint);
  uniforms.uN.value = Math.min(6, lights.length);
  lights.slice(0, 6).forEach((l, i) => {
    uniforms.uL.value[i].set(l.x, l.y, l.r, l.strength);
    uniforms.uSq.value[i] = l.squash ?? 1;
  });
  return (
    <mesh position={[0, 0, 40]}>
      <planeGeometry args={[6000, 4000]} />
      <shaderMaterial
        vertexShader={darkVert}
        fragmentShader={darkFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

/* ---------- camera: zoom (push-in) and pan, driven by props each frame ---------- */

export const CameraRig: React.FC<{zoom: number; x?: number; y?: number}> = ({zoom, x = 0, y = 0}) => {
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    camera.zoom = zoom;
    camera.position.set(x, y, 1000);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, zoom, x, y, invalidate]);
  return null;
};
