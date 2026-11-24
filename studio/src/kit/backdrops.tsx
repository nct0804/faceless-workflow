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
import {Bird, breeze, flicker, hash, Motes, Sway, useLife} from './life';

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
    <Sway x={x} y={y + w * 0.58} z={-96} amp={0.024} speed={0.18} seed={x * 0.013} base={rot}>
      <mesh position={[0, -w * 0.58, 0]}>
        <planeGeometry args={[w, w * 1.25]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Flat shape={ellipse(5, 5)} color="#C8574A" position={[0, 0, 0.2]} />
    </Sway>
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
      <Sway x={w / 2 - 22} y={44} z={0.05} amp={0.06} speed={0.2} seed={x}>
        <Flat shape={ellipse(26, 18)} color="#3E6B4E" position={[0, 14, 0]} />
      </Sway>
    </group>
  );
};

const Plant: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
  <group position={[x, F, -94]} scale={[s, s, 1]}>
    <Flat shape={roundedRect(80, 90, 12)} color="#B0623E" position={[0, 45, 0]} />
    {[[-40, 150, 0.5], [30, 170, -0.4], [0, 200, 0.1], [-60, 120, 0.9], [55, 125, -0.8]].map(([lx, ly, r], i) => (
      <Sway key={i} x={lx + 56 * Math.sin(r)} y={ly - 56 * Math.cos(r)} z={0.1 - i * 0.01} amp={0.075} speed={0.2 + i * 0.025} seed={x * 0.01 + i * 0.7} base={r}>
        <Flat shape={ellipse(24, 60)} color={i % 2 ? '#3E6B4E' : '#4F7F5C'} position={[0, 56, 0]} />
      </Sway>
    ))}
  </group>
);

/** warm fairy lights across the wall: cosy at night, barely there at day */
const StringLights: React.FC<{x0: number; x1: number; y: number; on: number}> = ({x0, x1, y, on}) => {
  const {f, t, k} = useLife();
  const n = 14;
  const sag = 60 + 7 * k * breeze(t, 0.15, x0);
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const t = i / (n - 1);
        const x = x0 + (x1 - x0) * t;
        const yy = y - Math.sin(t * Math.PI) * sag;
        const tw = 0.75 + 0.25 * Math.sin(f * 0.12 * Math.min(1, k + 0.3) + i * 1.7);
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
  const a = -f * 0.0006 - 1.1;
  const sec = Math.floor(f / 30) + Math.min(1, (f % 30) / 3) + x * 0.1; // snaps to each second in 3 frames
  const sa = (-sec * Math.PI * 2) / 60;
  return (
    <group position={[x, y, -95]}>
      <Flat shape={ellipse(46, 46)} color="#2B2F3A" />
      <Flat shape={ellipse(40, 40)} color="#F3EFE6" position={[0, 0, 0.1]} />
      <group rotation={[0, 0, a]} position={[0, 0, 0.2]}>
        <Rect w={4} h={30} y={15} color="#2B2F3A" />
      </group>
      <group rotation={[0, 0, sa]} position={[0, 0, 0.25]}>
        <Rect w={3} h={36} y={18} color="#C8574A" />
      </group>
    </group>
  );
};

/** a window whose sky follows the mood (day blue, sunset, night with moon); the sky is never still */
export const SkyWindow: React.FC<{x: number; y: number; w?: number; h?: number; m: MoodSet}> = ({x, y, w = 260, h = 300, m}) => {
  const {t, k} = useLife();
  const day = m.night < 0.5;
  // clouds drift right and wrap; fade out before they reach the frame
  const cloud = (i: number, rx: number, ry: number, cy: number, op: number) => {
    const span = w + rx * 2;
    const cx = ((((hash(i + x) * span + t * (6 + 4 * i) * k) % span) + span) % span) - span / 2;
    const fade = Math.max(0, Math.min(1, (w / 2 - Math.abs(cx) - rx * 0.6) / 30));
    return <Flat key={i} shape={ellipse(rx, ry)} color="#FFFFFF" opacity={op * fade} position={[cx, cy, 0.2]} />;
  };
  // a bird crosses every ~9 s
  const cyc = 9;
  const slot = Math.floor(t / cyc);
  const bp = (t - slot * cyc) / 2.6; // 2.6 s to cross
  const bx = -w / 2 + bp * w;
  const by = h * (0.05 + 0.3 * hash(slot + x));
  return (
    <group position={[x, y, -96]}>
      <Rect w={w + 26} h={h + 26} color={m.trim} />
      <GradientPlane w={w} h={h} z={0.1} top={m.skyTop} bottom={m.skyBottom} />
      {!day && (
        <>
          <Flat shape={ellipse(20, 20)} color="#E9EEF8" position={[w * 0.22, h * 0.25, 0.2]} />
          <Flat shape={ellipse(30, 30)} color="#E9EEF8" opacity={0.12 + 0.06 * k * breeze(t, 0.2, x)} position={[w * 0.22, h * 0.25, 0.19]} />
          {[[-0.3, 0.32], [-0.1, 0.12], [0.05, 0.38], [0.35, -0.02], [-0.35, -0.05]].map(([sx, sy], i) => (
            <Flat key={i} shape={ellipse(2.4, 2.4)} color="#FFFFFF" opacity={0.5 + 0.45 * Math.sin(t * (1.3 + i * 0.4) * Math.max(0.2, k) + i * 2)} position={[sx * w, sy * h, 0.2]} />
          ))}
        </>
      )}
      {day && cloud(0, 60, 22, h * 0.2, 0.7)}
      {day && cloud(1, 40, 16, h * 0.05, 0.55)}
      {day && cloud(2, 50, 18, h * 0.32, 0.45)}
      {day && k > 0 && bp < 1 && hash(slot * 3.1 + x) > 0.3 && (
        <group position={[0, 0, 0.25]}>
          <Bird x={bx} y={by} flap={t * 14} s={0.8} />
          {hash(slot + 1.7) > 0.5 && <Bird x={bx - 26} y={by - 12} flap={t * 14 + 1.4} s={0.65} />}
        </group>
      )}
      <Rect w={6} h={h} z={0.3} color={m.trim} />
      <Rect w={w} h={6} z={0.3} color={m.trim} />
      <Rect w={w + 60} h={14} y={-h / 2 - 16} z={0.4} color={m.trim} />
    </group>
  );
};

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
    {/* tea towel hanging from a cabinet handle */}
    <Sway x={-846} y={F + 500} z={-96.5} amp={0.05} speed={0.2} seed={3}>
      <Rect w={70} h={110} y={-55} color="#E8E0CC" />
      <Rect w={70} h={8} y={-30} z={0.05} color="#C8574A" />
      <Rect w={70} h={8} y={-84} z={0.05} color="#C8574A" />
    </Sway>
  </group>
);

const Classroom: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} lowerBand="#5B6478" floorLines="tiles" />
    <SkyWindow x={-1180} y={F + 470} w={330} h={380} m={m} />
    <SkyWindow x={1180} y={F + 470} w={330} h={380} m={m} />
    {/* alphabet banner */}
    {Array.from({length: 16}, (_, i) => (
      <Sway key={i} x={-900 + i * 120} y={F + 835} z={-96} amp={0.07} speed={0.24} seed={i * 0.55}>
        <Rect w={90} h={90} y={-45} color={['#E2B45A', '#7FB3A8', '#E58C8A', '#8FA6FF'][i % 4]} />
        <Rect w={40} h={10} y={-45} z={0.1} color="#FFFFFF" opacity={0.8} />
      </Sway>
    ))}
    <Clock x={760} y={F + 640} />
    {/* bulletin board with pinned papers */}
    <group position={[-720, F + 520, -96]}>
      <Rect w={300} h={220} color="#8C6A4A" />
      <Rect w={280} h={200} z={0.1} color="#C9A27A" />
      {[[-80, 40, '#E8E0CC'], [20, 50, '#F2E2A0'], [100, 20, '#E8E0CC'], [-60, -50, '#A8D0E8'], [60, -55, '#E8E0CC']].map(([x, y, c], i) => (
        <Sway key={i} x={x as number} y={(y as number) + 36} z={0.2 + i * 0.01} amp={0.045} speed={0.3} seed={i * 1.3}>
          <Rect w={70} h={80} y={-36} color={c as string} />
          <Flat shape={ellipse(4, 4)} color="#C8574A" position={[0, 0, 0.05]} />
        </Sway>
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
      <Sway key={x} x={x} y={F + 595} z={-96} amp={0.016} speed={0.2} seed={i * 1.9}>
        <Rect w={170} h={230} y={-115} color={['#E2B45A', '#7FB3A8', '#E58C8A'][i]} />
        <Rect w={120} h={16} y={-45} z={0.1} color="#FFFFFF" opacity={0.85} />
        <Rect w={90} h={10} y={-75} z={0.1} color="#FFFFFF" opacity={0.6} />
      </Sway>
    ))}
    <HallLights />
  </group>
);

const HallLights: React.FC = () => {
  const {t, k} = useLife();
  return (
    <>
      {[-1000, 0, 1000].map((x, i) => (
        <Glow key={x} x={x} y={F + 800} z={-93} size={520} sy={0.35} color="#FFF1D6" intensity={0.25 * (1 - k + k * flicker(t, i, 0.06, i === 1))} />
      ))}
    </>
  );
};

const Bathroom: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} lowerBand="#7FA3A8" floorLines="tiles" />
    <SkyWindow x={-900} y={F + 620} w={180} h={150} m={m} />
    <group position={[880, F + 380, -96]}>
      <Rect w={240} h={10} color="#C9CFC8" />
      {[-70, 0, 70].map((x, i) => (
        <Sway key={i} x={x} y={0} z={0.1} amp={0.035} speed={0.17} seed={i * 1.1}>
          <Rect w={60} h={160} y={-80} color={['#C9826B', '#3E7C7A', '#D9B26A'][i]} />
        </Sway>
      ))}
    </group>
    <Plant x={-1150} s={0.7} />
  </group>
);

const Gym: React.FC<{m: MoodSet}> = ({m}) => (
  <group>
    <Shell m={m} floorLines="planks" />
    {Array.from({length: 16}, (_, i) => <Rect key={i} w={180} h={300} x={-1500 + i * 200} y={F + 170} z={-98} color={i % 2 ? '#3E5B74' : '#2F4A6B'} />)}
    {[-700, 0, 700].map((x, i) => (
      <Sway key={x} x={x} y={F + 735} z={-96} amp={0.035} speed={0.16} seed={i * 2.1}>
        <Rect w={260} h={70} y={-35} color={['#8C3B32', '#E2B45A', '#3E7C7A'][i]} />
        <Rect w={180} h={12} y={-35} z={0.1} color="#FFFFFF" opacity={0.8} />
      </Sway>
    ))}
    <Clock x={1150} y={F + 640} />
  </group>
);

const StreetSky: React.FC<{m: MoodSet}> = ({m}) => {
  const {t, k} = useLife();
  if (m.night > 0.5)
    return (
      <>
        {Array.from({length: 40}, (_, i) => (
          <Flat key={i} shape={ellipse(2.5, 2.5)} color="#FFFFFF" opacity={0.35 + 0.35 * Math.sin(t * (1 + hash(i) * 1.5) * Math.max(0.2, k) + i)} position={[(hash(i + 3) - 0.5) * 4200, F + 500 + hash(i + 9) * 1100, -99.6]} />
        ))}
      </>
    );
  return (
    <>
      {Array.from({length: 6}, (_, i) => {
        const span = 5200;
        const cx = ((hash(i + 1) * span + t * (8 + 5 * hash(i + 2)) * k) % span) - span / 2;
        return <Flat key={i} shape={ellipse(170 + 90 * hash(i + 4), 46 + 20 * hash(i + 5))} color="#FFFFFF" opacity={0.55} position={[cx, F + 640 + hash(i + 6) * 300, -99.6]} />;
      })}
    </>
  );
};

const Street: React.FC<{m: MoodSet}> = ({m}) => {
  const {t, k} = useLife();
  return (
  <group>
    <GradientPlane w={4400} h={1700} y={F + 850} z={-100} top={m.skyTop} bottom={m.skyBottom} />
    <StreetSky m={m} />
    {Array.from({length: 18}, (_, i) => {
      const w = 160 + ((i * 37) % 120);
      const h = 260 + ((i * 53) % 420);
      const x = -2100 + i * 245;
      return (
        <group key={i} position={[x, F + h / 2, -99]}>
          <Rect w={w} h={h} color={m.night > 0.5 ? '#151B2E' : '#7088B0'} />
          {Array.from({length: Math.floor(h / 60)}, (_, r) =>
            Array.from({length: Math.floor(w / 50)}, (_, c) =>
              ((r * 7 + c * 3 + i) % 4 === 0) !== (k > 0 && hash(i * 31 + r * 7 + c * 3 + Math.floor(t / 3 + hash(i + r + c) * 3) * 0.37) > 0.9) ? (
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
};

export const Backdrop: React.FC<{loc: Loc; m: MoodSet}> = ({loc, m}) => (
  <group>
    <Place loc={loc} m={m} />
    {loc !== 'street' && loc !== 'none' && <Motes seed={loc.length} opacity={0.22 + 0.18 * m.night} />}
  </group>
);

const Place: React.FC<{loc: Loc; m: MoodSet}> = ({loc, m}) => {
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
