/**
 * Fully built, reusable backdrops for the flat (16:9 film) kit. Each place is a complete room (wall + wallpaper
 * pattern + trim + floor + furniture + personal objects) that recolours with the film's mood (kit/film.tsx).
 * <Room/> renders the right one automatically inside the enhanced film. World units = px at zoom 1, FLOOR_Y = -300.
 * z: -100..-92 (behind every shot's own props; Window is at -90).
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FLOOR_Y} from '../theme';
import {ellipse, Flat, Glow, GradientPlane, Rect, roundedRect} from './three';
import {drawPage, DRAGON, LIA_DRAWING, PLANT, portrait, useCanvasTexture} from './canvas';
import type {Loc} from './film';

type MoodSet = {wallTop: string; wallBottom: string; floor: string; trim: string; skyTop: string; skyBottom: string; night: number};

const F = FLOOR_Y;

/** shared shell: wall gradient, wallpaper stripes, crown + baseboard trim, plank floor */
const Shell: React.FC<{m: MoodSet; stripes?: boolean; lowerBand?: string; floorLines?: 'planks' | 'tiles'}> = ({m, stripes, lowerBand, floorLines = 'planks'}) => (
  <group>
    <GradientPlane w={4400} h={1700} y={F + 850} z={-100} top={m.wallTop} bottom={m.wallBottom} />
    {stripes && Array.from({length: 44}, (_, i) => <Rect key={i} w={10} h={1700} x={-2150 + i * 100} y={F + 850} z={-99.5} color="#FFFFFF" opacity={0.05} />)}
    {lowerBand && <Rect w={4400} h={330} y={F + 165} z={-99.4} color={lowerBand} opacity={0.55} />}
    {lowerBand && <Rect w={4400} h={10} y={F + 330} z={-99.3} color={m.trim} opacity={0.7} />}
    <Rect w={4400} h={22} y={F + 720} z={-99.2} color={m.trim} opacity={0.55} />
    <Rect w={4400} h={26} y={F + 13} z={-99.2} color={m.trim} opacity={0.8} />
    <Rect w={4400} h={900} y={F - 450} z={-99} color={m.floor} />
    {floorLines === 'planks' && Array.from({length: 9}, (_, i) => <Rect key={i} w={4400} h={2} y={F - 40 - i * i * 9} z={-98.9} color="#000000" opacity={0.18} />)}
    {floorLines === 'tiles' && Array.from({length: 40}, (_, i) => <Rect key={i} w={2} h={900} x={-2000 + i * 100} y={F - 450} z={-98.9} color="#000000" opacity={0.12} />)}
    <Rect w={4400} h={3} y={F} z={-98} color="#000000" opacity={0.35} />
  </group>
);

/** a framed drawing pinned to the wall (real strokes: Mo's drawings are part of his room) */
const PinnedDrawing: React.FC<{x: number; y: number; w?: number; kind: 'dragon' | 'lia' | 'plant' | 'portrait'; rot?: number}> = ({x, y, w = 120, kind, rot = 0}) => {
  const strokes = kind === 'dragon' ? DRAGON : kind === 'lia' ? LIA_DRAWING : kind === 'plant' ? PLANT : portrait('none');
  const tex = useCanvasTexture(256, 320, (ctx, cw, ch) => drawPage(ctx, cw, ch, strokes, '', 1, '#2A2A30', 6));
  return (
    <group position={[x, y, -96]} rotation={[0, 0, rot]}>
      <mesh>
        <planeGeometry args={[w, w * 1.25]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Flat shape={ellipse(5, 5)} color="#C8574A" position={[0, w * 0.58, 0.2]} />
    </group>
  );
};

const Shelf: React.FC<{x: number; y: number; w?: number; m: MoodSet}> = ({x, y, w = 300, m}) => {
  const books = ['#8C3B32', '#C9826B', '#3E7C7A', '#D9B26A', '#5B4E7A', '#E8E0CC', '#2F4A6B', '#7C8C7A'];
  let bx = -w / 2 + 14;
  const out: React.ReactNode[] = [];
  let i = 0;
  while (bx < w / 2 - 40) {
    const bw = 16 + ((i * 7) % 11);
    const bh = 70 + ((i * 13) % 34);
    out.push(<Rect key={i} w={bw} h={bh} x={bx + bw / 2} y={bh / 2 + 7} z={0.1} color={books[i % books.length]} />);
    bx += bw + 3;
    i++;
  }
  return (
    <group position={[x, y, -95]}>
      <Rect w={w} h={14} color={m.trim} />
      <Rect w={w} h={4} y={-9} color="#000000" opacity={0.25} />
      {out}
      <Flat shape={ellipse(18, 22)} color="#B0623E" position={[w / 2 - 22, 28, 0.1]} />
      <Flat shape={ellipse(26, 18)} color="#3E6B4E" position={[w / 2 - 22, 58, 0.05]} />
    </group>
  );
};

const Plant: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
  <group position={[x, F, -94]} scale={[s, s, 1]}>
    <Flat shape={roundedRect(80, 90, 12)} color="#B0623E" position={[0, 45, 0]} />
    {[[-40, 150, 0.5], [30, 170, -0.4], [0, 200, 0.1], [-60, 120, 0.9], [55, 125, -0.8]].map(([lx, ly, r], i) => (
      <group key={i} position={[lx, ly, 0.1 - i * 0.01]} rotation={[0, 0, r]}>
        <Flat shape={ellipse(24, 60)} color={i % 2 ? '#3E6B4E' : '#4F7F5C'} />
      </group>
    ))}
  </group>
);

/** warm fairy lights across the wall: cosy at night, barely there at day */
const StringLights: React.FC<{x0: number; x1: number; y: number; on: number}> = ({x0, x1, y, on}) => {
  const f = useCurrentFrame();
  const n = 14;
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const t = i / (n - 1);
        const x = x0 + (x1 - x0) * t;
        const yy = y - Math.sin(t * Math.PI) * 60;
        const tw = 0.75 + 0.25 * Math.sin(f * 0.12 + i * 1.7);
        return (
          <group key={i}>
            <Flat shape={ellipse(6, 8)} color="#FFE2A8" position={[x, yy, -93]} />
            <Glow x={x} y={yy} z={-92.5} size={70} color="#FFC27A" intensity={on * tw * 0.6} />
          </group>
        );
      })}
    </group>
  );
};

const Clock: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  const a = -f * 0.01;
  return (
    <group position={[x, y, -95]}>
      <Flat shape={ellipse(46, 46)} color="#2B2F3A" />
      <Flat shape={ellipse(40, 40)} color="#F3EFE6" position={[0, 0, 0.1]} />
      <group rotation={[0, 0, a]} position={[0, 0, 0.2]}>
        <Rect w={4} h={30} y={15} color="#2B2F3A" />
      </group>
      <group rotation={[0, 0, a * 12]} position={[0, 0, 0.25]}>
        <Rect w={3} h={36} y={18} color="#C8574A" />
      </group>
    </group>
  );
};

/** a window whose sky follows the mood (day blue, sunset, night with moon) */
export const SkyWindow: React.FC<{x: number; y: number; w?: number; h?: number; m: MoodSet}> = ({x, y, w = 260, h = 300, m}) => (
  <group position={[x, y, -96]}>
    <Rect w={w + 26} h={h + 26} color={m.trim} />
    <GradientPlane w={w} h={h} z={0.1} top={m.skyTop} bottom={m.skyBottom} />
    {m.night > 0.5 && <Flat shape={ellipse(20, 20)} color="#E9EEF8" position={[w * 0.22, h * 0.25, 0.2]} />}
    {m.night < 0.5 && <Flat shape={ellipse(60, 22)} color="#FFFFFF" opacity={0.7} position={[-w * 0.15, h * 0.2, 0.2]} />}
    {m.night < 0.5 && <Flat shape={ellipse(40, 16)} color="#FFFFFF" opacity={0.55} position={[w * 0.2, h * 0.05, 0.2]} />}
    <Rect w={6} h={h} z={0.3} color={m.trim} />
    <Rect w={w} h={6} z={0.3} color={m.trim} />
    <Rect w={w + 60} h={14} y={-h / 2 - 16} z={0.4} color={m.trim} />
  </group>
);

const Bedroom: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} stripes />
    <Shelf x={-760} y={160} m={m} />
    <PinnedDrawing x={420} y={250} kind="dragon" rot={0.04} />
    <PinnedDrawing x={560} y={235} kind="portrait" rot={-0.05} w={105} />
    <PinnedDrawing x={690} y={262} kind="plant" rot={0.03} w={95} />
    <PinnedDrawing x={300} y={120} kind="lia" rot={-0.03} w={90} />
    <group position={[880, 210, -96]}>
      <Rect w={200} h={270} color="#2B2F3A" />
      <Rect w={184} h={254} z={0.1} color="#C97B4A" />
      <Flat shape={ellipse(50, 50)} color="#F2C94C" position={[30, 50, 0.2]} />
      <Rect w={184} h={80} y={-87} z={0.2} color="#4A6B8C" />
    </group>
    <StringLights x0={-1100} x1={1100} y={640} on={0.35 + 0.65 * m.night} />
    <Plant x={-1050} />
    <Flat shape={ellipse(520, 70)} color="#7A3E3A" opacity={0.85} position={[60, F - 90, -97]} />
    <Flat shape={ellipse(470, 55)} color="#9C5A4A" opacity={0.6} position={[60, F - 90, -96.9]} />
  </group>
);

const Kitchen: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} />
    {/* tiled backsplash */}
    <Rect w={4400} h={160} y={F + 300} z={-98.5} color="#E8EDEC" opacity={0.35} />
    {Array.from({length: 45}, (_, i) => <Rect key={i} w={2} h={160} x={-2200 + i * 100} y={F + 300} z={-98.4} color="#000000" opacity={0.12} />)}
    <Rect w={4400} h={2} y={F + 300} z={-98.4} color="#000000" opacity={0.12} />
    {/* upper cabinets */}
    {[-1500, -1180, -860, 860, 1180, 1500].map((x) => (
      <group key={x} position={[x, F + 560, -97]}>
        <Rect w={300} h={220} color="#8C6A4A" />
        <Rect w={140} h={200} x={-72} z={0.1} color="#9C7A58" />
        <Rect w={140} h={200} x={72} z={0.1} color="#9C7A58" />
        <Rect w={8} h={30} x={-14} y={-60} z={0.2} color="#2B2F3A" />
        <Rect w={8} h={30} x={14} y={-60} z={0.2} color="#2B2F3A" />
      </group>
    ))}
    <Clock x={-520} y={F + 620} />
    <SkyWindow x={520} y={F + 560} w={240} h={220} m={m} />
    <group position={[-160, F + 600, -96]}>
      <Rect w={150} h={110} color="#2B2F3A" />
      <Rect w={136} h={96} z={0.1} color="#E8E0CC" />
      {[-30, 0, 30].map((x, i) => <Flat key={i} shape={ellipse(14, 18)} color={['#9C7B6B', '#EDE6D6', '#E3C9A8'][i]} position={[x, -6, 0.2]} />)}
    </group>
    <Plant x={1000} s={0.8} />
  </group>
);

const Classroom: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} lowerBand="#5B6478" floorLines="tiles" />
    <SkyWindow x={-1180} y={F + 470} w={330} h={380} m={m} />
    <SkyWindow x={1180} y={F + 470} w={330} h={380} m={m} />
    {/* alphabet banner */}
    {Array.from({length: 16}, (_, i) => (
      <group key={i} position={[-900 + i * 120, F + 790, -96]}>
        <Rect w={90} h={90} color={['#E2B45A', '#7FB3A8', '#E58C8A', '#8FA6FF'][i % 4]} />
        <Rect w={40} h={10} z={0.1} color="#FFFFFF" opacity={0.8} />
      </group>
    ))}
    <Clock x={760} y={F + 640} />
    {/* bulletin board with pinned papers */}
    <group position={[-720, F + 520, -96]}>
      <Rect w={300} h={220} color="#8C6A4A" />
      <Rect w={280} h={200} z={0.1} color="#C9A27A" />
      {[[-80, 40, '#E8E0CC'], [20, 50, '#F2E2A0'], [100, 20, '#E8E0CC'], [-60, -50, '#A8D0E8'], [60, -55, '#E8E0CC']].map(([x, y, c], i) => (
        <Rect key={i} w={70} h={80} x={x as number} y={y as number} z={0.2 + i * 0.01} color={c as string} />
      ))}
    </group>
    <Plant x={-1450} s={0.9} />
  </group>
);

const Hallway: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} lowerBand="#3E5B74" floorLines="tiles" />
    {[-1300, -300, 700].map((x) => (
      <group key={x} position={[x, F + 260, -97]}>
        <Rect w={200} h={520} color={m.trim} />
        <Rect w={176} h={500} y={-10} z={0.1} color="#6A4C36" />
        <Rect w={70} h={90} y={120} z={0.2} color={m.skyBottom} opacity={0.8} />
        <Flat shape={ellipse(8, 8)} color="#D9B26A" position={[60, -20, 0.2]} />
      </group>
    ))}
    {[-800, 200, 1200].map((x, i) => (
      <group key={x} position={[x, F + 480, -96]}>
        <Rect w={170} h={230} color={['#E2B45A', '#7FB3A8', '#E58C8A'][i]} />
        <Rect w={120} h={16} y={70} z={0.1} color="#FFFFFF" opacity={0.85} />
        <Rect w={90} h={10} y={40} z={0.1} color="#FFFFFF" opacity={0.6} />
      </group>
    ))}
    {[-1000, 0, 1000].map((x) => <Glow key={x} x={x} y={F + 800} z={-93} size={520} sy={0.35} color="#FFF1D6" intensity={0.25} />)}
  </group>
);

const Bathroom: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} lowerBand="#7FA3A8" floorLines="tiles" />
    <SkyWindow x={-900} y={F + 620} w={180} h={150} m={m} />
    <group position={[880, F + 380, -96]}>
      <Rect w={240} h={10} color="#C9CFC8" />
      {[-70, 0, 70].map((x, i) => <Rect key={i} w={60} h={160} x={x} y={-80} z={0.1} color={['#C9826B', '#3E7C7A', '#D9B26A'][i]} />)}
    </group>
    <Plant x={-1150} s={0.7} />
  </group>
);

const Gym: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} floorLines="planks" />
    {Array.from({length: 16}, (_, i) => <Rect key={i} w={180} h={300} x={-1500 + i * 200} y={F + 170} z={-98} color={i % 2 ? '#3E5B74' : '#2F4A6B'} />)}
    {[-700, 0, 700].map((x, i) => (
      <group key={x} position={[x, F + 700, -96]}>
        <Rect w={260} h={70} color={['#8C3B32', '#E2B45A', '#3E7C7A'][i]} />
        <Rect w={180} h={12} z={0.1} color="#FFFFFF" opacity={0.8} />
      </group>
    ))}
    <Clock x={1150} y={F + 640} />
  </group>
);

const Street: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <GradientPlane w={4400} h={1700} y={F + 850} z={-100} top={m.skyTop} bottom={m.skyBottom} />
    {Array.from({length: 18}, (_, i) => {
      const w = 160 + ((i * 37) % 120);
      const h = 260 + ((i * 53) % 420);
      const x = -2100 + i * 245;
      return (
        <group key={i} position={[x, F + h / 2, -99]}>
          <Rect w={w} h={h} color={m.night > 0.5 ? '#151B2E' : '#7088B0'} />
          {Array.from({length: Math.floor(h / 60)}, (_, r) =>
            Array.from({length: Math.floor(w / 50)}, (_, c) =>
              (r * 7 + c * 3 + i) % 4 === 0 ? (
                <Rect key={`${r}-${c}`} w={18} h={24} x={-w / 2 + 25 + c * 50} y={-h / 2 + 40 + r * 60} z={0.1} color={m.night > 0.5 ? '#F2A93B' : '#C8D8F0'} opacity={m.night > 0.5 ? 0.9 : 0.6} />
              ) : null,
            ),
          )}
        </group>
      );
    })}
    <Rect w={4400} h={900} y={F - 450} z={-98} color="#2B2F3A" />
    {Array.from({length: 20}, (_, i) => <Rect key={i} w={120} h={8} x={-2000 + i * 220} y={F - 140} z={-97.9} color="#E8E0CC" opacity={0.6} />)}
  </group>
);

export const Backdrop: React.FC<{loc: Loc; m: MoodSet}> = ({loc, m}) => {
  switch (loc) {
    case 'bedroom': return <Bedroom m={m} />;
    case 'kitchen': return <Kitchen m={m} />;
    case 'classroom': return <Classroom m={m} />;
    case 'hallway': return <Hallway m={m} />;
    case 'bathroom': return <Bathroom m={m} />;
    case 'gym': return <Gym m={m} />;
    case 'street': return <Street m={m} />;
    default: return <Shell m={m} />;
  }
};
