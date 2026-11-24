import React, {createContext, useContext, useEffect, useId, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig} from './three';
import {fontsLoaded} from './overlay';
import {CAM0, type Cam} from './camera';
import {LifeCtx} from './life';

let loaded = false;
const ready = fontsLoaded.then(() => {
  loaded = true;
});

/** blocks rendering until Patrick Hand is loaded (canvas textures draw text with it) */
export const useFontsReady = () => {
  const [ok, setOk] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender('Loading fonts')));
  useEffect(() => {
    if (handle === null) return;
    ready.then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

const CamCtx = createContext<Cam>(CAM0);
/** the camera of the enclosing <Scene> (inside the three.js tree) */
export const useSceneCam = () => useContext(CamCtx);

/**
 * One three.js layer. Stack several for depth of field:
 *   <Scene blur={14}>background</Scene>  <Scene>foreground</Scene>
 * Canvases are transparent, so layers composite.
 * Camera: either the old zoom/camX/camY props, or `cam` from kit/camera.ts (adds roll + directional whip blur).
 * life: ambient motion of the set (kit/life.tsx), 1 = default, 0 = everything still.
 */
export const Scene: React.FC<{
  zoom?: number;
  camX?: number;
  camY?: number;
  cam?: Cam;
  life?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({zoom = 1, camX = 0, camY = 0, cam, life = 1, blur = 0, style, children}) => {
  const {width, height} = useVideoConfig();
  const ok = useFontsReady();
  const fid = 'mb' + useId().replace(/:/g, '');
  if (!ok) return null;
  const c: Cam = cam ?? {...CAM0, zoom, x: camX, y: camY};
  const mb = c.blurX > 0.5 || c.blurY > 0.5;
  const filters = [blur ? `blur(${blur}px)` : '', mb ? `url(#${fid})` : ''].filter(Boolean).join(' ');
  return (
    <AbsoluteFill style={{filter: filters || undefined, ...style}}>
      {mb && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${c.blurX.toFixed(1)} ${c.blurY.toFixed(1)}`} edgeMode="duplicate" />
          </filter>
        </svg>
      )}
      <ThreeCanvas
        width={width}
        height={height}
        orthographic
        flat
        linear={false}
        camera={{position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000}}
      >
        <CameraRig zoom={c.zoom} x={c.x} y={c.y} roll={c.roll} />
        <CamCtx.Provider value={c}>
          <LifeCtx.Provider value={life}>{children}</LifeCtx.Provider>
        </CamCtx.Provider>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/**
 * Parallax layer inside a <Scene>. k = how fast it moves with the camera: 1 = the set (default plane),
 * < 1 far away (sky 0.3, distant city 0.6), > 1 near the lens (foreground plant 1.3). Pans and push-ins both parallax.
 * Keep the room, floor and characters at 1, otherwise feet slide on the floor.
 */
export const Depth: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => {
  const c = useSceneCam();
  // screen = zk * (p - c*k)  with zk = 1 + (zoom - 1) * k   →  group: scale s = zk / zoom, offset c - c*k*s
  const zk = Math.max(0.05, 1 + (c.zoom - 1) * k);
  const s = zk / c.zoom;
  return (
    <group position={[c.x - c.x * k * s, c.y - c.y * k * s, 0]} scale={[s, s, 1]}>
      {children}
    </group>
  );
};
