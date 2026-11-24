/**
 * THE FACE (v2): simple characters, rich faces. The expressions carry the emotion (RicksClips study:
 * small eyes, lids, thick tilted brows, asymmetric mouths, teeth, side-glances, sweat/blush/tears).
 *
 * Painted on a square canvas mapped over the head front (u = screen left->right, v = top->bottom).
 * Used by the 3D kit (Character face shell) and the flat kit (Person/Hero face plane).
 *
 *   drawFace(ctx, {mood: 'smug', lookX: 0.6, talk: 0.4, blink})        // presets
 *   drawFace(ctx, {mood: 'neutral', eyes: 'lidded', lid: 0.5, browL: -15, mouth: 'smirk'})  // parts
 */

export type Mood =
  // calm / dry humour
  | 'neutral' | 'deadpan' | 'smug' | 'smirk' | 'sideeye' | 'unimpressed' | 'bored' | 'suspicious' | 'thinking'
  // happy
  | 'happy' | 'grin' | 'laugh' | 'proud' | 'excited' | 'love' | 'content' | 'relieved'
  // shock / fear
  | 'shock' | 'panic' | 'scared' | 'worried' | 'nervous' | 'embarrassed' | 'confused' | 'dizzy'
  // sad
  | 'sad' | 'cry' | 'sob' | 'tired' | 'gloom'
  // anger / drive
  | 'angry' | 'furious' | 'determined' | 'focused' | 'disgusted'
  // legacy names
  | 'fake';

export type EyeStyle = 'dot' | 'lidded' | 'open' | 'shock' | 'happy' | 'closed' | 'angry' | 'sparkle' | 'heart' | 'spiral' | 'squint' | 'wide';
export type MouthStyle = 'line' | 'smile' | 'frown' | 'smirk' | 'o' | 'open' | 'grin' | 'grimace' | 'wavy' | 'scream' | 'pout' | 'tongue' | 'none';

export type FaceState = {
  mood?: Mood;
  lookX?: number; // -1..1 pupils (screen left/right)
  lookY?: number; // -1..1 (up = +)
  blink?: number; // 0 open .. 1 closed
  talk?: number; // 0..1 lip flap (opens the mouth)
  // effects (presets switch some on; these override)
  sweat?: boolean | number;
  blush?: number;
  tears?: number;
  vein?: boolean;
  gloom?: number;
  eyeScale?: number;
  // part overrides
  eyes?: EyeStyle;
  lid?: number; // 0..1 upper lid for 'lidded'
  browL?: number; // degrees, + = inner end down (angry), - = inner end up (sad)
  browR?: number;
  browY?: number; // raise (+) / lower (-) in face units
  mouth?: MouthStyle;
  mouthX?: number; // shift (face units)
  mouthW?: number; // width multiplier
  wink?: 'L' | 'R';
  /** overall feature size (1.55 default) */
  featureScale?: number;
};

type Spec = Required<Pick<FaceState, 'eyes' | 'mouth'>> & Partial<FaceState> & {lidTilt?: number; smile?: number};

const P: Record<Mood, Spec> = {
  neutral: {eyes: 'dot', mouth: 'line', smile: 0.15},
  deadpan: {eyes: 'lidded', lid: 0.5, mouth: 'line', smile: 0, browL: 3, browR: 3, browY: -1.5},
  smug: {eyes: 'lidded', lid: 0.55, lidTilt: -6, mouth: 'smirk', mouthX: 3, browL: -6, browR: 10, browY: 1},
  smirk: {eyes: 'dot', mouth: 'smirk', mouthX: 3, browL: -4, browR: 14, browY: 1.5},
  sideeye: {eyes: 'lidded', lid: 0.45, lookX: 0.9, mouth: 'line', smile: -0.1, mouthX: -2, browL: 8, browR: -4},
  unimpressed: {eyes: 'lidded', lid: 0.62, mouth: 'line', smile: -0.25, mouthW: 0.8, browL: 2, browR: 2, browY: -2},
  bored: {eyes: 'lidded', lid: 0.7, lookY: -0.3, mouth: 'line', smile: -0.15, mouthW: 0.7, browL: -4, browR: -4},
  suspicious: {eyes: 'squint', lookX: -0.8, mouth: 'line', smile: -0.2, mouthX: 2, browL: 16, browR: -10, browY: -1},
  thinking: {eyes: 'dot', lookX: 0.6, lookY: 0.8, mouth: 'pout', mouthX: 4, browL: -10, browR: 6, browY: 1.5},
  happy: {eyes: 'happy', mouth: 'smile', smile: 0.8, blush: 0.5, browY: 2},
  grin: {eyes: 'dot', mouth: 'grin', blush: 0.3, browY: 2.5, browL: -4, browR: -4},
  laugh: {eyes: 'happy', mouth: 'open', blush: 0.6, browY: 3},
  proud: {eyes: 'closed', mouth: 'smirk', smile: 0.6, browY: 3, browL: -8, browR: -8, blush: 0.3},
  excited: {eyes: 'sparkle', mouth: 'open', blush: 0.55, browY: 4, browL: -8, browR: -8},
  love: {eyes: 'heart', mouth: 'smile', smile: 0.9, blush: 0.8, browY: 3},
  content: {eyes: 'happy', mouth: 'smile', smile: 0.45, blush: 0.35, browY: 1},
  relieved: {eyes: 'closed', mouth: 'smile', smile: 0.4, browL: -12, browR: -12, browY: 1.5, sweat: 0.6},
  shock: {eyes: 'shock', mouth: 'o', browY: 6, browL: -6, browR: -6},
  panic: {eyes: 'shock', mouth: 'grimace', browY: 5, browL: -16, browR: -16, sweat: 1},
  scared: {eyes: 'wide', mouth: 'wavy', browY: 4, browL: -20, browR: -20, sweat: 1, lookY: -0.2},
  worried: {eyes: 'open', mouth: 'wavy', mouthW: 0.8, browL: -18, browR: -18, browY: 2},
  nervous: {eyes: 'dot', lookX: 0.7, mouth: 'wavy', browL: -14, browR: -14, browY: 1, sweat: 1},
  embarrassed: {eyes: 'closed', mouth: 'wavy', mouthW: 0.7, blush: 1, sweat: 1, browL: -14, browR: -14},
  confused: {eyes: 'open', lookY: 0.4, mouth: 'line', smile: -0.15, mouthX: -3, browL: -18, browR: 10, browY: 1},
  dizzy: {eyes: 'spiral', mouth: 'wavy', browL: -10, browR: -10},
  sad: {eyes: 'open', lookY: -0.6, mouth: 'frown', browL: -22, browR: -22, browY: 0.5},
  cry: {eyes: 'closed', mouth: 'frown', browL: -24, browR: -24, tears: 1},
  sob: {eyes: 'closed', mouth: 'scream', browL: -26, browR: -26, tears: 1, blush: 0.4},
  tired: {eyes: 'lidded', lid: 0.72, lidTilt: 6, mouth: 'line', smile: -0.1, browL: -10, browR: -10, browY: -1},
  gloom: {eyes: 'lidded', lid: 0.65, lookY: -0.6, mouth: 'frown', browL: -12, browR: -12, gloom: 1},
  angry: {eyes: 'angry', mouth: 'frown', browL: 24, browR: 24, browY: -2, vein: true},
  furious: {eyes: 'angry', mouth: 'grimace', browL: 30, browR: 30, browY: -3, vein: true},
  determined: {eyes: 'angry', mouth: 'line', smile: -0.05, mouthW: 0.9, browL: 18, browR: 18, browY: -1},
  focused: {eyes: 'squint', mouth: 'pout', mouthX: 2, browL: 12, browR: 12, browY: -1.5},
  disgusted: {eyes: 'squint', mouth: 'tongue', mouthX: -2, browL: 20, browR: -14, browY: 0},
  fake: {eyes: 'lidded', lid: 0.35, mouth: 'grin', browL: -6, browR: -6, sweat: 1},
};
export const MOODS = Object.keys(P).filter((k) => k !== 'fake') as Mood[];

const INK = '#16181E';
const WHITE = '#FFFFFF';
const SWEAT = '#7EC8FF';
const D = Math.PI / 180;

export const drawFace = (ctx: CanvasRenderingContext2D, f: FaceState) => {
  const S = ctx.canvas.width;
  const u = S / 100; // face units: 0..100 across the canvas
  ctx.clearRect(0, 0, S, S);
  const spec: Spec = {...P[f.mood ?? 'neutral']};
  const g = <K extends keyof FaceState>(k: K) => (f[k] !== undefined ? f[k] : (spec as FaceState)[k]);
  const eyes = (f.eyes ?? spec.eyes) as EyeStyle;
  const mouth = (f.mouth ?? spec.mouth) as MouthStyle;
  const lookX = (g('lookX') as number) ?? 0;
  const lookY = (g('lookY') as number) ?? 0;
  const blink = Math.min(1, Math.max(0, f.blink ?? 0));
  const es = f.eyeScale ?? 1;
  const browY = (g('browY') as number) ?? 0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // features are designed small, then scaled up about the face centre: bold and readable (RicksClips proportions)
  const K = f.featureScale ?? 1.55;
  ctx.save();
  ctx.translate(S / 2, S * 0.5);
  ctx.scale(K, K);
  ctx.translate(-S / 2, -S * 0.5);

  const EX = 11.5; // eye half-gap
  const EY = 47; // eye height
  const cx = 50 + lookX * 1.2;
  const cy = EY - lookY * 1.0;

  // ---------------------------------------------------------------- gloom (blue lines over the forehead)
  const gloom = (g('gloom') as number) ?? 0;
  if (gloom > 0) {
    const gr = ctx.createLinearGradient(0, 0, 0, 40 * u);
    gr.addColorStop(0, `rgba(70,90,160,${0.55 * gloom})`);
    gr.addColorStop(1, 'rgba(70,90,160,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, S, 40 * u);
    ctx.strokeStyle = `rgba(40,50,110,${0.8 * gloom})`;
    ctx.lineWidth = 0.9 * u;
    for (let i = 0; i < 7; i++) {
      const x = (26 + i * 8) * u;
      ctx.beginPath();
      ctx.moveTo(x, (6 + (i % 2) * 3) * u);
      ctx.lineTo(x, (22 + (i % 3) * 4) * u);
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------- blush (soft ovals + hatch strokes)
  const blush = (g('blush') as number) ?? 0;
  if (blush > 0) {
    for (const s of [-1, 1]) {
      const bx = (50 + s * 17.5) * u;
      const by = 59 * u;
      ctx.fillStyle = `rgba(245,120,130,${0.42 * blush})`;
      ctx.beginPath();
      ctx.ellipse(bx, by, 6.5 * u, 3.4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(215,70,90,${0.7 * blush})`;
      ctx.lineWidth = 0.55 * u;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(bx + (k * 2.6 - 1.2) * u, by + 1.6 * u);
        ctx.lineTo(bx + (k * 2.6 + 1.2) * u, by - 1.6 * u);
        ctx.stroke();
      }
    }
  }

  // ---------------------------------------------------------------- eyes
  const lid = Math.max((g('lid') as number) ?? 0, blink);
  const lidTilt = spec.lidTilt ?? 0;
  const drawEye = (side: -1 | 1) => {
    const x = (cx + side * EX) * u;
    const y = cy * u;
    const winked = (f.wink === 'L' && side === -1) || (f.wink === 'R' && side === 1);
    let style: EyeStyle = winked ? 'happy' : eyes;
    if (blink > 0.85 && style !== 'happy' && style !== 'closed' && style !== 'spiral' && style !== 'heart') style = 'closed';
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    const pupilX = lookX * 1.4 * u;
    const pupilY = -lookY * 1.2 * u;
    switch (style) {
      case 'happy': {
        ctx.lineWidth = 1.7 * u;
        ctx.beginPath();
        ctx.arc(x, y + 1.8 * u, 4.2 * u * es, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
        break;
      }
      case 'closed': {
        ctx.lineWidth = 1.6 * u;
        ctx.beginPath();
        ctx.moveTo(x - 4.2 * u, y);
        ctx.quadraticCurveTo(x, y + 2.2 * u, x + 4.2 * u, y);
        ctx.stroke();
        break;
      }
      case 'spiral': {
        ctx.lineWidth = 0.9 * u;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.15) {
          const r = (a / (Math.PI * 5)) * 5 * u;
          const px = x + Math.cos(a * side) * r;
          const py = y + Math.sin(a * side) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        break;
      }
      case 'heart': {
        const s = 5.2 * u;
        ctx.fillStyle = '#E8445A';
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.8);
        ctx.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.4);
        ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.3, y - s * 0.1, x, y + s * 0.8);
        ctx.fill();
        ctx.lineWidth = 0.7 * u;
        ctx.stroke();
        break;
      }
      case 'open':
      case 'wide':
      case 'shock': {
        const r = (style === 'shock' ? 6.6 : style === 'wide' ? 5.8 : 5.0) * u * es;
        const ry = r * (style === 'open' ? 1.12 : 1.05) * (1 - lid * 0.9);
        ctx.fillStyle = WHITE;
        ctx.lineWidth = 0.95 * u;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.9, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const pr = (style === 'shock' ? 1.3 : style === 'wide' ? 1.8 : 2.5) * u;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x + pupilX * 1.4, y + pupilY * 1.2 + (style === 'open' ? 0.6 * u : 0), pr, 0, Math.PI * 2);
        ctx.fill();
        if (style !== 'shock') {
          ctx.fillStyle = WHITE;
          ctx.beginPath();
          ctx.arc(x + pupilX * 1.4 - pr * 0.35, y + pupilY * 1.2 - pr * 0.3, pr * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'sparkle': {
        const rx = 3.6 * u * es;
        const ry = 5.0 * u * es;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = WHITE;
        const star = (sx: number, sy: number, r: number) => {
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const rr = i % 2 ? r * 0.35 : r;
            ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
        };
        star(x - 1.0 * u, y - 1.6 * u, 2.2 * u);
        star(x + 1.4 * u, y + 2.0 * u, 1.1 * u);
        break;
      }
      default: {
        // dot / lidded / angry / squint: a small black oval (+ catch-light), cut by an upper lid line
        const rx = 3.0 * u * es;
        const ry = 4.4 * u * es;
        const ey = y;
        const lidK = style === 'lidded' ? lid : style === 'angry' ? 0.38 : style === 'squint' ? 0.58 : blink;
        const tilt = (style === 'angry' ? -side * 22 : style === 'squint' ? -side * 8 : lidTilt * -side) * D;
        ctx.save();
        // clip to the part below the lid line
        const ly = ey - ry + lidK * 2 * ry;
        if (lidK > 0.01) {
          ctx.beginPath();
          const dx = 8 * u;
          ctx.moveTo(x - dx, ly - Math.tan(tilt) * dx);
          ctx.lineTo(x + dx, ly + Math.tan(tilt) * dx);
          ctx.lineTo(x + dx, ey + 3 * ry);
          ctx.lineTo(x - dx, ey + 3 * ry);
          ctx.closePath();
          ctx.clip();
        }
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x + pupilX * 0.5, ey + pupilY * 0.5, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(x + pupilX * 0.5 - rx * 0.32, ey + pupilY * 0.5 - ry * (lidK > 0.3 ? -0.05 : 0.38), rx * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (lidK > 0.01) {
          // the lid line itself (thick, a touch wider than the eye: the "deadpan" look)
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.25 * u;
          const dx = rx * 1.45;
          ctx.beginPath();
          ctx.moveTo(x - dx, ly - Math.tan(tilt) * dx);
          ctx.lineTo(x + dx, ly + Math.tan(tilt) * dx);
          ctx.stroke();
        }
      }
    }
  };
  drawEye(-1);
  drawEye(1);

  // ---------------------------------------------------------------- brows (thick, independent tilt)
  const bl = (g('browL') as number) ?? 0;
  const br = (g('browR') as number) ?? 0;
  const brow = (side: -1 | 1, ang: number) => {
    // ang > 0: inner end down (angry/determined); ang < 0: inner end up (sad/worried)
    const x = (cx + side * EX) * u;
    const y = (cy - 9.5 - browY) * u;
    const L = 5.0 * u;
    const a = ang * D;
    const ix = x - side * L * Math.cos(a);
    const iy = y + Math.sin(a) * L;
    const ox = x + side * L * Math.cos(a);
    const oy = y - Math.sin(a) * L;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1 * u;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.quadraticCurveTo(x, y - 1.3 * u, ox, oy);
    ctx.stroke();
  };
  brow(-1, bl);
  brow(1, br);

  // ---------------------------------------------------------------- mouth
  const talk = Math.min(1, Math.max(0, f.talk ?? 0));
  const mx = (50 + ((g('mouthX') as number) ?? 0) + lookX * 0.8) * u;
  const my = (64 - lookY * 0.6) * u;
  const mw = ((g('mouthW') as number) ?? 1) * 7 * u;
  const smile = spec.smile ?? 0.2;
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  const tongue = (x: number, y: number, w: number) => {
    ctx.fillStyle = '#E86A6A';
    ctx.beginPath();
    ctx.ellipse(x, y, w, w * 0.55, 0, Math.PI, 0, true);
    ctx.fill();
  };
  let m = mouth;
  if (talk > 0.15 && (m === 'line' || m === 'smile' || m === 'frown' || m === 'smirk' || m === 'pout')) m = 'open';
  switch (m) {
    case 'none':
      break;
    case 'line':
    case 'smile':
    case 'frown': {
      const c = m === 'frown' ? -0.55 : m === 'smile' ? Math.max(0.35, smile) : smile;
      ctx.lineWidth = 1.35 * u;
      ctx.beginPath();
      ctx.moveTo(mx - mw, my - c * 1.2 * u);
      ctx.quadraticCurveTo(mx, my + c * 5 * u, mx + mw, my - c * 1.2 * u);
      ctx.stroke();
      break;
    }
    case 'smirk': {
      ctx.lineWidth = 1.35 * u;
      ctx.beginPath();
      ctx.moveTo(mx - mw * 0.9, my + 0.6 * u);
      ctx.quadraticCurveTo(mx + mw * 0.2, my + (1.6 + smile * 2) * u, mx + mw, my - 2.2 * u);
      ctx.stroke();
      ctx.lineWidth = 1.0 * u;
      ctx.beginPath();
      ctx.moveTo(mx + mw * 0.92, my - 3.0 * u);
      ctx.lineTo(mx + mw * 1.12, my - 1.2 * u);
      ctx.stroke();
      break;
    }
    case 'pout': {
      ctx.beginPath();
      ctx.ellipse(mx, my, 1.7 * u, 1.4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'o': {
      ctx.beginPath();
      ctx.ellipse(mx, my + 0.5 * u, 2.6 * u, 3.4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      tongue(mx, my + 3.0 * u, 1.6 * u);
      break;
    }
    case 'open': {
      const open = 3.2 + talk * 2.5;
      ctx.beginPath();
      ctx.moveTo(mx - mw, my - 1 * u);
      ctx.quadraticCurveTo(mx, my - 2 * u, mx + mw, my - 1 * u);
      ctx.quadraticCurveTo(mx + mw * 0.7, my + open * 2.2 * u, mx, my + open * 2.2 * u);
      ctx.quadraticCurveTo(mx - mw * 0.7, my + open * 2.2 * u, mx - mw, my - 1 * u);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = WHITE;
      ctx.fillRect(mx - mw, my - 2 * u, mw * 2, 1.9 * u);
      tongue(mx, my + open * 2.2 * u, mw * 0.55);
      ctx.restore();
      break;
    }
    case 'grin':
    case 'grimace':
    case 'scream': {
      // RicksClips teeth: a white rounded bar with tooth lines (grin = curved up, grimace = straight, scream = tall)
      const w = mw * (m === 'grimace' ? 1.25 : m === 'scream' ? 0.8 : 1.4);
      const h = (m === 'scream' ? 9 : m === 'grimace' ? 5.2 : 5.0) * u;
      const curve = m === 'grin' ? 2.2 * u : 0;
      const shape = new Path2D();
      shape.moveTo(mx - w, my - h / 2 - curve);
      shape.quadraticCurveTo(mx, my - h / 2 + curve * 0.6, mx + w, my - h / 2 - curve);
      shape.quadraticCurveTo(mx + w * 1.05, my + h / 2 - curve * 0.3, mx + w * 0.9, my + h / 2);
      shape.quadraticCurveTo(mx, my + h / 2 + curve * 1.4, mx - w * 0.9, my + h / 2);
      shape.quadraticCurveTo(mx - w * 1.05, my + h / 2 - curve * 0.3, mx - w, my - h / 2 - curve);
      shape.closePath();
      ctx.fillStyle = m === 'scream' ? INK : WHITE;
      ctx.fill(shape);
      ctx.save();
      ctx.clip(shape);
      if (m === 'scream') {
        ctx.fillStyle = WHITE;
        ctx.fillRect(mx - w, my - h / 2 - curve, w * 2, 1.8 * u);
        tongue(mx, my + h / 2, w * 0.6);
      } else {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.6 * u;
        for (let k = -3; k <= 3; k++) {
          ctx.beginPath();
          ctx.moveTo(mx + k * w * 0.27, my - h);
          ctx.lineTo(mx + k * w * 0.27, my + h);
          ctx.stroke();
        }
        if (m === 'grimace') {
          ctx.beginPath();
          ctx.moveTo(mx - w, my);
          ctx.lineTo(mx + w, my);
          ctx.stroke();
        }
      }
      ctx.restore();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1 * u;
      ctx.stroke(shape);
      break;
    }
    case 'wavy': {
      ctx.lineWidth = 1.2 * u;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const x = mx - mw + t * mw * 2;
        const y = my + Math.sin(t * Math.PI * 3) * 1.0 * u;
        if (!i) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case 'tongue': {
      ctx.lineWidth = 1.3 * u;
      ctx.beginPath();
      ctx.moveTo(mx - mw, my + 1 * u);
      ctx.quadraticCurveTo(mx, my - 1.5 * u, mx + mw, my + 1.2 * u);
      ctx.stroke();
      ctx.fillStyle = '#E86A6A';
      ctx.beginPath();
      ctx.ellipse(mx + 1.5 * u, my + 2.4 * u, 2.4 * u, 2.6 * u, 0.2, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  // ---------------------------------------------------------------- tears
  const tears = (g('tears') as number) ?? 0;
  if (tears > 0) {
    ctx.fillStyle = 'rgba(120,190,255,0.92)';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.5 * u;
    for (const s of [-1, 1]) {
      const x = (cx + s * EX) * u;
      const y0 = (cy + 2.5) * u;
      const len = (6 + 16 * tears) * u;
      ctx.beginPath();
      ctx.moveTo(x - 1.3 * u, y0);
      ctx.quadraticCurveTo(x - 1.8 * u, y0 + len * 0.6, x - 1.0 * u, y0 + len);
      ctx.quadraticCurveTo(x, y0 + len + 1.4 * u, x + 1.0 * u, y0 + len);
      ctx.quadraticCurveTo(x + 1.8 * u, y0 + len * 0.6, x + 1.3 * u, y0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
  // ---------------------------------------------------------------- sweat drop(s) (upper right of the forehead)
  const sweat = f.sweat !== undefined ? Number(f.sweat) : Number(spec.sweat ?? 0);
  if (sweat > 0) {
    const drop = (x: number, y: number, s: number) => {
      ctx.fillStyle = SWEAT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.7 * u;
      ctx.beginPath();
      ctx.moveTo(x, y - 4 * s * u);
      ctx.quadraticCurveTo(x + 3 * s * u, y + 1 * s * u, x, y + 2.6 * s * u);
      ctx.quadraticCurveTo(x - 3 * s * u, y + 1 * s * u, x, y - 4 * s * u);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(x - 0.8 * s * u, y + 0.4 * s * u, 0.5 * s * u, 0.9 * s * u, 0.4, 0, Math.PI * 2);
      ctx.fill();
    };
    drop(73 * u, 27 * u, 1.9 * sweat);
    if (sweat > 0.7) drop(80 * u, 38 * u, 1.2);
  }

  // ---------------------------------------------------------------- anger vein (top corner)
  if (g('vein')) {
    ctx.strokeStyle = '#D8283C';
    ctx.lineWidth = 1.8 * u;
    const vx = 72 * u;
    const vy = 22 * u;
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(vx + Math.cos(a) * 1.2 * u, vy + Math.sin(a) * 1.2 * u);
      ctx.quadraticCurveTo(vx + Math.cos(a + 0.5) * 4.5 * u, vy + Math.sin(a + 0.5) * 4.5 * u, vx + Math.cos(a) * 6.3 * u, vy + Math.sin(a) * 6.3 * u);
      ctx.stroke();
    }
  }
};
