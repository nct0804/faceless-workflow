/**
 * Atmosphere: the things that make the reference frames feel expensive.
 *   <LightShaft>  volumetric beam (window light, lamp cone, stage light). Additive, soft edges, slow shimmer
 *   <Dust>        floating motes catching the light (deterministic drift)
 *   <GlowCard>    soft additive halo quad (moon halo, street lamps far away) when bloom alone is not enough
 */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';

const SHAFT_VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHAFT_FRAG = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
uniform vec3 color; uniform float opacity; uniform float t;
float h(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  // soft edges: strongest where we look straight through the cone's volume
  float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
  // fade along the beam (v = 1 at the source)
  float along = smoothstep(0.0, 0.35, vUv.y) * mix(0.35, 1.0, vUv.y);
  // slow streaks
  float streak = 0.75 + 0.25 * sin(vUv.x * 40.0 + t * 0.6) * sin(vUv.x * 17.0 - t * 0.4);
  gl_FragColor = vec4(color * opacity * edge * along * streak, 1.0);
}`;

export const LightShaft: React.FC<{
  from: [number, number, number];
  to: [number, number, number];
  r0?: number; // radius at source
  r1?: number; // radius at target
  color?: string;
  opacity?: number;
  square?: boolean; // 4-sided (window) instead of round
}> = ({from, to, r0 = 0.3, r1 = 0.9, color = '#9FB4FF', opacity = 0.18, square = false}) => {
  const frame = useCurrentFrame();
  const {geo, mat} = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const len = a.distanceTo(b);
    // CylinderGeometry: radiusTop at +y (source), uv.y = 1 at top
    const g = new THREE.CylinderGeometry(r0, r1, len, square ? 4 : 32, 1, true);
    if (square) g.rotateY(Math.PI / 4);
    g.translate(0, -len / 2, 0); // source at origin
    const m = new THREE.ShaderMaterial({
      vertexShader: SHAFT_VERT,
      fragmentShader: SHAFT_FRAG,
      uniforms: {color: {value: new THREE.Color(color)}, opacity: {value: opacity}, t: {value: 0}},
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    return {geo: g, mat: m};
  }, [from.join(), to.join(), r0, r1, color, square]);
  mat.uniforms.t.value = frame / 30;
  mat.uniforms.opacity.value = opacity;
  const q = useMemo(() => {
    const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  }, [from.join(), to.join()]);
  return <mesh geometry={geo} material={mat} position={from} quaternion={q} userData={{noInk: true}} renderOrder={10} />;
};

const DUST_VERT = `
uniform float t; uniform float size;
attribute float seed;
varying float vA;
void main(){
  vec3 p = position;
  p.x += sin(t * 0.21 + seed * 6.3) * 0.12;
  p.y += sin(t * 0.13 + seed * 3.1) * 0.10 + mod(t * 0.015 + seed, 1.0) * 0.15;
  p.z += cos(t * 0.17 + seed * 4.7) * 0.12;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = size * (0.5 + seed) * (300.0 / -mv.z);
  vA = 0.35 + 0.65 * abs(sin(t * 0.8 + seed * 20.0));
}`;
const DUST_FRAG = `
uniform vec3 color; uniform float opacity; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(color * a * vA * opacity, 1.0);
}`;

export const Dust: React.FC<{
  center: [number, number, number];
  size?: [number, number, number];
  count?: number;
  color?: string;
  opacity?: number;
  point?: number;
  seed?: number;
}> = ({center, size = [2, 2, 2], count = 160, color = '#FFE2B0', opacity = 0.6, point = 0.05, seed = 1}) => {
  const frame = useCurrentFrame();
  const {geo, mat} = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * size[0];
      pos[i * 3 + 1] = (rnd() - 0.5) * size[1];
      pos[i * 3 + 2] = (rnd() - 0.5) * size[2];
      sd[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('seed', new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: {t: {value: 0}, size: {value: point}, color: {value: new THREE.Color(color)}, opacity: {value: opacity}},
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return {geo: g, mat: m};
  }, [count, size.join(), color, seed, point]);
  mat.uniforms.t.value = frame / 30;
  mat.uniforms.opacity.value = opacity;
  return <points geometry={geo} material={mat} position={center} frustumCulled={false} renderOrder={11} />;
};

const HALO_FRAG = `
varying vec2 vUv; uniform vec3 color; uniform float opacity;
void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2); gl_FragColor = vec4(color * a * opacity, 1.0); }`;

/** camera-facing soft halo */
export const GlowCard: React.FC<{at: [number, number, number]; size?: number; color?: string; opacity?: number}> = ({
  at, size = 1, color = '#FFD9A0', opacity = 0.6,
}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0,0.0,0.0,1.0);
          mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: HALO_FRAG,
        uniforms: {color: {value: new THREE.Color(color)}, opacity: {value: opacity}},
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color],
  );
  mat.uniforms.opacity.value = opacity;
  return (
    <mesh position={at} material={mat} userData={{noInk: true}} renderOrder={12}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};

const SKY_FRAG = `
varying vec3 vDir; uniform vec3 top, horizon, bottom, sunDir, sunColor; uniform float sunSize;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 c = h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.75, h), 0.8)) : mix(horizon, bottom, smoothstep(0.0, -0.35, h));
  float s = max(0.0, dot(d, normalize(sunDir)));
  c += sunColor * (pow(s, 900.0 / sunSize) * 2.5 + pow(s, 12.0) * 0.35);
  gl_FragColor = vec4(c, 1.0);
}`;

/** gradient sky (any time of day) around the whole scene: top -> horizon -> ground, optional sun glow */
export const SkyDome: React.FC<{top: string; horizon: string; bottom?: string; sunDir?: [number, number, number]; sunColor?: string; sunSize?: number}> = ({
  top, horizon, bottom, sunDir = [0, 0.2, -1], sunColor = '#000000', sunSize = 1,
}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
        fragmentShader: SKY_FRAG,
        uniforms: {top: {value: new THREE.Color()}, horizon: {value: new THREE.Color()}, bottom: {value: new THREE.Color()},
          sunDir: {value: new THREE.Vector3()}, sunColor: {value: new THREE.Color()}, sunSize: {value: 1}},
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  mat.uniforms.top.value.set(top);
  mat.uniforms.horizon.value.set(horizon);
  mat.uniforms.bottom.value.set(bottom ?? horizon);
  mat.uniforms.sunDir.value.set(...sunDir);
  mat.uniforms.sunColor.value.set(sunColor);
  mat.uniforms.sunSize.value = sunSize;
  return (
    <mesh material={mat} userData={{noInk: true}} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[90, 32, 16]} />
    </mesh>
  );
};
