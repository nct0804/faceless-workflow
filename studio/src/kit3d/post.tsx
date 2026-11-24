/**
 * The "premium" finishing stack, rendered by hand each frame (deterministic, no time-based state):
 *   1. beauty pass  -> RT (MSAA) with depth texture
 *   2. normal pass  -> RT (scene.overrideMaterial = normals)
 *   3. ink pass     -> screen-space edges from depth + normals, drawn as ink (the "drawing" line on the SETS)
 *   4. dof          -> depth-based bokeh blur (background depth, the RicksClips look)
 *   5. bloom        -> UnrealBloom on HDR practicals (lamp, screens, city windows, phone eyes)
 *   6. grade        -> contrast S-curve, navy shadows / amber highlights split-tone, saturation, vignette,
 *                      unsharp mask (crisp like the reference), grain, slight edge chroma
 */
import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export type PostSettings = {
  ink?: number; // 0..1 strength of screen-space set lines
  inkWidth?: number; // px at 1080
  focus?: number; // focus distance (world units, metres)
  focusAt?: [number, number, number]; // or: keep this point sharp (auto focus distance, overrides focus)
  aperture?: number; // blur strength; 0 = off
  maxBlur?: number; // px
  bloom?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  exposure?: number;
  contrast?: number;
  saturation?: number;
  vignette?: number;
  grain?: number;
  sharpen?: number;
  shadowTint?: string;
  highlightTint?: string;
  split?: number; // split-tone strength
  lift?: number; // black level (keep >0 for "rich" not crushed-grey)
  flash?: number; // 0..1 white flash (transitions)
  fade?: number; // 0..1 fade to black
};

const DEF: Required<PostSettings> = {
  ink: 1,
  inkWidth: 1.8,
  focus: 4,
  focusAt: undefined as unknown as [number, number, number],
  aperture: 0,
  maxBlur: 14,
  bloom: 0.9,
  bloomRadius: 0.55,
  bloomThreshold: 0.92,
  exposure: 1.0,
  contrast: 1.16,
  saturation: 1.1,
  vignette: 0.28,
  grain: 0.035,
  sharpen: 0.9,
  shadowTint: '#1A2348',
  highlightTint: '#FFC98A',
  split: 0.22,
  lift: 0.035,
  flash: 0,
  fade: 0,
};

const FS_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const INK_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor, tDepth, tNormal;
uniform vec2 res;
uniform float near, far, strength, width;
uniform vec3 inkColor;
float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
void main(){
  vec3 col = texture2D(tColor, vUv).rgb;
  vec2 px = width / res;
  float dC = lin(texture2D(tDepth, vUv).r);
  vec3 nC = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
  float eD = 0.0, eN = 0.0;
  // 8 neighbours
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    vec2 o = vec2(cos(a), sin(a)) * px;
    float d = lin(texture2D(tDepth, vUv + o).r);
    vec3 n = texture2D(tNormal, vUv + o).rgb * 2.0 - 1.0;
    eD = max(eD, abs(d - dC) / max(dC, 0.1));
    eN = max(eN, 1.0 - dot(n, nC));
  }
  float e = max(smoothstep(0.035, 0.09, eD), smoothstep(0.18, 0.5, eN));
  // fade lines with distance so far background stays soft (depth = atmosphere)
  e *= strength * (1.0 - smoothstep(9.0, 30.0, dC));
  // ink takes the local colour, darkened (coloured ink reads more "painted" than pure black)
  vec3 ink = mix(inkColor, col * 0.22, 0.35);
  gl_FragColor = vec4(mix(col, ink, e), 1.0);
}`;

const DOF_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor, tDepth;
uniform vec2 res;
uniform float near, far, focus, aperture, maxBlur;
float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
float coc(vec2 uv){ float d = lin(texture2D(tDepth, uv).r); return clamp(abs(d - focus) / max(d, 0.01) * aperture, 0.0, 1.0) * maxBlur; }
void main(){
  float c = coc(vUv);
  vec3 acc = texture2D(tColor, vUv).rgb; float w = 1.0;
  if (c > 0.5) {
    // golden-angle spiral, 40 taps
    for (int i = 1; i < 40; i++) {
      float fi = float(i);
      float r = sqrt(fi / 40.0) * c;
      float a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * r / res;
      float cs = coc(vUv + o);
      float k = smoothstep(r - 1.0, r + 1.0, max(cs, c * 0.5));
      vec3 s = texture2D(tColor, vUv + o).rgb;
      // brighter samples weigh more -> bokeh balls from practicals
      float lum = dot(s, vec3(0.299, 0.587, 0.114));
      float wt = k * (1.0 + 2.0 * smoothstep(0.8, 1.6, lum));
      acc += s * wt; w += wt;
    }
  }
  gl_FragColor = vec4(acc / w, 1.0);
}`;

const GRADE_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor;
uniform vec2 res;
uniform float exposure, contrast, saturation, vignette, grain, sharpen, split, lift, seed, flash, fade;
uniform vec3 shadowTint, highlightTint;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
// exponential shoulder, LINEAR toe: keeps navy shadows readable (ACES' toe crushed them to black)
vec3 tonemap(vec3 x){ return 1.0 - exp(-x * 1.35); }
void main(){
  vec2 px = 1.0 / res;
  // slight chromatic aberration toward the edges
  vec2 cc = vUv - 0.5;
  float ca = dot(cc, cc) * 0.006;
  vec3 col;
  col.r = texture2D(tColor, vUv + cc * ca).r;
  col.g = texture2D(tColor, vUv).g;
  col.b = texture2D(tColor, vUv - cc * ca).b;
  col = tonemap(col * exposure);
  // unsharp mask in DISPLAY space (the reference is very crisp): 1.5 px ring
  vec3 blur = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472;
    blur += tonemap(texture2D(tColor, vUv + vec2(cos(a), sin(a)) * px * 1.5).rgb * exposure);
  }
  blur /= 6.0;
  col = max(col + (col - blur) * sharpen, 0.0);
  col = pow(col, vec3(1.0 / 2.2));
  // contrast around mid grey (in perceptual space)
  // pivot low (0.3): contrast goes into the mids/highlights, navy shadows stay readable
  col = clamp((col - 0.3) * contrast + 0.3, 0.0, 1.0);
  // split tone: navy into the shadows, amber into the highlights
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, col * shadowTint * 2.2, (1.0 - smoothstep(0.0, 0.45, l)) * split);
  col = mix(col, col * highlightTint * 1.35, smoothstep(0.55, 1.0, l) * split * 0.6);
  // saturation
  l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, saturation);
  // vignette
  float v = smoothstep(0.85, 0.2, length(cc * vec2(res.x / res.y, 1.0) * 1.15));
  col *= mix(1.0 - vignette, 1.0, v);
  col = col * (1.0 - lift) + lift * shadowTint * 2.0;
  // grain (luma-weighted, strongest in mids)
  float g = (h(vUv * res + seed) - 0.5) * grain * (1.0 - abs(l - 0.5) * 1.2);
  col += g;
  col = mix(col, vec3(1.0), flash);
  col *= (1.0 - fade);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const quad = (frag: string, uniforms: Record<string, THREE.IUniform>) => {
  const mat = new THREE.ShaderMaterial({vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false});
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return {scene, mat};
};

export const Post: React.FC<PostSettings> = (props) => {
  const s = {...DEF, ...props};
  const {gl, scene, camera, size} = useThree();
  const frame = useCurrentFrame();
  const dpr = gl.getPixelRatio();
  const W = Math.round(size.width * dpr);
  const H = Math.round(size.height * dpr);

  const P = useMemo(() => {
    const depth = new THREE.DepthTexture(W, H);
    depth.type = THREE.UnsignedIntType;
    const beauty = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType, samples: 4, depthTexture: depth});
    const ndepth = new THREE.DepthTexture(W, H);
    const normal = new THREE.WebGLRenderTarget(W, H, {depthTexture: ndepth});
    const a = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType});
    const b = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType});
    const normalMat = new THREE.MeshNormalMaterial();
    const ink = quad(INK_FRAG, {
      tColor: {value: beauty.texture}, tDepth: {value: depth}, tNormal: {value: normal.texture},
      res: {value: new THREE.Vector2(W, H)}, near: {value: 0.1}, far: {value: 100}, strength: {value: 1},
      width: {value: 1.5}, inkColor: {value: new THREE.Color('#14161C')},
    });
    const dof = quad(DOF_FRAG, {
      tColor: {value: a.texture}, tDepth: {value: depth}, res: {value: new THREE.Vector2(W, H)},
      near: {value: 0.1}, far: {value: 100}, focus: {value: 4}, aperture: {value: 0}, maxBlur: {value: 12},
    });
    const grade = quad(GRADE_FRAG, {
      tColor: {value: a.texture}, res: {value: new THREE.Vector2(W, H)}, exposure: {value: 1}, contrast: {value: 1},
      saturation: {value: 1}, vignette: {value: 0}, grain: {value: 0}, sharpen: {value: 0}, split: {value: 0},
      lift: {value: 0}, seed: {value: 0}, flash: {value: 0}, fade: {value: 0},
      shadowTint: {value: new THREE.Color()}, highlightTint: {value: new THREE.Color()},
    });
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 1, 0.5, 0.9);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return {depth, beauty, normal, a, b, normalMat, ink, dof, grade, bloom, cam};
  }, [W, H]);

  useEffect(
    () => () => {
      [P.beauty, P.normal, P.a, P.b].forEach((t) => t.dispose());
      P.bloom.dispose();
    },
    [P],
  );

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    gl.autoClear = true;
    // 1 beauty
    gl.setRenderTarget(P.beauty);
    gl.render(scene, camera);
    // 2 normals (hide glows/particles that shouldn't get lines: userData.noInk)
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (o.visible && (o.userData.noInk || (o as THREE.Points).isPoints)) {
        o.visible = false;
        hidden.push(o);
      }
    });
    const bg = scene.background;
    scene.background = null;
    scene.overrideMaterial = P.normalMat;
    gl.setRenderTarget(P.normal);
    gl.setClearColor(0x000000, 1);
    gl.clear();
    gl.render(scene, camera);
    scene.overrideMaterial = null;
    scene.background = bg;
    hidden.forEach((o) => (o.visible = true));
    // 3 ink -> a
    const iu = P.ink.mat.uniforms;
    iu.near.value = cam.near;
    iu.far.value = cam.far;
    iu.strength.value = s.ink;
    iu.width.value = s.inkWidth * (H / 1080) * (W < H ? 1080 / W : 1) * 0.75;
    gl.setRenderTarget(P.a);
    gl.render(P.ink.scene, P.cam);
    let src = P.a;
    // 4 dof -> b
    if (s.aperture > 0) {
      const du = P.dof.mat.uniforms;
      du.tColor.value = P.a.texture;
      du.near.value = cam.near;
      du.far.value = cam.far;
      if (s.focusAt) {
        const fwd = new THREE.Vector3();
        cam.getWorldDirection(fwd);
        du.focus.value = new THREE.Vector3(...s.focusAt).sub(cam.position).dot(fwd);
      } else du.focus.value = s.focus;
      du.aperture.value = s.aperture;
      du.maxBlur.value = s.maxBlur * (Math.min(W, H) / 1080);
      gl.setRenderTarget(P.b);
      gl.render(P.dof.scene, P.cam);
      src = P.b;
    }
    // 5 bloom (in place on src)
    if (s.bloom > 0) {
      P.bloom.strength = s.bloom;
      P.bloom.radius = s.bloomRadius;
      P.bloom.threshold = s.bloomThreshold;
      P.bloom.render(gl, src, src, 0, false);
    }
    // 6 grade -> screen
    const gu = P.grade.mat.uniforms;
    gu.tColor.value = src.texture;
    gu.exposure.value = s.exposure;
    gu.contrast.value = s.contrast;
    gu.saturation.value = s.saturation;
    gu.vignette.value = s.vignette;
    gu.grain.value = s.grain;
    gu.sharpen.value = s.sharpen;
    gu.split.value = s.split;
    gu.lift.value = s.lift;
    gu.seed.value = (frame * 7.31) % 100;
    gu.flash.value = s.flash;
    gu.fade.value = s.fade;
    (gu.shadowTint.value as THREE.Color).set(s.shadowTint);
    (gu.highlightTint.value as THREE.Color).set(s.highlightTint);
    gl.setRenderTarget(null);
    gl.render(P.grade.scene, P.cam);
  }, 1);
  return null;
};
