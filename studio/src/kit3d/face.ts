/**
 * The drawn face. Painted on a 512x512 canvas mapped over the head front (u = screen left->right, v = up).
 * Our identity (tall glossy black oval eyes, one brow line) + RicksClips' readable cartoon acting
 * (big shapes, white catch-light, sweat drop, blush, tears, anger marks).
 */
export type Mood =
  | 'neutral' | 'happy' | 'laugh' | 'shock' | 'sad' | 'smirk' | 'tired' | 'fake' | 'angry' | 'determined'
  | 'cry' | 'worried' | 'content';

export type FaceState = {
  mood?: Mood;
  lookX?: number; // -1..1 pupils / eye shift
  lookY?: number;
  blink?: number; // 0 open .. 1 closed
  talk?: number; // 0..1 mouth open (lip flap)
  sweat?: boolean;
  blush?: number;
  tears?: number; // 0..1 tear length
  eyeScale?: number;
};

const INK = '#14161C';

export const drawFace = (ctx: CanvasRenderingContext2D, f: FaceState) => {
  const S = ctx.canvas.width;
  ctx.clearRect(0, 0, S, S);
  const mood = f.mood ?? 'neutral';
  const lx = (f.lookX ?? 0) * 0.035 * S;
  const ly = -(f.lookY ?? 0) * 0.03 * S;
  const blink = Math.min(1, Math.max(0, f.blink ?? 0));
  const es = f.eyeScale ?? 1;
  const cx = S / 2 + lx;
  const eyeY = S * 0.43 + ly;
  const gap = S * 0.135;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ---------------------------------------------------------------- blush
  const blush = f.blush ?? (mood === 'happy' || mood === 'laugh' || mood === 'content' ? 0.35 : 0);
  if (blush > 0) {
    ctx.fillStyle = `rgba(232,120,110,${0.55 * blush})`;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + s * gap * 1.55, eyeY + S * 0.12, S * 0.07, S * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------- eyes
  const ew = S * 0.052 * es;
  const eh = S * 0.095 * es;
  for (const s of [-1, 1]) {
    const x = cx + s * gap;
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    if (mood === 'laugh' || (mood === 'happy' && blink < 0.5) || mood === 'content') {
      // closed happy arcs ^ ^
      ctx.lineWidth = S * 0.028;
      ctx.beginPath();
      ctx.arc(x, eyeY + eh * 0.35, ew * 1.25, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      continue;
    }
    let h = eh * (1 - blink * 0.92);
    let yOff = 0;
    if (mood === 'tired') {
      h *= 0.55;
      yOff = eh * 0.25;
    }
    if (mood === 'shock') h *= 1.15;
    if (blink > 0.85) {
      ctx.lineWidth = S * 0.024;
      ctx.beginPath();
      ctx.moveTo(x - ew, eyeY + yOff);
      ctx.lineTo(x + ew, eyeY + yOff);
      ctx.stroke();
      continue;
    }
    if (mood === 'shock') {
      // white sclera ring + small pupil (RicksClips' "O O" shock)
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = S * 0.018;
      ctx.beginPath();
      ctx.ellipse(x, eyeY, ew * 1.9, h * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x + lx * 0.3, eyeY + ly * 0.3, ew * 0.55, ew * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.ellipse(x, eyeY + yOff, ew, h, 0, 0, Math.PI * 2);
    ctx.fill();
    // glossy catch-lights
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.ellipse(x - ew * 0.35, eyeY + yOff - h * 0.45, ew * 0.32, Math.min(h * 0.22, ew * 0.42), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(x + ew * 0.35, eyeY + yOff + h * 0.4, ew * 0.14, 0, Math.PI * 2);
    ctx.fill();
    if (mood === 'tired') {
      // heavy lids
      ctx.strokeStyle = INK;
      ctx.lineWidth = S * 0.02;
      ctx.beginPath();
      ctx.moveTo(x - ew * 1.4, eyeY + yOff - h * 0.9);
      ctx.lineTo(x + ew * 1.4, eyeY + yOff - h * 0.9);
      ctx.stroke();
      ctx.lineWidth = S * 0.008;
      ctx.beginPath();
      ctx.arc(x, eyeY + yOff + h * 1.6, ew * 1.1, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------- brows
  ctx.strokeStyle = INK;
  ctx.lineWidth = S * 0.026;
  const by = eyeY - eh - S * 0.05;
  // [inner y offset, outer y offset] in units of S; negative = up
  const B: Record<string, [number, number]> = {
    neutral: [0, 0], happy: [-0.015, 0], laugh: [-0.02, 0], shock: [-0.06, -0.05], sad: [-0.045, 0.015],
    smirk: [0, -0.02], tired: [0.012, 0.012], fake: [-0.03, 0], angry: [0.04, -0.03], determined: [0.025, -0.015],
    cry: [-0.05, 0.02], worried: [-0.05, 0.005], content: [-0.01, 0],
  };
  const [bi, bo] = B[mood] ?? [0, 0];
  for (const s of [-1, 1]) {
    const x = cx + s * gap;
    const skew = mood === 'smirk' && s > 0 ? -0.025 : 0;
    ctx.beginPath();
    ctx.moveTo(x - s * S * 0.04, by + (bi + skew) * S);
    ctx.quadraticCurveTo(x + s * S * 0.0, by - S * 0.012 + ((bi + bo) / 2 + skew) * S, x + s * S * 0.055, by + (bo + skew) * S);
    ctx.stroke();
  }

  // ---------------------------------------------------------------- mouth
  const my = S * 0.66 + ly * 0.5;
  const mx = cx;
  const talk = Math.min(1, Math.max(0, f.talk ?? 0));
  ctx.lineWidth = S * 0.022;
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  const open = (w: number, h: number, smile = 0.4) => {
    ctx.beginPath();
    ctx.moveTo(mx - w, my - h * 0.1);
    ctx.quadraticCurveTo(mx, my - h * 0.1 - smile * h * 0.4, mx + w, my - h * 0.1);
    ctx.quadraticCurveTo(mx + w * 0.7, my + h, mx, my + h);
    ctx.quadraticCurveTo(mx - w * 0.7, my + h, mx - w, my - h * 0.1);
    ctx.fill();
    // tongue
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#C8605A';
    ctx.beginPath();
    ctx.ellipse(mx, my + h * 0.95, w * 0.55, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  switch (mood) {
    case 'laugh':
      open(S * 0.1, S * 0.11 + talk * S * 0.02, 1);
      break;
    case 'happy':
    case 'content':
      if (talk > 0.15) open(S * 0.075, S * 0.05 + talk * S * 0.05, 1);
      else {
        ctx.beginPath();
        ctx.arc(mx, my - S * 0.04, S * 0.07, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
      break;
    case 'shock':
      ctx.beginPath();
      ctx.ellipse(mx, my + S * 0.01, S * 0.035 + talk * S * 0.01, S * 0.05 + talk * S * 0.02, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'sad':
    case 'cry':
    case 'worried':
      if (talk > 0.15) open(S * 0.06, S * 0.04 + talk * S * 0.04, -1);
      else {
        ctx.beginPath();
        ctx.arc(mx, my + S * 0.05, S * 0.055, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      }
      break;
    case 'smirk':
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.05, my);
      ctx.quadraticCurveTo(mx + S * 0.02, my + S * 0.02, mx + S * 0.07, my - S * 0.035);
      ctx.stroke();
      break;
    case 'fake':
      // too-wide forced grin with teeth
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.11, my - S * 0.02);
      ctx.quadraticCurveTo(mx, my + S * 0.09, mx + S * 0.11, my - S * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = S * 0.008;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(mx + k * S * 0.035, my - S * 0.015);
        ctx.lineTo(mx + k * S * 0.035, my + S * 0.035 - Math.abs(k) * S * 0.008);
        ctx.stroke();
      }
      break;
    case 'angry':
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.06, my + S * 0.02);
      ctx.quadraticCurveTo(mx, my - S * 0.025, mx + S * 0.06, my + S * 0.02);
      ctx.stroke();
      break;
    case 'determined':
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.05, my);
      ctx.lineTo(mx + S * 0.05, my - S * 0.005);
      ctx.stroke();
      break;
    case 'tired':
      ctx.beginPath();
      ctx.moveTo(mx - S * 0.035, my + S * 0.01);
      ctx.lineTo(mx + S * 0.035, my + S * 0.01);
      ctx.stroke();
      break;
    default:
      if (talk > 0.15) open(S * 0.055, S * 0.03 + talk * S * 0.05, 0.3);
      else {
        ctx.beginPath();
        ctx.moveTo(mx - S * 0.04, my);
        ctx.quadraticCurveTo(mx, my + S * 0.012, mx + S * 0.04, my);
        ctx.stroke();
      }
  }

  // ---------------------------------------------------------------- extras
  const tears = f.tears ?? (mood === 'cry' ? 1 : 0);
  if (tears > 0) {
    ctx.fillStyle = 'rgba(120,180,255,0.9)';
    ctx.strokeStyle = 'rgba(30,60,120,0.9)';
    ctx.lineWidth = S * 0.006;
    for (const s of [-1, 1]) {
      const x = cx + s * gap + s * S * 0.01;
      ctx.beginPath();
      ctx.moveTo(x - S * 0.012, eyeY + eh * 0.8);
      ctx.lineTo(x - S * 0.016, eyeY + eh * 0.8 + tears * S * 0.2);
      ctx.quadraticCurveTo(x, eyeY + eh * 0.8 + tears * S * 0.24, x + S * 0.016, eyeY + eh * 0.8 + tears * S * 0.2);
      ctx.lineTo(x + S * 0.012, eyeY + eh * 0.8);
      ctx.fill();
      ctx.stroke();
    }
  }
  if (f.sweat) {
    const x = S * 0.82;
    const y = S * 0.2;
    ctx.fillStyle = '#8FD0FF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = S * 0.01;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + S * 0.05, y + S * 0.07, x, y + S * 0.09);
    ctx.quadraticCurveTo(x - S * 0.05, y + S * 0.07, x, y);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x - S * 0.01, y + S * 0.06, S * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === 'angry') {
    // cross-popping vein mark
    ctx.strokeStyle = '#C8402F';
    ctx.lineWidth = S * 0.014;
    const x = S * 0.78;
    const y = S * 0.2;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      ctx.beginPath();
      ctx.moveTo(x + a * S * 0.015, y + b * S * 0.015);
      ctx.quadraticCurveTo(x + a * S * 0.02, y + b * S * 0.05, x + a * S * 0.05, y + b * S * 0.045);
      ctx.stroke();
    }
  }
};
