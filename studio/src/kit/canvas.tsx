// 2D canvas drawings used as three.js textures (deterministic: everything derives from the frame)
import {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../theme';
import {FONT} from './overlay';

export type Pt = [number, number];
export type Stroke = {pts: Pt[]; color?: string; width?: number};

/** creates a canvas + texture once; redraws on every render (cheap at these sizes) */
export const useCanvasTexture = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const {canvas, tex} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return {canvas: c, tex: t};
  }, [w, h]);
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  draw(ctx, w, h);
  ctx.restore();
  tex.needsUpdate = true;
  return tex;
};

/* ---------- stroke helpers ---------- */

const smooth = (pts: Pt[], n = 14): Pt[] => {
  if (pts.length < 3) return pts;
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  return curve.getPoints(pts.length * n).map((v) => [v.x, v.y] as Pt);
};

const circle = (cx: number, cy: number, r: number, n = 24): Pt[] =>
  Array.from({length: n + 1}, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);

const segLen = (s: Pt[]) => s.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0), 0);

/** draw strokes up to progress p (0..1 of total length); returns pen tip in 0..1 coords */
export const drawStrokes = (
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  p: number,
  box: {x: number; y: number; w: number; h: number},
  base: {color: string; width: number},
): Pt => {
  const total = strokes.reduce((a, s) => a + segLen(s.pts), 0);
  let budget = Math.max(0, Math.min(1, p)) * total;
  let tip: Pt = strokes[0].pts[0];
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (budget <= 0) break;
    ctx.strokeStyle = s.color ?? base.color;
    ctx.lineWidth = s.width ?? base.width;
    ctx.beginPath();
    for (let i = 0; i < s.pts.length; i++) {
      const [u, v] = s.pts[i];
      if (i > 0) {
        const d = Math.hypot(u - s.pts[i - 1][0], v - s.pts[i - 1][1]);
        if (d > budget) {
          const k = budget / d;
          const pu = s.pts[i - 1][0] + (u - s.pts[i - 1][0]) * k;
          const pv = s.pts[i - 1][1] + (v - s.pts[i - 1][1]) * k;
          ctx.lineTo(box.x + pu * box.w, box.y + pv * box.h);
          tip = [pu, pv];
          budget = 0;
          break;
        }
        budget -= d;
        ctx.lineTo(box.x + u * box.w, box.y + v * box.h);
      } else {
        ctx.moveTo(box.x + u * box.w, box.y + v * box.h);
      }
      tip = [u, v];
    }
    ctx.stroke();
  }
  return tip;
};

/** same walk as drawStrokes but only returns the tip (for positioning the hand) */
export const strokeTip = (strokes: Stroke[], p: number): Pt => {
  const total = strokes.reduce((a, s) => a + segLen(s.pts), 0);
  let budget = Math.max(0, Math.min(1, p)) * total;
  let tip: Pt = strokes[0].pts[0];
  for (const s of strokes) {
    for (let i = 1; i < s.pts.length; i++) {
      const d = Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]);
      if (d >= budget) {
        const k = budget / Math.max(d, 1e-6);
        return [s.pts[i - 1][0] + (s.pts[i][0] - s.pts[i - 1][0]) * k, s.pts[i - 1][1] + (s.pts[i][1] - s.pts[i - 1][1]) * k];
      }
      budget -= d;
      tip = s.pts[i];
    }
  }
  return tip;
};

/* ---------- Mo's dragon (kid drawing, 0..1 coords, y down) ---------- */

export const DRAGON: Stroke[] = [
  {pts: smooth([[0.66, 0.36], [0.58, 0.5], [0.45, 0.55], [0.3, 0.52], [0.18, 0.6], [0.11, 0.74], [0.17, 0.84], [0.24, 0.8]])},
  {pts: smooth([[0.7, 0.38], [0.64, 0.56], [0.5, 0.66], [0.34, 0.64], [0.23, 0.7], [0.19, 0.79]])},
  {pts: circle(0.72, 0.3, 0.075)},
  {pts: smooth([[0.78, 0.26], [0.9, 0.29], [0.88, 0.35], [0.77, 0.36]])},
  {pts: smooth([[0.69, 0.23], [0.66, 0.16], [0.64, 0.11]])},
  {pts: smooth([[0.75, 0.23], [0.76, 0.16], [0.78, 0.11]])},
  {pts: circle(0.73, 0.29, 0.012, 10), width: 10},
  {pts: smooth([[0.5, 0.55], [0.44, 0.34], [0.32, 0.18], [0.35, 0.32], [0.25, 0.29], [0.31, 0.41], [0.22, 0.44], [0.38, 0.54]])},
  {pts: smooth([[0.56, 0.64], [0.56, 0.76], [0.61, 0.78]])},
  {pts: smooth([[0.38, 0.65], [0.38, 0.77], [0.43, 0.79]])},
  {pts: [[0.27, 0.52], [0.26, 0.46], [0.31, 0.51], [0.32, 0.45], [0.36, 0.52]]},
  // fire puff
  {pts: smooth([[0.9, 0.31], [0.95, 0.26], [0.97, 0.31], [0.99, 0.27]]), color: '#C8743A'},
];

/* ---------- Lia's crayon drawing of Mo ---------- */

export const LIA_DRAWING: Stroke[] = [
  {pts: smooth([[0.42, 0.18], [0.58, 0.18], [0.6, 0.38], [0.5, 0.42], [0.4, 0.38], [0.42, 0.18]]), color: '#3E5C8A'},
  {pts: smooth([[0.36, 0.45], [0.64, 0.45], [0.68, 0.8], [0.32, 0.8], [0.36, 0.45]]), color: '#3E5C8A'},
  {pts: circle(0.46, 0.28, 0.012, 8), color: '#222', width: 10},
  {pts: circle(0.54, 0.28, 0.012, 8), color: '#222', width: 10},
  {pts: smooth([[0.45, 0.33], [0.5, 0.36], [0.55, 0.33]]), color: '#C8743A'},
  {pts: [[0.42, 0.8], [0.42, 0.93]], color: '#3E5C8A'},
  {pts: [[0.58, 0.8], [0.58, 0.93]], color: '#3E5C8A'},
  {pts: circle(0.82, 0.18, 0.07), color: '#E0A93B'},
  {pts: smooth([[0.12, 0.95], [0.5, 0.97], [0.9, 0.95]]), color: '#5E8A4E'},
];

/* ---------- textures ---------- */

export const drawPaper = (ctx: CanvasRenderingContext2D, w: number, h: number, color: string = C.paper) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  // faint paper tooth
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 160; i++) {
    const r = Math.sin(i * 91.7) * 0.5 + 0.5;
    const r2 = Math.sin(i * 13.3) * 0.5 + 0.5;
    ctx.fillStyle = '#000';
    ctx.fillRect(r * w, r2 * h, 2, 2);
  }
  ctx.globalAlpha = 1;
};

export const drawWood = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = '#4B3628';
  ctx.fillRect(0, 0, w, h);
  const planks = 4;
  for (let p = 0; p < planks; p++) {
    const y0 = (p / planks) * h;
    ctx.fillStyle = p % 2 ? '#523B2C' : '#4A3527';
    ctx.fillRect(0, y0, w, h / planks);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(w, y0);
    ctx.stroke();
    for (let g = 0; g < 9; g++) {
      const gy = y0 + ((g + 0.5) / 9) * (h / planks);
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + (Math.sin(g * 7 + p) * 0.5 + 0.5) * 0.08})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const yy = gy + Math.sin(x / (90 + g * 13) + p * 2 + g) * 4;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }
};

const heart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
};

/** phone screen: Mo's post of the dragon. likes = number shown, pop = 0..1 heart bump */
export const drawPostScreen = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: {likes: number; pop: number; handle?: string; caption?: string; strokes?: Stroke[]},
) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  // status bar + header
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `26px ${FONT}`;
  ctx.fillText('9:41', 28, 40);
  ctx.fillStyle = C.hero;
  ctx.beginPath();
  ctx.arc(52, 104, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `32px ${FONT}`;
  ctx.fillText(o.handle ?? '@mo.draws', 90, 114);
  // image
  const iy = 150;
  ctx.save();
  ctx.translate(0, iy);
  drawPaper(ctx, w, w);
  drawStrokes(ctx, o.strokes ?? DRAGON, 1, {x: 20, y: 20, w: w - 40, h: w - 40}, {color: '#2A2A30', width: 7});
  ctx.restore();
  // heart + likes
  const hy = iy + w + 34;
  const s = 46 * (1 + o.pop * 0.35);
  heart(ctx, 52, hy - (s - 46) / 2, s);
  if (o.likes > 0) {
    ctx.fillStyle = C.amber;
    ctx.fill();
  } else {
    ctx.strokeStyle = '#F3EFE6';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `34px ${FONT}`;
  ctx.fillText(`${o.likes} ${o.likes === 1 ? 'like' : 'likes'}`, 96, hy + 36);
  ctx.fillStyle = '#C9CFDC';
  ctx.font = `30px ${FONT}`;
  ctx.fillText(o.caption ?? 'my dragon :)', 28, hy + 100);
};

/* =====================================================================
   Act 2 phone screens (all 450×922 canvases)
   ===================================================================== */

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const statusBar = (ctx: CanvasRenderingContext2D, w: number, time = '9:41') => {
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `26px ${FONT}`;
  ctx.fillText(time, 28, 40);
  ctx.fillRect(w - 70, 26, 40, 16);
};

/** delete confirmation over the dragon post; hover 0..1 highlights "Delete" */
export const drawDeleteDialog = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {likes: number; hover: number}) => {
  drawPostScreen(ctx, w, h, {likes: o.likes, pop: 0});
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, w, h);
  const bw = w - 70;
  const bx = 35;
  const by = h / 2 - 150;
  rr(ctx, bx, by, bw, 270, 26);
  ctx.fillStyle = '#1E222C';
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `42px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Delete post?', w / 2, by + 74);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `28px ${FONT}`;
  ctx.fillText("This can't be undone.", w / 2, by + 118);
  // buttons
  ctx.fillStyle = '#2A2F3B';
  rr(ctx, bx + 20, by + 170, bw / 2 - 30, 70, 18);
  ctx.fill();
  ctx.fillStyle = `rgba(242,169,59,${0.15 + o.hover * 0.55})`;
  rr(ctx, bx + bw / 2 + 10, by + 170, bw / 2 - 30, 70, 18);
  ctx.fill();
  ctx.font = `34px ${FONT}`;
  ctx.fillStyle = '#C9CFDC';
  ctx.fillText('Cancel', bx + 20 + (bw / 2 - 30) / 2, by + 216);
  ctx.fillStyle = '#F3EFE6';
  ctx.fillText('Delete', bx + bw / 2 + 10 + (bw / 2 - 30) / 2, by + 216);
  ctx.textAlign = 'left';
};

/** empty profile + "Post deleted." toast (toast 0..1) */
export const drawPostDeleted = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {toast: number}) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  statusBar(ctx, w);
  ctx.fillStyle = C.hero;
  ctx.beginPath();
  ctx.arc(80, 140, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `36px ${FONT}`;
  ctx.fillText('@mo.draws', 150, 132);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `28px ${FONT}`;
  ctx.fillText('0 posts', 150, 172);
  // empty grid
  ctx.strokeStyle = '#262B38';
  ctx.lineWidth = 3;
  const s = (w - 40) / 3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      rr(ctx, 14 + c * (s + 6), 230 + r * (s + 6), s, s, 8);
      ctx.stroke();
    }
  if (o.toast > 0) {
    ctx.globalAlpha = o.toast;
    rr(ctx, 70, h - 170, w - 140, 74, 37);
    ctx.fillStyle = '#2A2F3B';
    ctx.fill();
    ctx.fillStyle = '#F3EFE6';
    ctx.font = `34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Post deleted.', w / 2, h - 122);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
};

/** lock screen with a likes notification (card 0..1 slides in) */
export const drawNotification = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {likes: number; card: number}) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1A2030');
  g.addColorStop(1, '#0B0D12');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#E8ECF5';
  ctx.textAlign = 'center';
  ctx.font = `120px ${FONT}`;
  ctx.fillText('11:24', w / 2, 230);
  ctx.font = `30px ${FONT}`;
  ctx.fillStyle = '#9AA3B5';
  ctx.fillText('Saturday', w / 2, 100);
  ctx.textAlign = 'left';
  const y = 330 + (1 - o.card) * -80;
  ctx.globalAlpha = o.card;
  rr(ctx, 22, y, w - 44, 130, 26);
  ctx.fillStyle = 'rgba(40,46,60,0.95)';
  ctx.fill();
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(70, y + 50, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `30px ${FONT}`;
  ctx.fillText('mo.draws', 108, y + 44);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `24px ${FONT}`;
  ctx.fillText('now', w - 90, y + 44);
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `32px ${FONT}`;
  ctx.fillText(`${o.likes.toLocaleString('en-US')} people liked your post`, 48, y + 100);
  ctx.globalAlpha = 1;
};

export type ChatMsg = {me: boolean; text: string; from?: string; photo?: boolean};

const drawGroupPhoto = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  rr(ctx, x, y, w, h, 18);
  ctx.clip();
  const g = ctx.createRadialGradient(x + w / 2, y + h * 0.2, 10, x + w / 2, y + h * 0.4, w * 0.8);
  g.addColorStop(0, '#6A4E36');
  g.addColorStop(1, '#22180F');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const heads = [
    {cx: 0.22, c: C.sage, glasses: true},
    {cx: 0.5, c: C.clay},
    {cx: 0.78, c: '#8A8FA3', cap: true},
  ];
  for (const hd of heads) {
    const cx = x + hd.cx * w;
    ctx.fillStyle = hd.c;
    rr(ctx, cx - 44, y + h * 0.5, 88, 110, 30);
    ctx.fill();
    rr(ctx, cx - 30, y + h * 0.22, 60, 74, 30);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.fillRect(cx - 14, y + h * 0.32, 6, 10);
    ctx.fillRect(cx + 8, y + h * 0.32, 6, 10);
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.37, 9, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    if (hd.glasses) {
      ctx.beginPath();
      ctx.arc(cx - 11, y + h * 0.335, 11, 0, Math.PI * 2);
      ctx.arc(cx + 11 + 11, y + h * 0.335, 0.01, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 11, y + h * 0.335, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (hd.cap) {
      ctx.fillStyle = '#4A4F63';
      ctx.beginPath();
      ctx.ellipse(cx, y + h * 0.24, 34, 20, 0, Math.PI, 0);
      ctx.fill();
    }
  }
  // table + papers
  ctx.fillStyle = '#5A4232';
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  ctx.fillStyle = '#E8E0CC';
  [0.12, 0.42, 0.7].forEach((px, i) => {
    ctx.save();
    ctx.translate(x + px * w + 30, y + h * 0.84);
    ctx.rotate((i - 1) * 0.12);
    ctx.fillRect(-34, -14, 68, 30);
    ctx.restore();
  });
  // lamp glow
  ctx.fillStyle = 'rgba(255,217,160,0.25)';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** chat thread. msgPop: per-message 0..1 visibility; typing: text in the input box (undefined = no keyboard) */
export const drawChat = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: {title: string; sub?: string; msgs: ChatMsg[]; msgPop?: number[]; typing?: string; caret?: boolean; scroll?: number},
) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  const kb = o.typing !== undefined ? 330 : 0;
  // messages (laid out from the top)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 150, w, h - 150 - kb - 90);
  ctx.clip();
  let y = 190 - (o.scroll ?? 0);
  o.msgs.forEach((m, i) => {
    const vis = o.msgPop ? o.msgPop[i] ?? 1 : 1;
    if (vis <= 0) return;
    ctx.globalAlpha = Math.min(1, vis);
    if (m.from && !m.me) {
      ctx.fillStyle = '#9AA3B5';
      ctx.font = `24px ${FONT}`;
      ctx.fillText(m.from, 28, y + 8);
      y += 18;
    }
    if (m.photo) {
      const pw = w - 120;
      const ph = pw * 0.75;
      drawGroupPhoto(ctx, 24, y, pw, ph);
      y += ph + 24;
    } else {
      ctx.font = `32px ${FONT}`;
      const tw = Math.min(w - 120, ctx.measureText(m.text).width + 44);
      const bx = m.me ? w - tw - 24 : 24;
      rr(ctx, bx, y, tw, 62, 26);
      ctx.fillStyle = m.me ? '#3E5C8A' : '#262B38';
      ctx.fill();
      ctx.fillStyle = '#F3EFE6';
      ctx.fillText(m.text, bx + 22, y + 42);
      y += 82;
    }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
  // header
  ctx.fillStyle = '#141821';
  ctx.fillRect(0, 0, w, 150);
  statusBar(ctx, w);
  ctx.fillStyle = '#9AA3B5';
  ctx.font = `40px ${FONT}`;
  ctx.fillText('‹', 22, 112);
  ctx.fillStyle = C.sage;
  ctx.beginPath();
  ctx.arc(90, 100, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `34px ${FONT}`;
  ctx.fillText(o.title, 130, 98);
  if (o.sub) {
    ctx.fillStyle = '#9AA3B5';
    ctx.font = `22px ${FONT}`;
    ctx.fillText(o.sub, 130, 128);
  }
  // input + keyboard
  const iy = h - kb - 80;
  rr(ctx, 20, iy, w - 40, 60, 30);
  ctx.fillStyle = '#1E222C';
  ctx.fill();
  ctx.font = `30px ${FONT}`;
  ctx.fillStyle = o.typing ? '#F3EFE6' : '#5E6678';
  const txt = o.typing ? o.typing : 'message';
  ctx.fillText(txt, 44, iy + 40);
  if (o.typing !== undefined && o.caret) {
    const cw = o.typing ? ctx.measureText(o.typing).width : 0;
    ctx.fillStyle = '#BFD2FF';
    ctx.fillRect(46 + cw, iy + 14, 3, 32);
  }
  if (kb) {
    ctx.fillStyle = '#171A22';
    ctx.fillRect(0, h - kb, w, kb);
    const rows = [10, 9, 7];
    rows.forEach((n, r) => {
      const kw = (w - 20) / 10 - 6;
      const off = (w - n * (kw + 6)) / 2;
      for (let k = 0; k < n; k++) {
        rr(ctx, off + k * (kw + 6), h - kb + 20 + r * 74, kw, 62, 8);
        ctx.fillStyle = '#2A2F3B';
        ctx.fill();
      }
    });
    rr(ctx, 110, h - kb + 242, w - 220, 62, 8);
    ctx.fillStyle = '#2A2F3B';
    ctx.fill();
  }
};

/** Mo's latest selfie post with pull-to-refresh spinner (spin 0..1, -1 = hidden) */
export const drawFeedRefresh = (ctx: CanvasRenderingContext2D, w: number, h: number, o: {likes: number; spin: number; time: string}) => {
  ctx.fillStyle = '#0F1218';
  ctx.fillRect(0, 0, w, h);
  statusBar(ctx, w, o.time);
  const top = o.spin >= 0 ? 200 : 150;
  if (o.spin >= 0) {
    ctx.strokeStyle = '#9AA3B5';
    ctx.lineWidth = 5;
    ctx.beginPath();
    const a = o.spin * Math.PI * 6;
    ctx.arc(w / 2, 120, 20, a, a + Math.PI * 1.4);
    ctx.stroke();
  }
  ctx.fillStyle = C.hero;
  ctx.beginPath();
  ctx.arc(52, top + 4, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `32px ${FONT}`;
  ctx.fillText('@mo', 90, top + 14);
  // selfie image: Mo with shades, flexing
  const iy = top + 44;
  const g = ctx.createLinearGradient(0, iy, 0, iy + w);
  g.addColorStop(0, '#3A4256');
  g.addColorStop(1, '#1E2230');
  ctx.fillStyle = g;
  ctx.fillRect(0, iy, w, w);
  ctx.fillStyle = C.hero;
  rr(ctx, w / 2 - 90, iy + w * 0.55, 180, 220, 50);
  ctx.fill();
  rr(ctx, w / 2 - 62, iy + w * 0.2, 124, 150, 62);
  ctx.fill();
  ctx.fillStyle = '#0E0F13';
  rr(ctx, w / 2 - 50, iy + w * 0.33, 44, 22, 8);
  ctx.fill();
  rr(ctx, w / 2 + 6, iy + w * 0.33, 44, 22, 8);
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 6, iy + w * 0.43);
  ctx.lineTo(w / 2 + 22, iy + w * 0.415);
  ctx.stroke();
  const hy = iy + w + 34;
  heart(ctx, 52, hy, 46);
  ctx.fillStyle = C.amber;
  ctx.fill();
  ctx.fillStyle = '#F3EFE6';
  ctx.font = `34px ${FONT}`;
  ctx.fillText(`${o.likes} likes`, 96, hy + 36);
  ctx.fillStyle = '#C9CFDC';
  ctx.font = `30px ${FONT}`;
  ctx.fillText('new me', 28, hy + 100);
};

/* =====================================================================
   Act 3: Mo's new drawings (pencil, 0..1 coords)
   ===================================================================== */

/** a capsule-head portrait; extra = buns (Lia) | glasses (Theo) | cap (Dex) */
export const portrait = (extra: 'buns' | 'glasses' | 'cap' | 'none'): Stroke[] => {
  const head = smooth([[0.5, 0.18], [0.66, 0.2], [0.7, 0.36], [0.68, 0.55], [0.5, 0.6], [0.32, 0.55], [0.3, 0.36], [0.34, 0.2], [0.5, 0.18]]);
  const out: Stroke[] = [
    {pts: head},
    {pts: smooth([[0.3, 0.62], [0.24, 0.92]])},
    {pts: smooth([[0.7, 0.62], [0.76, 0.92]])},
    {pts: circle(0.43, 0.38, 0.012, 8), width: 10},
    {pts: circle(0.57, 0.38, 0.012, 8), width: 10},
    {pts: smooth([[0.42, 0.47], [0.5, 0.51], [0.58, 0.47]])},
  ];
  if (extra === 'buns') out.push({pts: circle(0.3, 0.17, 0.06)}, {pts: circle(0.7, 0.17, 0.06)});
  if (extra === 'glasses') out.push({pts: circle(0.43, 0.38, 0.045)}, {pts: circle(0.57, 0.38, 0.045)}, {pts: [[0.475, 0.38], [0.525, 0.38]]});
  if (extra === 'cap') out.push({pts: smooth([[0.3, 0.24], [0.5, 0.12], [0.7, 0.24]])}, {pts: [[0.66, 0.24], [0.86, 0.26]]});
  // light hatching for shading
  for (let i = 0; i < 6; i++) out.push({pts: [[0.63 + i * 0.008, 0.42 + i * 0.02], [0.67 + i * 0.008, 0.38 + i * 0.02]], width: 3});
  return out;
};

export const PLANT: Stroke[] = [
  {pts: smooth([[0.35, 0.9], [0.65, 0.9], [0.62, 0.7], [0.38, 0.7], [0.35, 0.9]])},
  {pts: smooth([[0.5, 0.7], [0.5, 0.5], [0.48, 0.32], [0.5, 0.15]])},
  {pts: smooth([[0.5, 0.5], [0.36, 0.42], [0.3, 0.46], [0.42, 0.52], [0.5, 0.5]])},
  {pts: smooth([[0.49, 0.36], [0.64, 0.28], [0.7, 0.32], [0.58, 0.38], [0.49, 0.36]])},
  {pts: smooth([[0.5, 0.2], [0.42, 0.12], [0.5, 0.08], [0.55, 0.14], [0.5, 0.2]])},
];

/** the grown-up version of the age-10 dragon: same pose, more confident lines + scales + bigger fire */
export const BIG_DRAGON: Stroke[] = [
  ...DRAGON.slice(0, 11),
  ...Array.from({length: 7}, (_, i) => ({pts: smooth([[0.3 + i * 0.05, 0.56 - Math.sin(i / 2) * 0.03], [0.32 + i * 0.05, 0.6 - Math.sin(i / 2) * 0.03], [0.34 + i * 0.05, 0.56 - Math.sin(i / 2) * 0.03]]), width: 4})),
  {pts: smooth([[0.9, 0.31], [0.96, 0.22], [0.99, 0.3], [1.0, 0.18], [0.98, 0.36], [0.93, 0.36]]), color: '#C8743A'},
];

/** page with a drawing + a small hand-written label at the top */
export const drawPage = (ctx: CanvasRenderingContext2D, w: number, h: number, strokes: Stroke[], label: string, p = 1, color = '#2A2A30', width = 8) => {
  drawPaper(ctx, w, h);
  ctx.fillStyle = '#5A5A66';
  ctx.font = `${Math.round(w * 0.07)}px ${FONT}`;
  ctx.fillText(label, w * 0.08, h * 0.09);
  drawStrokes(ctx, strokes, p, {x: w * 0.06, y: h * 0.12, w: w * 0.88, h: h * 0.84}, {color, width});
};
