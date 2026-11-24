import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig} from './three';
import {fontsLoaded} from './overlay';

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

/**
 * One three.js layer. Stack several for depth of field:
 *   <Scene blur={14}>background</Scene>  <Scene>foreground</Scene>
 * Canvases are transparent, so layers composite.
 */
export const Scene: React.FC<{
  zoom?: number;
  camX?: number;
  camY?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({zoom = 1, camX = 0, camY = 0, blur = 0, style, children}) => {
  const {width, height} = useVideoConfig();
  const ok = useFontsReady();
  if (!ok) return null;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined, ...style}}>
      <ThreeCanvas
        width={width}
        height={height}
        orthographic
        flat
        linear={false}
        camera={{position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000}}
      >
        <CameraRig zoom={zoom} x={camX} y={camY} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
