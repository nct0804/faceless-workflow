/**
 * "Ink & Ember" materials. Blender material names are the API (see assets/blender/sets/bedroom.py):
 *   TOON_<pattern>_<name>  cel shading (3 bands + soft terminator) * baked AO (COLOR_0) + world-space ink strokes
 *   GLOW_<name>            unlit emissive, pushed over 1.0 so bloom catches it
 *   INK                    flat ink
 *   FACE                   drawn face canvas (set per character)
 * Patterns are drawn in WORLD space (no UVs needed), so any Blender box gets wood grain / stripes / planks.
 */
import * as THREE from 'three';

export const INK = new THREE.Color('#14161C');

const ramps = new Map<string, THREE.DataTexture>();
/** 4-step ramp: deep shadow / shadow / lit / highlight. Values chosen for a painted (not plasticky) cel look */
export const SET_RAMP = [105, 150, 225, 255];
/** characters: clean 2-tone cel (RicksClips: flat colour + one shadow shape + outline), no muddy mid-tones */
export const CHAR_RAMP = [168, 168, 255, 255];
export const toonRamp = (v: number[] = SET_RAMP) => {
  const key = v.join(',');
  if (ramps.has(key)) return ramps.get(key)!;
  const data = new Uint8Array(v.length * 4);
  v.forEach((x, i) => data.set([x, x, x, 255], i * 4));
  const r = new THREE.DataTexture(data, v.length, 1, THREE.RGBAFormat);
  r.minFilter = THREE.NearestFilter;
  r.magFilter = THREE.NearestFilter;
  r.generateMipmaps = false;
  r.needsUpdate = true;
  ramps.set(key, r);
  return r;
};

export type Pattern = 'plain' | 'wood' | 'planks' | 'stripes' | 'fabric' | 'paper' | 'brick' | 'tiles' | 'skin';
const PATTERN_ID: Record<string, number> = {plain: 0, skin: 0, wood: 1, planks: 1, stripes: 2, fabric: 3, paper: 4, brick: 5, tiles: 6};

export type ToonOpts = {
  color: THREE.ColorRepresentation;
  pattern?: Pattern | string;
  ao?: boolean; // multiply baked vertex AO
  rim?: THREE.ColorRepresentation; // rim light colour (cool moonlight by default)
  rimStrength?: number;
  map?: THREE.Texture | null;
  skinning?: boolean;
  transparent?: boolean;
  ramp?: number[];
};

/**
 * MeshToonMaterial + shader patches:
 *  - AO from COLOR_0 (squared for punchier contact shadows)
 *  - world-space ink strokes (pattern)
 *  - rim light on silhouettes facing away from camera (the RicksClips "edge glow", in our moonlight blue)
 */
export const toon = (o: ToonOpts) => {
  const m = new THREE.MeshToonMaterial({
    color: new THREE.Color(o.color),
    gradientMap: toonRamp(o.ramp),
    vertexColors: !!o.ao,
    map: o.map ?? null,
    transparent: !!o.transparent,
  });
  const pid = PATTERN_ID[o.pattern ?? 'plain'] ?? 0;
  const rim = new THREE.Color(o.rim ?? '#7F9BFF');
  const rimStrength = o.rimStrength ?? 0.35;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPattern = {value: pid};
    sh.uniforms.uRim = {value: rim};
    sh.uniforms.uRimK = {value: rimStrength};
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vec4 wp4 = vec4( transformed, 1.0 );
        wp4 = modelMatrix * wp4;
        vWPos = wp4.xyz;
        vWNrm = normalize( mat3( modelMatrix ) * objectNormal );`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWPos;
        varying vec3 vWNrm;
        uniform int uPattern;
        uniform vec3 uRim;
        uniform float uRimK;
        float h1(float n){ return fract(sin(n)*43758.5453); }
        float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h1(dot(i,vec2(1,57))),h1(dot(i+vec2(1,0),vec2(1,57))),f.x),
                     mix(h1(dot(i+vec2(0,1),vec2(1,57))),h1(dot(i+vec2(1,1),vec2(1,57))),f.x),f.y); }
        // thin ink stroke: 1 on the line, 0 elsewhere (anti-aliased with fwidth)
        float line(float x, float width){ float d = abs(fract(x) - 0.5) * 2.0; float aa = max(fwidth(x) * 2.0, 1e-4); return 1.0 - smoothstep(1.0 - width - aa, 1.0 - width, 1.0 - d); }
        // world-space pattern -> amount of ink to mix in (0..1)
        float patternInk(vec3 p, vec3 n){
          vec3 an = abs(n);
          // pick the 2 axes of the dominant plane
          vec2 uv = an.y > max(an.x, an.z) ? p.xz : (an.x > an.z ? p.zy : p.xy);
          if (uPattern == 1) { // wood grain: long wavy strokes
            float w = uv.y * 9.0 + n2(uv * vec2(1.5, 6.0)) * 1.8 + sin(uv.x * 3.0) * 0.4;
            return line(w, 0.06) * (0.45 + 0.45 * n2(uv * 4.0)) + n2(uv * vec2(4.0, 60.0)) * 0.10;
          }
          if (uPattern == 2) { // wallpaper: stripes + a small diamond motif + brush noise
            float u = p.x * 4.0 + p.z * 4.0 * step(0.5, an.x);
            float s = line(u, 0.05) * 0.45;
            vec2 d = vec2(fract(u) - 0.5, fract(p.y * 4.0) - 0.5);
            float motif = 1.0 - smoothstep(0.05, 0.08, abs(d.x) + abs(d.y));
            return max(s, motif * 0.35) + n2(uv * 30.0) * 0.12;
          }
          if (uPattern == 3) { // fabric: soft hatching
            return line((uv.x + uv.y) * 22.0, 0.10) * 0.18 + line((uv.x - uv.y) * 22.0, 0.08) * 0.08;
          }
          if (uPattern == 4) { // paper: fine grain
            return n2(uv * 140.0) * 0.08;
          }
          if (uPattern == 5) { // brick
            float row = floor(uv.y * 7.0);
            vec2 b = vec2(uv.x * 3.5 + 0.5 * mod(row, 2.0), uv.y * 7.0);
            return max(line(b.y, 0.08), line(b.x, 0.05)) * 0.6;
          }
          if (uPattern == 6) { // tiles
            return max(line(uv.x * 4.0, 0.05), line(uv.y * 4.0, 0.05)) * 0.55;
          }
          return n2(uv * 45.0) * 0.06; // plain: faint painterly grain
        }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        #if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
          // baked AO: squash to a painted contact shadow (keep lit areas clean)
          float aoK = clamp(vColor.r, 0.0, 1.0);
          diffuseColor.rgb = diffuseColor.rgb / max(vColor.rgb, vec3(1e-3)) * mix(0.32, 1.0, smoothstep(0.15, 0.85, aoK));
        #endif
        float pInk = patternInk(vWPos, normalize(vWNrm));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.42, pInk);`,
      )
      .replace(
        '#include <opaque_fragment>',
        `vec3 vdir = normalize(cameraPosition - vWPos);
        float fres = pow(1.0 - clamp(dot(normalize(vWNrm), vdir), 0.0, 1.0), 3.0);
        outgoingLight += uRim * smoothstep(0.35, 0.75, fres) * uRimK;
        #include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => `toon-${pid}-${!!o.ao}-${!!o.map}-${(o.ramp ?? SET_RAMP).join('')}`;
  return m;
};

/** emissive "practical": pushed to HDR so the bloom pass blooms it */
export const glow = (color: THREE.ColorRepresentation, intensity = 2.2) => {
  const m = new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false});
  return m;
};

export const inkMat = () => new THREE.MeshBasicMaterial({color: INK});

/**
 * Inverted-hull outline for characters/props: back faces pushed out along the normal in clip space so the
 * line keeps a constant SCREEN width (px) at any distance. Works with skinned meshes.
 */
export const outlineMat = (widthPx: number, color: THREE.ColorRepresentation = INK) => {
  const m = new THREE.MeshBasicMaterial({color: new THREE.Color(color), side: THREE.BackSide});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uW = {value: widthPx};
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uW;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        #ifdef USE_SKINNING
          vec3 oN = objectNormal;
        #else
          vec3 oN = normal; // static meshes (props, POV mittens) have no objectNormal in MeshBasic
        #endif
        vec3 nView = normalize( normalMatrix * oN );
        vec4 nClip = projectionMatrix * vec4( nView, 0.0 );
        vec2 dir = normalize( nClip.xy + 1e-6 );
        // uW px at 1080 px viewport height
        gl_Position.xy += dir * uW * 2.0 / 1080.0 * gl_Position.w;`,
      );
  };
  m.customProgramCacheKey = () => 'outline';
  return m;
};
