import React, {useMemo} from 'react';
import * as THREE from 'three';
import {FONT} from './overlay';
import {useCanvasTexture} from './canvas';
import {C, FLOOR_Y} from '../theme';
import {ellipse, Flat, Glow, GradientPlane, LightCone, poly, Rect, roundedRect} from './three';
import {useFilm} from './film';
import {Backdrop, SkyWindow} from './backdrops';
import {flicker, Sway, useLife} from './life';

/** wall + floor, wide enough for push-ins and pans */
export const Room: React.FC<{wallTop?: string; wallBottom?: string}> = ({
  wallTop = C.wallTop,
  wallBottom = C.wallBottom,
}) => {
  // enhanced film: a fully built room for this shot's place, coloured by the mood (kit/film.tsx)
  const film = useFilm();
  if (film) return <Backdrop loc={film.loc} m={film} />;
  return (
  <group>
    <GradientPlane w={4000} h={1600} y={FLOOR_Y + 800} z={-100} top={wallTop} bottom={wallBottom} />
    <Rect w={4000} h={900} y={FLOOR_Y - 450} z={-99} color={C.floor} />
    <Rect w={4000} h={3} y={FLOOR_Y} z={-98} color={C.line} />
  </group>
  );
};

export const Window: React.FC<{x: number; y: number; moon?: boolean}> = ({x, y, moon = true}) => {
  const film = useFilm();
  if (film) return <group position={[0, 0, 6]}><SkyWindow x={x} y={y} w={214} h={244} m={film} /></group>;
  return (
  <group position={[x, y, -90]}>
    <Rect w={230} h={260} color={C.line} />
    <Rect w={214} h={244} z={0.1} color="#0F1420" />
    <Rect w={4} h={244} z={0.2} color={C.line} />
    <Rect w={214} h={4} z={0.2} color={C.line} />
    {moon && (
      <>
        <Flat shape={ellipse(24, 24)} color={C.moon} position={[52, 62, 0.3]} />
        <Glow x={52} y={62} z={0.4} size={180} color={C.moon} intensity={0.35} />
      </>
    )}
  </group>
  );
};

export const Desk: React.FC<{x: number; w?: number; topY?: number}> = ({x, w = 560, topY = FLOOR_Y + 170}) => (
  <group position={[x, 0, 20]}>
    <Rect w={w} h={16} y={topY} color={C.woodTop} />
    <Rect w={w - 12} h={30} y={topY - 23} color={C.wood} />
    <Rect w={14} h={topY - FLOOR_Y - 38} x={-w / 2 + 30} y={(topY - 38 + FLOOR_Y) / 2} color={C.wood} />
    <Rect w={14} h={topY - FLOOR_Y - 38} x={w / 2 - 30} y={(topY - 38 + FLOOR_Y) / 2} color={C.wood} />
  </group>
);

export const Sketchbook: React.FC<{x: number; y: number; z?: number}> = ({x, y, z = 21}) => (
  <group position={[x, y, z]}>
    <Rect w={150} h={10} color={C.paper} />
    <Rect w={150} h={3} y={-6} color="#8A6F55" />
  </group>
);

/** desk lamp: base, arm, shade, bulb glow and light cone; `on` 0..1 */
export const DeskLamp: React.FC<{x: number; baseY: number; on: number; coneBottomY: number}> = ({
  x,
  baseY,
  on,
  coneBottomY,
}) => {
  const shade = useMemo(() => poly([[-30, 0], [30, 0], [60, -46], [-60, -46]]), []);
  const shadeY = baseY + 190;
  const bulbY = shadeY - 46;
  const {t, k} = useLife();
  const fl = 1 - k + k * flicker(t, x * 0.01, 0.05);
  return (
    <group>
      <group position={[x, 0, 22]}>
        <Flat shape={roundedRect(70, 12, 5)} color={C.lampMetal} position={[0, baseY + 6, 0]} />
        <Rect w={8} h={110} x={-6} y={baseY + 60} color={C.lampMetal} />
        <group position={[18, baseY + 135, 0]} rotation={[0, 0, -0.75]}>
          <Rect w={8} h={90} color={C.lampMetal} />
        </group>
        <Flat shape={shade} color={C.lampMetal} outline="#3A4050" outlineWidth={2} position={[48, shadeY, 0.1]} />
      </group>
      {on > 0 && (
        <>
          <Glow x={x + 48} y={bulbY + 2} z={46} size={120} sy={0.5} color={C.lamp} intensity={on * fl} />
          <Glow x={x + 48} y={bulbY - 60} z={46} size={700} sy={0.8} color={C.lamp} intensity={0.16 * on * fl} />
          <LightCone
            x={x + 48}
            topY={bulbY}
            bottomY={coneBottomY}
            topW={110}
            bottomW={620}
            color={C.lamp}
            opacity={0.18 * on}
            z={45}
          />
        </>
      )}
    </group>
  );
};

/** hanging ceiling lamp; returns visuals only (add a PoolLight for the Darkness layer yourself) */
export const PendantLamp: React.FC<{x: number; shadeY: number; on: number; coneBottomY: number}> = ({
  x,
  shadeY,
  on,
  coneBottomY,
}) => {
  const shade = useMemo(() => poly([[-22, 0], [22, 0], [70, -50], [-70, -50]]), []);
  const top = shadeY + 600;
  return (
    <Sway x={x} y={top} amp={0.012} speed={0.16} seed={x * 0.01}>
      <Rect w={3} h={600} y={-300} z={41} color="#2A3040" />
      <Flat shape={shade} color={C.lampMetal} outline="#3A4050" outlineWidth={2} position={[0, -600, 41]} />
      {on > 0 && (
        <>
          <Glow x={0} y={-652} z={46} size={130} sy={0.45} color={C.lamp} intensity={on} />
          <LightCone x={0} topY={-650} bottomY={coneBottomY - top} topW={130} bottomW={760} color={C.lamp} opacity={0.14 * on} z={45} />
        </>
      )}
    </Sway>
  );
};

/** soft dark ellipse under a character / object */
export const FloorShadow: React.FC<{x: number; w: number; y?: number}> = ({x, w, y = FLOOR_Y}) => (
  <Flat shape={ellipse(w / 2, 10)} color="#000000" opacity={0.5} position={[x, y, -97]} />
);

export const Chalkboard: React.FC<{x: number; y: number}> = ({x, y}) => (
  <group position={[x, y, -80]}>
    <Rect w={520} h={260} color="#3A2E26" />
    <Rect w={500} h={240} z={0.1} color={C.chalk} />
    {/* chalk scribbles */}
    <Rect w={160} h={5} x={-120} y={60} z={0.2} color="#9AA79F" opacity={0.6} />
    <Rect w={110} h={5} x={-145} y={25} z={0.2} color="#9AA79F" opacity={0.6} />
    <Rect w={190} h={5} x={60} y={-30} z={0.2} color="#9AA79F" opacity={0.5} />
  </group>
);

/* =====================================================================
   Act 2 sets
   ===================================================================== */

/** side-view bed. topY = mattress top. headboard on the left. z: frame 8, blanket 12 (covers a sitting person's lap) */
export const Bed: React.FC<{x: number; w?: number; topY?: number; blanketFrom?: number; pillow?: boolean}> = ({
  x,
  w = 620,
  topY = FLOOR_Y + 150,
  blanketFrom = 0.35,
  pillow = true,
}) => {
  const pil = useMemo(() => roundedRect(150, 46, 22), []);
  const legH = 46;
  const left = -w / 2;
  return (
    <group position={[x, 0, 0]}>
      <Rect w={22} h={topY - FLOOR_Y + 110} x={left - 4} y={(topY + 110 + FLOOR_Y) / 2} z={7} color="#2A2230" />
      <Rect w={w} h={topY - FLOOR_Y - legH - 30} y={(topY - 30 + FLOOR_Y + legH) / 2} z={8} color="#241E2A" />
      <Rect w={w - 10} h={34} y={topY - 17} z={8.2} color="#3A4256" />
      <Rect w={14} h={legH} x={left + 20} y={FLOOR_Y + legH / 2} z={8} color="#1A1620" />
      <Rect w={14} h={legH} x={w / 2 - 20} y={FLOOR_Y + legH / 2} z={8} color="#1A1620" />
      {pillow && <Flat shape={pil} color="#C9CCD6" outline={C.ink} position={[left + 100, topY + 14, 8.4]} />}
      <Rect w={w * (1 - blanketFrom)} h={62} x={w / 2 - (w * (1 - blanketFrom)) / 2} y={topY - 4} z={12} color="#2F3B5C" />
      <Rect w={w * (1 - blanketFrom)} h={6} x={w / 2 - (w * (1 - blanketFrom)) / 2} y={topY + 26} z={12.1} color="#3D4C74" />
    </group>
  );
};

/** nightstand with an LED clock (cool white, not amber) */
export const Nightstand: React.FC<{x: number; time: string; glow?: number}> = ({x, time, glow = 1}) => {
  const tex = useCanvasTexture(256, 96, (ctx, w, h) => {
    ctx.fillStyle = '#0A0C10';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#BFD2FF';
    ctx.font = `72px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(time, w / 2, 74);
  });
  const top = FLOOR_Y + 160;
  return (
    <group position={[x, 0, 9]}>
      <Rect w={150} h={160} y={FLOOR_Y + 80} color="#22202A" />
      <Rect w={130} h={4} y={FLOOR_Y + 100} z={0.1} color="#15131A" />
      <mesh position={[0, top + 26, 0.2]}>
        <planeGeometry args={[110, 42]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Glow x={0} y={top + 26} z={37} size={220} sy={0.5} color="#BFD2FF" intensity={0.25 * glow} />
    </group>
  );
};

/** a row of school lockers on the back wall */
export const Lockers: React.FC<{x: number; count: number; colors?: string[]}> = ({x, count, colors = ['#2E3A55', '#2A344C', '#33405E']}) => {
  const lw = 96;
  return (
    <group position={[x - (count * lw) / 2, 0, -85]}>
      {Array.from({length: count}, (_, i) => (
        <group key={i} position={[i * lw + lw / 2, FLOOR_Y + 230, 0]}>
          <Rect w={lw - 6} h={440} color={colors[i % colors.length]} />
          <Rect w={40} h={4} y={150} z={0.1} color="#1C2336" />
          <Rect w={40} h={4} y={135} z={0.1} color="#1C2336" />
          <Rect w={40} h={4} y={120} z={0.1} color="#1C2336" />
          <Rect w={8} h={30} x={30} y={10} z={0.1} color="#4A5878" />
        </group>
      ))}
    </group>
  );
};

/** bathroom mirror frame + glass (put the reflection between z -70 and -60) */
export const MirrorFrame: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <group position={[x, y, 0]}>
    <Rect w={w + 24} h={h + 24} z={-75} color="#4A5066" />
    <Rect w={w} h={h} z={-74} color="#1C2430" />
    {/* sheen */}
    <group position={[-w * 0.2, h * 0.1, -58]} rotation={[0, 0, -0.6]}>
      <Rect w={30} h={h * 0.9} color="#FFFFFF" opacity={0.05} />
    </group>
    <Rect w={w - 40} h={14} y={h / 2 + 30} z={-57} color="#DDE6F5" />
  </group>
);

/** counter + cabinet; the wall section under it hides a reflection's lower body (z -56 > reflection) */
export const Sink: React.FC<{x: number; w: number; topY?: number}> = ({x, w, topY = FLOOR_Y + 300}) => (
  <group position={[x, 0, -56]}>
    <Rect w={w + 60} h={topY + 14 - FLOOR_Y} y={(topY + 14 + FLOOR_Y) / 2} color="#161B27" />
    <Rect w={w} h={18} y={topY} z={0.2} color="#C9CCD6" />
    <Rect w={w - 30} h={topY - 9 - FLOOR_Y} y={(topY - 9 + FLOOR_Y) / 2} z={0.1} color="#2A2F3E" />
    <Rect w={4} h={topY - 30 - FLOOR_Y} y={(topY - 30 + FLOOR_Y) / 2} z={0.15} color="#1E2230" />
  </group>
);

/** sporty car, side view, facing right */
export const Car: React.FC<{x: number; color?: string}> = ({x, color = '#5A6A8A'}) => {
  const body = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-300, 0);
    s.lineTo(300, 0);
    s.quadraticCurveTo(320, 0, 318, 40);
    s.lineTo(300, 80);
    s.lineTo(150, 96);
    s.quadraticCurveTo(80, 170, 0, 170);
    s.lineTo(-130, 168);
    s.quadraticCurveTo(-210, 150, -250, 96);
    s.lineTo(-300, 86);
    s.quadraticCurveTo(-320, 60, -300, 0);
    return s;
  }, []);
  const win = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-200, 100);
    s.quadraticCurveTo(-150, 150, -110, 156);
    s.lineTo(-10, 158);
    s.quadraticCurveTo(60, 156, 120, 100);
    s.closePath();
    return s;
  }, []);
  const wheel = useMemo(() => ellipse(56, 56), []);
  const hub = useMemo(() => ellipse(22, 22), []);
  return (
    <group position={[x, FLOOR_Y + 40, 6]}>
      <Flat shape={body} color={color} outline={C.ink} />
      <Flat shape={win} color="#1A2233" position={[0, 0, 0.1]} />
      <Rect w={4} h={58} x={-40} y={128} z={0.2} color={color} />
      {[-180, 190].map((wx) => (
        <group key={wx} position={[wx, 0, 0.3]}>
          <Flat shape={wheel} color="#111318" outline="#2A2F3B" />
          <Flat shape={hub} color="#6F7C96" position={[0, 0, 0.1]} />
        </group>
      ))}
      <Glow x={312} y={56} z={40} size={160} sy={0.5} color="#FFF3D6" intensity={0.6} />
    </group>
  );
};

export const DumbbellRack: React.FC<{x: number}> = ({x}) => (
  <group position={[x, 0, -60]}>
    <Rect w={420} h={10} y={FLOOR_Y + 90} color="#2A2F3B" />
    <Rect w={420} h={10} y={FLOOR_Y + 180} color="#2A2F3B" />
    <Rect w={10} h={190} x={-200} y={FLOOR_Y + 95} color="#2A2F3B" />
    <Rect w={10} h={190} x={200} y={FLOOR_Y + 95} color="#2A2F3B" />
    {[0, 1].map((r) =>
      Array.from({length: 5}, (_, i) => (
        <group key={`${r}${i}`} position={[-160 + i * 80, FLOOR_Y + 112 + r * 90, 0.1]}>
          <Flat shape={ellipse(16, 22)} color="#15171D" position={[-22, 0, 0]} />
          <Flat shape={ellipse(16, 22)} color="#15171D" position={[22, 0, 0]} />
          <Rect w={40} h={8} z={0.1} color="#4A5066" />
        </group>
      )),
    )}
  </group>
);

/** ring light on a stand, with a phone in the middle */
export const RingLight: React.FC<{x: number; on?: number}> = ({x, on = 1}) => {
  const ring = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 80, 0, Math.PI * 2, false);
    const h = new THREE.Path();
    h.absarc(0, 0, 62, 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  }, []);
  const top = FLOOR_Y + 420;
  return (
    <group position={[x, 0, 14]}>
      <Rect w={8} h={top - FLOOR_Y} y={(top + FLOOR_Y) / 2} color="#2A2F3B" />
      <Rect w={120} h={8} y={FLOOR_Y + 4} color="#2A2F3B" />
      <Flat shape={ring} color="#F2F5FF" position={[0, top, 0.2]} opacity={0.4 + 0.6 * on} />
      <Rect w={34} h={62} y={top} z={0.3} color="#1A1D24" />
      <Glow x={0} y={top} z={46} size={520} color="#E8EEFF" intensity={0.45 * on} />
    </group>
  );
};

/** bathroom wall tiles */
export const Tiles: React.FC<{x: number; w: number; y0: number; y1: number}> = ({x, w, y0, y1}) => {
  const step = 70;
  const lines: React.ReactNode[] = [];
  for (let yy = y0; yy <= y1; yy += step) lines.push(<Rect key={`h${yy}`} w={w} h={2} x={x} y={yy} z={-90} color="#2A3042" />);
  for (let xx = x - w / 2; xx <= x + w / 2; xx += step) lines.push(<Rect key={`v${xx}`} w={2} h={y1 - y0} x={xx} y={(y0 + y1) / 2} z={-90} color="#2A3042" />);
  return <group>{lines}</group>;
};

/** stadium floodlights across the top; on 0..1 */
export const Floodlights: React.FC<{y: number; count?: number; width?: number; on: number}> = ({y, count = 7, width = 2600, on}) => (
  <group>
    {Array.from({length: count}, (_, i) => {
      const x = -width / 2 + (width / (count - 1)) * i;
      return (
        <group key={i}>
          <Rect w={120} h={46} x={x} y={y} z={-20} color="#2A3044" />
          {on > 0 && (
            <>
              <Rect w={100} h={30} x={x} y={y} z={46} color="#F4F7FF" opacity={on} />
              <FloodGlow x={x} y={y} i={i} on={on} />
            </>
          )}
        </group>
      );
    })}
  </group>
);

const FloodGlow: React.FC<{x: number; y: number; i: number; on: number}> = ({x, y, i, on}) => {
  const {t, k} = useLife();
  return <Glow x={x} y={y} z={47} size={700} sy={0.7} color="#E8EEFF" intensity={0.35 * on * (1 - k + k * flicker(t, i, 0.07, i === 4))} />;
};
