import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C, FLOOR_Y} from '../theme';
import {ellipse, Flat, Glow, Rect, roundedRect} from './three';
import {drawPaper, drawWood, useCanvasTexture} from './canvas';

/* ---------- a textured plane ---------- */
export const TexturePlane: React.FC<{
  tex: THREE.Texture;
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  rotation?: number;
  opacity?: number;
}> = ({tex, w, h, x = 0, y = 0, z = 0, rotation = 0, opacity = 1}) => (
  <mesh position={[x, y, z]} rotation={[0, 0, rotation]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={tex} transparent opacity={opacity} />
  </mesh>
);

/* ---------- phone (held / POV) ---------- */
export const Phone: React.FC<{
  x: number;
  y: number;
  z?: number;
  w?: number;
  h?: number;
  rotation?: number;
  screen?: THREE.Texture;
  /** 0..1 screen brightness */
  on?: number;
  glow?: number;
}> = ({x, y, z = 30, w = 300, h = 620, rotation = 0, screen, on = 1, glow = 0.25}) => {
  const body = useMemo(() => roundedRect(w, h, w * 0.14), [w, h]);
  const notch = useMemo(() => roundedRect(w * 0.3, h * 0.028, h * 0.014), [w, h]);
  return (
    <group position={[x, y, z]} rotation={[0, 0, rotation]}>
      {glow > 0 && <Glow x={0} y={0} z={-1} size={w * 3.2} sy={h / w / 1.6} color="#CFE0FF" intensity={glow * on} />}
      <Flat shape={body} color="#1A1D24" outline="#3A4050" outlineWidth={3} />
      {screen ? (
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[w - 22, h - 34]} />
          <meshBasicMaterial map={screen} color={new THREE.Color(on, on, on)} />
        </mesh>
      ) : (
        <Rect w={w - 22} h={h - 34} z={0.1} color="#0F1218" />
      )}
      <Flat shape={notch} color="#0A0B0F" position={[0, h / 2 - 32, 0.2]} />
    </group>
  );
};

/** phone lying flat on a desk, seen from the side: a thin slab + screen glow */
export const PhoneOnDesk: React.FC<{x: number; y: number; on?: number}> = ({x, y, on = 1}) => (
  <group position={[x, y, 23]}>
    <Rect w={86} h={8} color="#1A1D24" />
    <Rect w={76} h={3} y={4} z={0.1} color="#BFD2FF" opacity={on} />
    <Glow x={0} y={30} z={24} size={260} sy={0.5} color="#BFD2FF" intensity={0.35 * on} />
  </group>
);

/* ---------- POV hands holding a phone (cream hoodie sleeves) ---------- */
export const PovHands: React.FC<{phoneX: number; phoneY: number; phoneW: number; phoneH: number; thumbT?: number; reach?: number}> = ({
  phoneX,
  phoneY,
  phoneW,
  phoneH,
  thumbT = 0,
  reach = 0,
}) => {
  const sleeve = useMemo(() => roundedRect(170, 640, 70), []);
  const palm = useMemo(() => roundedRect(120, 170, 56), []);
  const thumb = useMemo(() => roundedRect(44, 120, 22), []);
  const bottom = phoneY - phoneH / 2;
  const tap = Math.sin(thumbT * Math.PI) * 10;
  return (
    <group>
      {/* left */}
      <group position={[phoneX - phoneW / 2 - 10, bottom + 60, 35]}>
        <Flat shape={sleeve} color={C.heroShade} outline={C.ink} position={[-80, -380, -0.2]} rotation={-0.35} />
        <Flat shape={palm} color={C.hero} outline={C.ink} position={[0, 0, 0]} rotation={-0.15} />
        <Flat shape={thumb} color={C.hero} outline={C.ink} position={[46, 54, 0.4]} rotation={-0.9} />
      </group>
      {/* right */}
      <group position={[phoneX + phoneW / 2 + 10, bottom + 60, 35]}>
        <Flat shape={sleeve} color={C.heroShade} outline={C.ink} position={[80, -380, -0.2]} rotation={0.35} />
        <Flat shape={palm} color={C.hero} outline={C.ink} position={[0, 0, 0]} rotation={0.15} />
        <Flat shape={thumb} color={C.hero} outline={C.ink} position={[-46 - tap * 0.3 - reach * 70, 54 + tap + reach * 170, 0.4]} rotation={0.9 - reach * 0.4} />
      </group>
    </group>
  );
};

/* ---------- top-down desk pieces ---------- */
export const WoodSurface: React.FC<{w?: number; h?: number; z?: number}> = ({w = 2600, h = 1600, z = -50}) => {
  const tex = useCanvasTexture(1024, 640, drawWood);
  return <TexturePlane tex={tex} w={w} h={h} z={z} />;
};

/** open sketchbook seen from above. right page shows `pageTex` */
export const OpenSketchbook: React.FC<{x: number; y: number; pageW: number; pageH: number; right: THREE.Texture; left?: THREE.Texture; z?: number}> = ({
  x,
  y,
  pageW,
  pageH,
  right,
  left,
  z = 0,
}) => {
  const blank = useCanvasTexture(256, 340, (ctx, w, h) => drawPaper(ctx, w, h));
  return (
    <group position={[x, y, z]}>
      {/* shadow under book */}
      <Rect w={pageW * 2 + 40} h={pageH + 40} x={10} y={-14} z={-1} color="#000" opacity={0.35} />
      <Rect w={pageW * 2 + 18} h={pageH + 18} z={-0.5} color="#6B4F3A" />
      <TexturePlane tex={left ?? blank} w={pageW} h={pageH} x={-pageW / 2} />
      <TexturePlane tex={right} w={pageW} h={pageH} x={pageW / 2} />
      {/* spine shading */}
      <Rect w={26} h={pageH} z={0.1} color="#000" opacity={0.12} />
      <Rect w={6} h={pageH} z={0.12} color="#000" opacity={0.18} />
    </group>
  );
};

/** top-down hand with pencil; the pencil tip sits at (tipX, tipY) */
export const DrawingHand: React.FC<{tipX: number; tipY: number; z?: number; angle?: number}> = ({tipX, tipY, z = 20, angle = -0.75}) => {
  const pencil = useMemo(() => roundedRect(16, 190, 4), []);
  const tipShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-8, 0);
    s.lineTo(8, 0);
    s.lineTo(0, -26);
    s.closePath();
    return s;
  }, []);
  const hand = useMemo(() => roundedRect(96, 118, 46), []);
  const sleeve = useMemo(() => roundedRect(150, 900, 60), []);
  const cuff = useMemo(() => roundedRect(158, 40, 18), []);
  // everything is laid out along the pencil direction, origin at the tip
  return (
    <group position={[tipX, tipY, z]} rotation={[0, 0, angle]}>
      <Flat shape={tipShape} color="#D9B58A" position={[0, 26, 0]} />
      <Flat shape={pencil} color="#E2B34A" outline={C.ink} outlineWidth={2} position={[0, 26 + 95, 0.1]} />
      <Flat shape={hand} color={C.hero} outline={C.ink} position={[6, 120, 0.3]} />
      <Flat shape={cuff} color={C.heroShade} outline={C.ink} position={[4, 196, 0.35]} />
      <Flat shape={sleeve} color={C.hero} outline={C.ink} position={[4, 650, 0.32]} />
    </group>
  );
};

/* ---------- kitchen ---------- */
export const Fridge: React.FC<{x: number; drawings?: number}> = ({x, drawings = 2}) => {
  const body = useMemo(() => roundedRect(240, 540, 22), []);
  const handle = useMemo(() => roundedRect(10, 110, 5), []);
  return (
    <group position={[x, FLOOR_Y + 270, -60]}>
      <Flat shape={body} color="#353C52" outline="#4A5270" />
      <Rect w={232} h={4} y={90} z={0.1} color="#262C3E" />
      <Flat shape={handle} color="#4A5270" position={[96, 160, 0.2]} />
      <Flat shape={handle} color="#4A5270" position={[96, 0, 0.2]} />
      {Array.from({length: drawings}, (_, i) => (
        <group key={i} position={[-40 + i * 66, 170 - (i % 2) * 22, 0.3]} rotation={[0, 0, (i % 2 ? 0.08 : -0.06)]}>
          <Rect w={70} h={86} color="#E8E0CC" />
          <Rect w={36} h={6} y={14} z={0.1} color={i % 2 ? '#5E8A4E' : '#3E5C8A'} />
          <Rect w={26} h={6} y={-6} z={0.1} color="#C8743A" />
          <Flat shape={ellipse(6, 6)} color="#B04B34" position={[0, 40, 0.2]} />
        </group>
      ))}
    </group>
  );
};

export const Counter: React.FC<{x: number; w: number}> = ({x, w}) => (
  <group position={[x, 0, -55]}>
    <Rect w={w} h={210} y={FLOOR_Y + 105} color="#262B3A" />
    <Rect w={w + 16} h={14} y={FLOOR_Y + 214} color="#4A5066" />
    {Array.from({length: Math.floor(w / 140)}, (_, i) => (
      <Rect key={i} w={4} h={180} x={-w / 2 + 140 * (i + 1)} y={FLOOR_Y + 100} z={0.1} color="#1C2030" />
    ))}
    {/* upper cabinets */}
    <Rect w={w} h={170} y={FLOOR_Y + 560} color="#232838" />
    {Array.from({length: Math.floor(w / 140)}, (_, i) => (
      <Rect key={`u${i}`} w={4} h={160} x={-w / 2 + 140 * (i + 1)} y={FLOOR_Y + 560} z={0.1} color="#1A1E2C" />
    ))}
  </group>
);

/* ---------- lunch table (side view) ---------- */
export const LunchTable: React.FC<{x: number; w: number; topY: number}> = ({x, w, topY}) => (
  <group position={[x, 0, 20]}>
    <Rect w={w} h={18} y={topY} color="#7A5A42" />
    <Rect w={w - 20} h={26} y={topY - 22} color="#5A4232" />
    <Rect w={16} h={topY - FLOOR_Y - 34} x={-w / 2 + 50} y={(topY - 34 + FLOOR_Y) / 2} color="#4A3527" />
    <Rect w={16} h={topY - FLOOR_Y - 34} x={w / 2 - 50} y={(topY - 34 + FLOOR_Y) / 2} color="#4A3527" />
  </group>
);

/** lunch trays on a table top */
export const Tray: React.FC<{x: number; y: number}> = ({x, y}) => (
  <group position={[x, y + 8, 21]}>
    <Rect w={130} h={10} color="#3E5C8A" />
    <Flat shape={ellipse(18, 10)} color="#B04B34" position={[-30, 12, 0.1]} />
    <Rect w={40} h={14} x={24} y={10} z={0.1} color="#D9B58A" />
  </group>
);
