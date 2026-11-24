/**
 * Character + art-direction boards for the redesign (pick one, then it becomes the cast in both kits).
 *   npx remotion still src/index.ts DesignBoard out/_lookdev/redesign/A.png --props='{"option":"A"}'
 * A  LANTERN    - Mo's head is a paper lantern that glows with his mood (inked comic finish)
 * B  SKETCH     - Mo is drawn in pencil, a kid who walked out of his own sketchbook (graphite finish)
 * C  HOOD CREW  - bold mascot kids in animal-ear hoodies, thick ink, halftone shadows (pop-comic finish)
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAPTION_FONT} from '../kit3d/Captions';

const INK = '#111318';
type Opt = 'A' | 'B' | 'C';
type Mood = 'happy' | 'worried' | 'determined' | 'sad';

// ------------------------------------------------------------------ shared SVG defs (drawing effects)
const Defs: React.FC = () => (
  <defs>
    {/* hand-drawn wobble on lines */}
    <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
    </filter>
    <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="5" result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="ga" />
      <feComposite in="SourceGraphic" in2="ga" operator="in" result="grain" />
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="9" result="w" />
      <feDisplacementMap in="grain" in2="w" scale="2.6" />
    </filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="2" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.10" /></feComponentTransfer></filter>
    <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="9" stroke={INK} strokeWidth="2.2" />
    </pattern>
    <pattern id="xhatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <path d="M0 0 V10 M0 0 H10" stroke={INK} strokeWidth="1.8" />
    </pattern>
    <pattern id="pencilhatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#55565C" strokeWidth="1.3" opacity="0.8" />
    </pattern>
    <pattern id="halftone" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx="6" cy="6" r="3.1" fill={INK} />
    </pattern>
    <pattern id="halftoneSm" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx="5" cy="5" r="1.8" fill="#FFFFFF" opacity="0.45" />
    </pattern>
    <radialGradient id="lanternGlow" cx="50%" cy="55%" r="60%">
      <stop offset="0%" stopColor="#FFF6D6" />
      <stop offset="55%" stopColor="#FFD58A" />
      <stop offset="100%" stopColor="#F2A24A" />
    </radialGradient>
    <radialGradient id="lanternDim" cx="50%" cy="55%" r="60%">
      <stop offset="0%" stopColor="#E8ECF4" />
      <stop offset="100%" stopColor="#9AA6BE" />
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFB547" stopOpacity="0.75" />
      <stop offset="100%" stopColor="#FFB547" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="haloBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#7FA0FF" stopOpacity="0.45" />
      <stop offset="100%" stopColor="#7FA0FF" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="nightA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0B1024" />
      <stop offset="100%" stopColor="#1B2350" />
    </linearGradient>
    <radialGradient id="popBg" cx="35%" cy="45%" r="80%">
      <stop offset="0%" stopColor="#2EC4B6" />
      <stop offset="55%" stopColor="#11698E" />
      <stop offset="100%" stopColor="#0A1B3D" />
    </radialGradient>
  </defs>
);

// ------------------------------------------------------------------ face pieces
const Eyes: React.FC<{mood: Mood; dx?: number; y?: number; size?: number; style: Opt}> = ({mood, dx = 42, y = 0, size = 1, style}) => {
  const ry = (style === 'C' ? 22 : 26) * size;
  const rx = (style === 'C' ? 18 : 17) * size;
  if (mood === 'happy')
    return (
      <g stroke={INK} strokeWidth={8 * size} fill="none" strokeLinecap="round">
        <path d={`M${-dx - 18 * size} ${y + 6} Q${-dx} ${y - 22 * size} ${-dx + 18 * size} ${y + 6}`} />
        <path d={`M${dx - 18 * size} ${y + 6} Q${dx} ${y - 22 * size} ${dx + 18 * size} ${y + 6}`} />
      </g>
    );
  const look = mood === 'sad' ? 6 : mood === 'worried' ? -3 : 0;
  return (
    <g>
      {[-dx, dx].map((x) => (
        <g key={x}>
          {style === 'C' ? (
            <>
              <ellipse cx={x} cy={y} rx={rx + 6} ry={ry + 4} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
              <ellipse cx={x + 3} cy={y + 4 + look} rx={rx * 0.62} ry={ry * 0.62} fill={INK} />
              <circle cx={x - 2} cy={y - 4 + look} r={5} fill="#FFFFFF" />
            </>
          ) : style === 'B' ? (
            <>
              <circle cx={x} cy={y} r={ry * 0.95} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
              <circle cx={x + 3} cy={y + 3 + look} r={ry * 0.48} fill={INK} />
              <path d={`M${x - 8} ${y + look} l14 6 M${x - 6} ${y + 8 + look} l12 -10`} stroke="#FFFFFF" strokeWidth={1.4} />
              <circle cx={x - 3} cy={y - 4 + look} r={4} fill="#FFFFFF" />
            </>
          ) : (
            <>
              <ellipse cx={x} cy={y + look} rx={rx} ry={ry} fill={INK} />
              <circle cx={x - 5} cy={y - 9 + look} r={6} fill="#FFFFFF" />
              <circle cx={x + 6} cy={y + 8 + look} r={2.6} fill="#FFFFFF" />
            </>
          )}
        </g>
      ))}
    </g>
  );
};
const Brows: React.FC<{mood: Mood; dx?: number; y: number; w?: number}> = ({mood, dx = 42, y, w = 9}) => {
  const tilt = mood === 'determined' ? 1 : mood === 'worried' || mood === 'sad' ? -1 : 0;
  return (
    <g stroke={INK} strokeWidth={w} strokeLinecap="round" fill="none">
      <path d={`M${-dx - 20} ${y - tilt * 9} Q${-dx} ${y - 12 - tilt * 2} ${-dx + 20} ${y + tilt * 9}`} />
      <path d={`M${dx - 20} ${y + tilt * 9} Q${dx} ${y - 12 - tilt * 2} ${dx + 20} ${y - tilt * 9}`} />
    </g>
  );
};
const Mouth: React.FC<{mood: Mood; y: number; s?: number; tongue?: boolean}> = ({mood, y, s = 1, tongue}) => {
  if (mood === 'happy')
    return (
      <g>
        <path d={`M${-26 * s} ${y} Q0 ${y + 36 * s} ${26 * s} ${y} Z`} fill={INK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {tongue && <path d={`M${-12 * s} ${y + 16 * s} Q0 ${y + 6 * s} ${12 * s} ${y + 16 * s} Q0 ${y + 28 * s} ${-12 * s} ${y + 16 * s}`} fill="#F07A7A" />}
      </g>
    );
  if (mood === 'determined') return <path d={`M${-20 * s} ${y + 6} L${20 * s} ${y + 2}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />;
  if (mood === 'sad') return <path d={`M${-18 * s} ${y + 12} Q0 ${y - 4} ${18 * s} ${y + 12}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  return <ellipse cx={0} cy={y + 8} rx={8 * s} ry={10 * s} fill={INK} />;
};

// ================================================================== A  LANTERN
const LanternHead: React.FC<{mood: Mood; color?: string; shape?: 'round' | 'tall' | 'small'; acc?: 'glasses' | 'buns' | 'cap'}> = ({mood, shape = 'round', acc}) => {
  const lit = mood !== 'sad';
  const w = shape === 'tall' ? 190 : shape === 'small' ? 190 : 236;
  const h = shape === 'tall' ? 230 : shape === 'small' ? 180 : 206;
  const glowK = mood === 'determined' ? 1.25 : mood === 'worried' ? 0.6 : 1;
  return (
    <g>
      <circle cx={0} cy={0} r={(w + 140) / 2} fill={lit ? 'url(#halo)' : 'url(#haloBlue)'} opacity={glowK} />
      {/* top cap + flame-curl (the hair) */}
      <path d={`M-6 ${-h / 2 - 12} C -30 ${-h / 2 - 52}, 26 ${-h / 2 - 60}, 8 ${-h / 2 - 96} C 30 ${-h / 2 - 70}, 34 ${-h / 2 - 38}, 10 ${-h / 2 - 12} Z`} fill={INK} />
      <rect x={-46} y={-h / 2 - 16} width={92} height={22} rx={8} fill={INK} />
      {/* lantern body */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.42} fill={lit ? 'url(#lanternGlow)' : 'url(#lanternDim)'} stroke={INK} strokeWidth={8} filter="url(#wobble)" />
      {/* ribs */}
      {[-0.62, -0.3, 0.3, 0.62].map((k) => (
        <path key={k} d={`M${(k * w) / 2} ${-h / 2 + 6} Q${k * w * 0.62} 0 ${(k * w) / 2} ${h / 2 - 6}`} stroke="#C9822F" strokeWidth={3} fill="none" opacity={0.55} />
      ))}
      {/* inked shadow on the dark side */}
      <path d={`M${w * 0.18} ${-h / 2 + 10} Q${w / 2 + 6} 0 ${w * 0.18} ${h / 2 - 10} Q${w * 0.42} 0 ${w * 0.18} ${-h / 2 + 10}`} fill="url(#hatch)" opacity={0.5} />
      <rect x={-56} y={h / 2 - 8} width={112} height={18} rx={7} fill={INK} />
      {/* face */}
      <g transform="translate(0,6)">
        <Brows mood={mood} y={-50} />
        <Eyes mood={mood} y={-8} style="A" />
        <ellipse cx={-74} cy={30} rx={20} ry={11} fill="#FF8A5B" opacity={lit ? 0.55 : 0.15} />
        <ellipse cx={74} cy={30} rx={20} ry={11} fill="#FF8A5B" opacity={lit ? 0.55 : 0.15} />
        <Mouth mood={mood} y={34} />
        {mood === 'sad' && <path d="M44 14 q6 18 0 30 q-8 -12 0 -30" fill="#7FB8FF" stroke={INK} strokeWidth={3} />}
      </g>
      {acc === 'glasses' && (
        <g fill="none" stroke={INK} strokeWidth={7}>
          <circle cx={-42} cy={-2} r={30} />
          <circle cx={42} cy={-2} r={30} />
          <path d="M-12 -4 Q0 -12 12 -4" />
        </g>
      )}
      {acc === 'buns' && (
        <g fill={INK}>
          <circle cx={-w / 2 + 10} cy={-h / 2 + 4} r={26} />
          <circle cx={w / 2 - 10} cy={-h / 2 + 4} r={26} />
        </g>
      )}
      {acc === 'cap' && <path d={`M${-w / 2 - 4} ${-h / 2 + 30} Q0 ${-h / 2 - 50} ${w / 2 + 4} ${-h / 2 + 30} L${w / 2 + 60} ${-h / 2 + 40} L${w / 2 + 4} ${-h / 2 + 50} Z`} fill="#2EC4B6" stroke={INK} strokeWidth={7} />}
    </g>
  );
};

const LanternBody: React.FC<{hoodie?: string; wave?: boolean}> = ({hoodie = '#1D2A55', wave}) => (
  <g filter="url(#wobble)">
    {/* legs + sneakers */}
    <path d="M-44 -70 L-50 -14 L-14 -14 L-12 -70 Z M12 -70 L14 -14 L50 -14 L44 -70 Z" fill="#141A33" stroke={INK} strokeWidth={6} />
    <path d="M-62 -16 Q-62 -34 -32 -32 L-6 -30 Q4 -10 -8 0 L-58 0 Q-70 -4 -62 -16 Z" fill="#F4F1EA" stroke={INK} strokeWidth={6} />
    <path d="M62 -16 Q62 -34 32 -32 L6 -30 Q-4 -10 8 0 L58 0 Q70 -4 62 -16 Z" fill="#F4F1EA" stroke={INK} strokeWidth={6} />
    <path d="M-50 -18 L-14 -18 M14 -18 L50 -18" stroke="#FFB547" strokeWidth={5} />
    {/* hoodie */}
    <path d="M-92 -200 Q-118 -120 -108 -64 Q0 -48 108 -64 Q118 -120 92 -200 Q0 -226 -92 -200 Z" fill={hoodie} stroke={INK} strokeWidth={8} />
    <path d="M30 -196 Q102 -150 100 -70 Q60 -60 36 -62 Q64 -130 30 -196 Z" fill="url(#xhatch)" opacity={0.55} />
    <path d="M-80 -206 Q0 -170 80 -206 Q0 -240 -80 -206 Z" fill="#2B3C78" stroke={INK} strokeWidth={6} />
    <path d="M-18 -190 L-24 -132 M18 -190 L24 -132" stroke="#FFB547" strokeWidth={6} strokeLinecap="round" />
    <circle cx={-24} cy={-128} r={6} fill="#FFB547" stroke={INK} strokeWidth={3} />
    <circle cx={24} cy={-128} r={6} fill="#FFB547" stroke={INK} strokeWidth={3} />
    <path d="M-58 -112 Q0 -122 58 -112 L52 -76 Q0 -70 -52 -76 Z" fill="none" stroke="#FFB547" strokeWidth={4} strokeDasharray="8 7" />
    {/* sleeves + mittens */}
    <path d="M-86 -192 Q-132 -150 -134 -96 L-104 -92 Q-100 -140 -70 -170 Z" fill={hoodie} stroke={INK} strokeWidth={7} />
    <circle cx={-120} cy={-84} r={22} fill="#FFE7BE" stroke={INK} strokeWidth={6} />
    {wave ? (
      <>
        <path d="M86 -192 Q136 -230 150 -282 L122 -292 Q110 -240 72 -170 Z" fill={hoodie} stroke={INK} strokeWidth={7} />
        <circle cx={140} cy={-300} r={23} fill="#FFE7BE" stroke={INK} strokeWidth={6} />
        <path d="M168 -330 q14 -8 22 4 M176 -300 q16 -2 20 12" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M86 -192 Q132 -150 134 -96 L104 -92 Q100 -140 70 -170 Z" fill={hoodie} stroke={INK} strokeWidth={7} />
        <circle cx={120} cy={-84} r={22} fill="#FFE7BE" stroke={INK} strokeWidth={6} />
      </>
    )}
  </g>
);

const LanternKid: React.FC<{x: number; y: number; s: number; mood?: Mood; hoodie?: string; shape?: 'round' | 'tall' | 'small'; acc?: 'glasses' | 'buns' | 'cap'; wave?: boolean}> = ({x, y, s, mood = 'happy', hoodie, shape, acc, wave}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={110} ry={16} fill="#000" opacity={0.35} />
    <LanternBody hoodie={hoodie} wave={wave} />
    <g transform="translate(0,-318)">
      <LanternHead mood={mood} shape={shape} acc={acc} />
    </g>
  </g>
);

const CrowdA: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#wobble)">
    <path d="M-92 -200 Q-118 -120 -108 -64 Q0 -48 108 -64 Q118 -120 92 -200 Q0 -226 -92 -200 Z" fill="#20232E" stroke={INK} strokeWidth={8} />
    <rect x={-118} y={-420} width={236} height={206} rx={99} fill="#2A2E3C" stroke={INK} strokeWidth={8} />
    <rect x={-70} y={-340} width={140} height={46} rx={14} fill="#FFB547" />
    <rect x={-70} y={-340} width={140} height={46} rx={14} fill="none" stroke="#FFE2A0" strokeWidth={4} />
  </g>
);

const BoardA: React.FC = () => (
  <g>
    <rect width={1920} height={1080} fill="url(#nightA)" />
    {/* window light shape + lamp pool (high contrast scene) */}
    <path d="M150 120 L520 120 L520 560 L150 560 Z" fill="#26357A" opacity={0.5} />
    <path d="M150 560 L520 560 L760 1080 L-60 1080 Z" fill="#3B4FA8" opacity={0.18} />
    <circle cx={250} cy={220} r={40} fill="#F4F1EA" />
    <rect width={1920} height={1080} fill="url(#xhatch)" opacity={0.06} />
    <ellipse cx={470} cy={760} rx={520} ry={330} fill="url(#halo)" opacity={0.55} />
    <LanternKid x={470} y={1010} s={1.62} mood="happy" wave />
    <BoardText opt="A" />
    {(['happy', 'worried', 'determined', 'sad'] as Mood[]).map((m, i) => (
      <g key={m} transform={`translate(${1040 + i * 220},460) scale(0.62)`}>
        <LanternHead mood={m} />
        <text x={0} y={190} textAnchor="middle" fill="#F4F1EA" fontSize={34} fontFamily={CAPTION_FONT} fontWeight={800}>{m}</text>
      </g>
    ))}
    <LanternKid x={1060} y={1030} s={0.62} mood="happy" hoodie="#3E7C5A" shape="tall" acc="glasses" />
    <LanternKid x={1250} y={1030} s={0.52} mood="happy" hoodie="#C8506E" shape="small" acc="buns" />
    <LanternKid x={1440} y={1030} s={0.62} mood="determined" hoodie="#6B3FA0" acc="cap" />
    <CrowdA x={1640} y={1030} s={0.6} />
    <CrowdA x={1790} y={1030} s={0.6} />
    <CastLabels labels={['Theo', 'Lia', 'Dex', 'the Crowd']} xs={[1060, 1250, 1440, 1715]} color="#F4F1EA" />
  </g>
);

// ================================================================== B  SKETCH
const SketchHead: React.FC<{mood: Mood; ink?: string; acc?: 'glasses' | 'buns' | 'cap' | 'pencil'; hair?: boolean}> = ({mood, ink = INK, acc = 'pencil', hair = true}) => (
  <g filter="url(#wobble)">
    {hair && (
      <path d="M-104 -30 Q-120 -110 -60 -128 Q-70 -160 -20 -150 Q0 -190 40 -150 Q86 -170 84 -122 Q130 -108 110 -40 Q80 -90 30 -96 Q-10 -70 -60 -96 Q-90 -70 -104 -30 Z" fill={ink} />
    )}
    <ellipse cx={0} cy={0} rx={112} ry={104} fill="#FBF8F0" stroke={ink} strokeWidth={6} />
    <path d="M50 -84 Q116 -30 92 52 Q60 92 30 100 Q86 40 50 -84 Z" fill="url(#pencilhatch)" />
    {hair && <path d="M-110 -20 Q-96 -98 -40 -104 Q-6 -70 30 -98 Q80 -96 110 -30 Q96 -70 60 -80 Q20 -56 -20 -80 Q-70 -72 -110 -20 Z" fill={ink} />}
    <path d="M-112 6 q-22 -6 -22 16 q0 22 24 18" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <path d="M112 6 q22 -6 22 16 q0 22 -24 18" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <g transform="translate(0,14)">
      <Brows mood={mood} y={-48} w={7} />
      <Eyes mood={mood} y={-8} style="B" />
      {[[-70, 30], [-58, 38], [-80, 40], [62, 34], [74, 28], [70, 42]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={3} fill={ink} opacity={0.7} />)}
      <Mouth mood={mood} y={36} s={0.9} />
      {mood === 'sad' && <path d="M40 12 q6 18 0 30 q-8 -12 0 -30" fill="#9CC7FF" stroke={ink} strokeWidth={3} />}
    </g>
    {acc === 'pencil' && (
      <g transform="translate(112,-58) rotate(-62)">
        <rect x={-12} y={-90} width={24} height={150} fill="#FFC531" stroke={ink} strokeWidth={5} />
        <path d="M-12 60 L0 92 L12 60 Z" fill="#F2D9B0" stroke={ink} strokeWidth={5} />
        <path d="M-4 82 L0 92 L4 82 Z" fill={ink} />
        <rect x={-12} y={-112} width={24} height={22} rx={5} fill="#F28C9A" stroke={ink} strokeWidth={5} />
        <rect x={-13} y={-92} width={26} height={8} fill="#B8B8C0" stroke={ink} strokeWidth={3} />
      </g>
    )}
    {acc === 'glasses' && (
      <g fill="none" stroke={ink} strokeWidth={6}>
        <rect x={-74} y={-30} width={64} height={48} rx={10} />
        <rect x={10} y={-30} width={64} height={48} rx={10} />
        <path d="M-10 -10 L10 -10" />
      </g>
    )}
    {acc === 'buns' && (
      <g fill={ink}>
        <circle cx={-86} cy={-92} r={30} />
        <circle cx={86} cy={-92} r={30} />
      </g>
    )}
    {acc === 'cap' && <path d="M-112 -44 Q0 -150 112 -44 L170 -40 L112 -24 Q0 -70 -112 -24 Z" fill={ink} />}
  </g>
);

const SketchBody: React.FC<{ink?: string; wave?: boolean; jeans?: string}> = ({ink = INK, wave, jeans = '#3557A8'}) => (
  <g filter="url(#wobble)">
    <path d="M-46 -72 L-50 -16 L-12 -16 L-10 -72 Z M10 -72 L12 -16 L50 -16 L46 -72 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <path d="M-46 -72 L-50 -16 L-12 -16 L-10 -72 Z M10 -72 L12 -16 L50 -16 L46 -72 Z" fill="url(#pencilhatch)" />
    <path d="M-46 -70 L-12 -20 M-40 -70 L-14 -36 M12 -70 L44 -22 M20 -70 L46 -40" stroke={jeans} strokeWidth={3} opacity={0.8} />
    <path d="M-66 -16 Q-66 -36 -32 -32 L-6 -30 Q2 -10 -8 0 L-60 0 Q-72 -4 -66 -16 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <path d="M66 -16 Q66 -36 32 -32 L6 -30 Q-2 -10 8 0 L60 0 Q72 -4 66 -16 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <path d="M-90 -196 Q-120 -120 -104 -66 Q0 -52 104 -66 Q120 -120 90 -196 Q0 -220 -90 -196 Z" fill="#FBF8F0" stroke={ink} strokeWidth={6} />
    <path d="M26 -192 Q100 -150 98 -72 Q60 -62 34 -64 Q62 -130 26 -192 Z" fill="url(#pencilhatch)" />
    {/* doodles + ink smudge on the hoodie */}
    <path d="M-46 -150 l8 -16 l8 16 l-18 -10 h20 Z" fill="none" stroke={ink} strokeWidth={3} />
    <path d="M30 -110 q10 -10 18 0 q-6 14 -18 6 q-4 -10 6 -14" fill="none" stroke={ink} strokeWidth={3} />
    <ellipse cx={-30} cy={-92} rx={16} ry={9} fill={ink} opacity={0.35} />
    <path d="M-16 -188 L-20 -140 M16 -188 L20 -140" stroke={ink} strokeWidth={4} strokeLinecap="round" />
    <path d="M-84 -186 Q-126 -150 -128 -100 L-100 -96 Q-98 -140 -66 -168 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    <path d="M-128 -108 L-100 -104" stroke={ink} strokeWidth={4} />
    <path d="M-132 -96 q-12 22 8 28 q14 4 22 -8 q8 -14 -4 -24 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
    {wave ? (
      <>
        <path d="M84 -186 Q136 -226 146 -280 L118 -288 Q108 -236 66 -168 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
        <path d="M120 -296 q-8 -28 14 -34 q10 -14 22 0 q16 0 12 18 q8 16 -12 22 q-24 8 -36 -6 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
      </>
    ) : (
      <>
        <path d="M84 -186 Q126 -150 128 -100 L100 -96 Q98 -140 66 -168 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
        <path d="M132 -96 q12 22 -8 28 q-14 4 -22 -8 q-8 -14 4 -24 Z" fill="#FBF8F0" stroke={ink} strokeWidth={5} />
      </>
    )}
  </g>
);

const SketchKid: React.FC<{x: number; y: number; s: number; mood?: Mood; ink?: string; acc?: 'glasses' | 'buns' | 'cap' | 'pencil'; wave?: boolean; jeans?: string}> = ({x, y, s, mood = 'happy', ink, acc, wave, jeans}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={100} ry={14} fill="url(#pencilhatch)" opacity={0.8} />
    <SketchBody ink={ink} wave={wave} jeans={jeans} />
    <g transform="translate(0,-318)">
      <SketchHead mood={mood} ink={ink} acc={acc} />
    </g>
  </g>
);

const BoardB: React.FC = () => (
  <g>
    <rect width={1920} height={1080} fill="#F3EBDA" />
    {Array.from({length: 48}, (_, i) => <line key={i} x1={0} x2={1920} y1={i * 24} y2={i * 24} stroke="#9CC0E6" strokeWidth={1.2} opacity={0.55} />)}
    <line x1={110} x2={110} y1={0} y2={1080} stroke="#E58C8A" strokeWidth={2} opacity={0.7} />
    {Array.from({length: 22}, (_, i) => <circle key={i} cx={40} cy={30 + i * 49} r={11} fill="#3A3A40" opacity={0.8} />)}
    <circle cx={760} cy={330} r={120} fill="none" stroke="#B07A4A" strokeWidth={14} opacity={0.18} />
    <rect width={1920} height={1080} filter="url(#paper)" />
    {/* the page he was drawing on: he stepped out of it */}
    <path d="M200 860 Q480 830 760 870" stroke={INK} strokeWidth={4} fill="none" filter="url(#wobble)" opacity={0.6} />
    <SketchKid x={470} y={1000} s={1.62} mood="happy" wave />
    <BoardText opt="B" dark />
    {(['happy', 'worried', 'determined', 'sad'] as Mood[]).map((m, i) => (
      <g key={m} transform={`translate(${1040 + i * 220},460) scale(0.66)`}>
        <SketchHead mood={m} />
        <text x={0} y={180} textAnchor="middle" fill={INK} fontSize={32} fontFamily={CAPTION_FONT} fontWeight={800}>{m}</text>
      </g>
    ))}
    <SketchKid x={1060} y={1030} s={0.62} mood="happy" ink="#1F4FBF" acc="glasses" jeans="#1F4FBF" />
    <SketchKid x={1250} y={1030} s={0.52} mood="happy" ink="#C2306A" acc="buns" jeans="#C2306A" />
    <SketchKid x={1440} y={1030} s={0.62} mood="determined" ink="#1E8A5A" acc="cap" jeans="#1E8A5A" />
    <g opacity={0.85}>
      <SketchKid x={1640} y={1030} s={0.6} mood="worried" ink="#55565C" acc="glasses" />
      <SketchKid x={1790} y={1030} s={0.6} mood="worried" ink="#55565C" acc="cap" />
    </g>
    <CastLabels labels={['Theo (ballpoint)', 'Lia (crayon)', 'Dex (marker)', 'the Crowd (charcoal)']} xs={[1060, 1250, 1440, 1715]} color={INK} />
  </g>
);

// ================================================================== C  HOOD CREW
const HoodHead: React.FC<{mood: Mood; hood: string; ears: 'bear' | 'owl' | 'bunny' | 'fin' | 'none'; acc?: 'glasses'; dark?: boolean}> = ({mood, hood, ears, acc, dark}) => (
  <g>
    {/* ears */}
    {ears === 'bear' && [-92, 92].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-112} r={44} fill={hood} stroke={INK} strokeWidth={9} />
        <circle cx={x} cy={-112} r={22} fill="#FFD9A8" stroke={INK} strokeWidth={5} />
      </g>
    ))}
    {ears === 'owl' && [-70, 70].map((x) => <path key={x} d={`M${x - 40} -110 L${x + (x < 0 ? -18 : 18)} -176 L${x + 40} -110 Z`} fill={hood} stroke={INK} strokeWidth={9} strokeLinejoin="round" />)}
    {ears === 'bunny' && [-48, 48].map((x) => (
      <g key={x} transform={`rotate(${x < 0 ? -12 : 12} ${x} -120)`}>
        <ellipse cx={x} cy={-196} rx={30} ry={86} fill={hood} stroke={INK} strokeWidth={9} />
        <ellipse cx={x} cy={-190} rx={13} ry={60} fill="#FFD0DA" />
      </g>
    ))}
    {ears === 'fin' && <path d="M-10 -150 Q40 -250 70 -140 Z" fill={hood} stroke={INK} strokeWidth={9} strokeLinejoin="round" />}
    {/* hood + face */}
    <circle cx={0} cy={0} r={150} fill={hood} stroke={INK} strokeWidth={10} />
    <path d="M60 -130 Q170 -40 110 100 Q150 0 60 -130 Z" fill="url(#halftone)" opacity={0.45} />
    <ellipse cx={0} cy={16} rx={108} ry={102} fill={dark ? '#2A2E3C' : '#FFE2C4'} stroke={INK} strokeWidth={8} />
    {!dark && <path d="M40 -76 Q118 -10 84 82 Q100 0 40 -76 Z" fill="#F4B98C" />}
    {!dark && <path d="M-100 -26 Q-90 -100 -10 -96 Q-30 -60 40 -92 Q20 -40 -40 -50 Q-70 -46 -100 -26 Z" fill={INK} />}
    {dark ? (
      <rect x={-56} y={-6} width={112} height={40} rx={12} fill="#FFB547" />
    ) : (
      <g transform="translate(0,24)">
        <Brows mood={mood} y={-50} w={10} />
        <Eyes mood={mood} y={-8} style="C" dx={40} />
        <ellipse cx={-70} cy={34} rx={18} ry={10} fill="#FF6E6E" opacity={0.5} />
        <ellipse cx={70} cy={34} rx={18} ry={10} fill="#FF6E6E" opacity={0.5} />
        <Mouth mood={mood} y={34} tongue />
        {mood === 'sad' && <path d="M44 10 q6 18 0 30 q-8 -12 0 -30" fill="#7FD0FF" stroke={INK} strokeWidth={3} />}
      </g>
    )}
    {acc === 'glasses' && (
      <g fill="#FFFFFF" fillOpacity={0.25} stroke={INK} strokeWidth={8}>
        <circle cx={-40} cy={18} r={32} />
        <circle cx={40} cy={18} r={32} />
      </g>
    )}
  </g>
);

const HoodBody: React.FC<{hood: string; pants?: string; shoes?: string; wave?: boolean; dark?: boolean}> = ({hood, pants = '#1D2A55', shoes = '#2EC4B6', wave, dark}) => (
  <g>
    <path d="M-50 -74 L-54 -18 L-12 -18 L-10 -74 Z M10 -74 L12 -18 L54 -18 L50 -74 Z" fill={pants} stroke={INK} strokeWidth={8} />
    <path d="M-72 -18 Q-72 -44 -32 -40 L-2 -36 Q8 -10 -6 2 L-64 2 Q-80 -4 -72 -18 Z" fill={dark ? '#2A2E3C' : shoes} stroke={INK} strokeWidth={8} />
    <path d="M72 -18 Q72 -44 32 -40 L2 -36 Q-8 -10 6 2 L64 2 Q80 -4 72 -18 Z" fill={dark ? '#2A2E3C' : shoes} stroke={INK} strokeWidth={8} />
    <path d="M-70 -6 H-8 M8 -6 H70" stroke="#FFFFFF" strokeWidth={6} />
    <path d="M-96 -206 Q-128 -124 -112 -66 Q0 -46 112 -66 Q128 -124 96 -206 Q0 -232 -96 -206 Z" fill={hood} stroke={INK} strokeWidth={10} />
    <path d="M28 -200 Q110 -150 108 -72 Q70 -60 40 -62 Q70 -130 28 -200 Z" fill="url(#halftone)" opacity={0.45} />
    <path d="M-64 -120 Q0 -132 64 -120 L58 -78 Q0 -70 -58 -78 Z" fill={hood} stroke={INK} strokeWidth={7} />
    {!dark && <rect x={20} y={-150} width={14} height={50} rx={3} fill="#FFC531" stroke={INK} strokeWidth={4} transform="rotate(14 27 -125)" />}
    <path d="M-88 -196 Q-136 -150 -138 -96 L-106 -92 Q-104 -140 -70 -172 Z" fill={hood} stroke={INK} strokeWidth={9} />
    <circle cx={-124} cy={-82} r={24} fill={dark ? '#2A2E3C' : '#FFE2C4'} stroke={INK} strokeWidth={8} />
    {wave ? (
      <>
        <path d="M88 -196 Q140 -236 152 -290 L120 -300 Q110 -246 70 -172 Z" fill={hood} stroke={INK} strokeWidth={9} />
        <circle cx={140} cy={-310} r={25} fill="#FFE2C4" stroke={INK} strokeWidth={8} />
        <path d="M170 -344 q16 -8 24 6 M180 -310 q18 -2 22 14" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M88 -196 Q136 -150 138 -96 L106 -92 Q104 -140 70 -172 Z" fill={hood} stroke={INK} strokeWidth={9} />
        <circle cx={124} cy={-82} r={24} fill={dark ? '#2A2E3C' : '#FFE2C4'} stroke={INK} strokeWidth={8} />
      </>
    )}
  </g>
);

const HoodKid: React.FC<{x: number; y: number; s: number; mood?: Mood; hood: string; ears: 'bear' | 'owl' | 'bunny' | 'fin' | 'none'; acc?: 'glasses'; wave?: boolean; dark?: boolean; shoes?: string}> = ({x, y, s, mood = 'happy', hood, ears, acc, wave, dark, shoes}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={118} ry={18} fill="#000" opacity={0.4} />
    <HoodBody hood={hood} wave={wave} dark={dark} shoes={shoes} />
    <g transform="translate(0,-340)">
      <HoodHead mood={mood} hood={hood} ears={ears} acc={acc} dark={dark} />
    </g>
  </g>
);

const BoardC: React.FC = () => (
  <g>
    <rect width={1920} height={1080} fill="url(#popBg)" />
    {Array.from({length: 18}, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      return <path key={i} d={`M470 620 L${470 + Math.cos(a) * 1600} ${620 + Math.sin(a) * 1600} L${470 + Math.cos(a + 0.12) * 1600} ${620 + Math.sin(a + 0.12) * 1600} Z`} fill="#FFFFFF" opacity={0.05} />;
    })}
    <rect width={1920} height={1080} fill="url(#halftoneSm)" opacity={0.35} />
    <HoodKid x={470} y={1010} s={1.5} mood="happy" hood="#F28C28" ears="bear" wave />
    <BoardText opt="C" />
    {(['happy', 'worried', 'determined', 'sad'] as Mood[]).map((m, i) => (
      <g key={m} transform={`translate(${1040 + i * 220},470) scale(0.56)`}>
        <HoodHead mood={m} hood="#F28C28" ears="bear" />
        <text x={0} y={210} textAnchor="middle" fill="#FFFFFF" fontSize={36} fontFamily={CAPTION_FONT} fontWeight={800}>{m}</text>
      </g>
    ))}
    <HoodKid x={1060} y={1030} s={0.56} mood="happy" hood="#3FA796" ears="owl" acc="glasses" shoes="#F28C28" />
    <HoodKid x={1250} y={1030} s={0.48} mood="happy" hood="#F27BA8" ears="bunny" shoes="#FFFFFF" />
    <HoodKid x={1440} y={1030} s={0.56} mood="determined" hood="#4F7BEF" ears="fin" shoes="#FFC531" />
    <HoodKid x={1640} y={1030} s={0.54} hood="#3A3F52" ears="none" dark />
    <HoodKid x={1790} y={1030} s={0.54} hood="#3A3F52" ears="none" dark />
    <CastLabels labels={['Theo (owl)', 'Lia (bunny)', 'Dex (shark)', 'the Crowd']} xs={[1060, 1250, 1440, 1715]} color="#FFFFFF" />
  </g>
);

// ------------------------------------------------------------------ text
const INFO: Record<Opt, {name: string; tag: string; bullets: string[]}> = {
  A: {
    name: 'A · LANTERN MO',
    tag: "His head is a paper lantern. It glows with his mood.",
    bullets: [
      'Recognisable: a glowing lantern head with a flame-curl',
      'Story tool: bright = inspired, dim blue = sad. The light IS the emotion',
      'Finish: inked comic, cross-hatched shadows, navy night + amber glow',
      'Lively: the glow pulses on beats, the curl flickers, sleeves swing',
    ],
  },
  B: {
    name: 'B · SKETCH MO',
    tag: 'A kid who walked out of his own sketchbook.',
    bullets: [
      'Recognisable: messy ink hair, a pencil behind his ear',
      'Story tool: each kid is drawn in a different medium',
      'Finish: graphite and paper. Boiling pencil lines, hatching, one yellow accent',
      'Lively: lines "boil" like hand-drawn animation',
    ],
  },
  C: {
    name: 'C · HOOD CREW',
    tag: 'Bold mascot kids in animal-ear hoodies.',
    bullets: [
      'Recognisable: Mo in an orange BEAR-ear hoodie. Readable as a 40 px icon',
      'Story tool: each kid has a hood animal; the crowd has none',
      'Finish: pop-comic, thick ink, halftone shadows, max contrast',
      'Lively: squash and stretch, ears bounce, big readable expressions',
    ],
  },
};

const BoardText: React.FC<{opt: Opt; dark?: boolean}> = ({opt, dark}) => {
  const c = dark ? INK : '#FFFFFF';
  const i = INFO[opt];
  return (
    <g fontFamily={CAPTION_FONT}>
      <text x={980} y={92} fill={opt === 'B' ? '#C47A12' : '#FFB547'} fontSize={64} fontWeight={800}>{i.name}</text>
      <text x={980} y={146} fill={c} fontSize={34} fontWeight={800}>{i.tag}</text>
      {i.bullets.map((b, k) => (
        <text key={k} x={1000} y={202 + k * 40} fill={c} fontSize={26} fontWeight={600} opacity={0.92}>• {b}</text>
      ))}
    </g>
  );
};
const CastLabels: React.FC<{labels: string[]; xs: number[]; color: string}> = ({labels, xs, color}) => (
  <g fontFamily={CAPTION_FONT} fontWeight={800} fontSize={22} fill={color} textAnchor="middle">
    {labels.map((l, i) => <text key={l} x={xs[i]} y={1066}>{l}</text>)}
  </g>
);

export const DesignBoard: React.FC<{option?: Opt}> = ({option = 'A'}) => (
  <AbsoluteFill>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <Defs />
      {option === 'A' && <BoardA />}
      {option === 'B' && <BoardB />}
      {option === 'C' && <BoardC />}
    </svg>
  </AbsoluteFill>
);
