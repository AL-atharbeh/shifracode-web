"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
type Kind = "mouse" | "touch" | "off";
const getKind = (): Kind =>
  window.matchMedia(REDUCED).matches ? "off" : window.matchMedia(FINE).matches ? "mouse" : "touch";
const subscribeKind = (cb: () => void) => {
  const mqs = [FINE, REDUCED].map((q) => window.matchMedia(q));
  mqs.forEach((mq) => mq.addEventListener("change", cb));
  return () => mqs.forEach((mq) => mq.removeEventListener("change", cb));
};

const CERULEAN = "#2fb4e6";
const ROSE = "#ff2d95";
const INK = "#0a0a0a";

// Leg layout in the body frame (x = forward, y = to the right), front to back.
const HIP_X = [7, 3, -2, -6];
const REST_X = [24, 10, -8, -22];
const REST_Y = [30, 38, 38, 30];
const UPPER = 22;
const LOWER = 25;
const STEP_TRIGGER = 15; // px a foot may lag before it steps
const STEP_TIME = 0.11; // s
// Alternating tetrapod gait: these legs move together, the other four hold.
const GROUP = [0, 1, 0, 1, 1, 0, 1, 0]; // index = side * 4 + leg (side 0 = left)

const FOLLOW_GAP = 46; // stop this far from the pointer so it never covers it
const MAX_SPEED = 560;
const IDLE_MS = 900; // pointer still this long -> turn into Abu Omar's face

type Vec = { x: number; y: number };
// Trail left behind while walking: glowing footprints + drifting code glyphs.
type Print = Vec & { age: number; color: string };
type Glyph = Vec & { vx: number; vy: number; age: number; life: number; ch: string; color: string; size: number };
const PRINT_LIFE = 0.9; // s
const GLYPH_EVERY = 16; // px travelled per glyph
const GLYPHS = "01{}</>;=";
const MAX_TRAIL = 90;
const TOUCH_STAY = 1.3; // s the face stays on a phone before the bug leaves
type Foot = Vec & { from: Vec; to: Vec; t: number; stepping: boolean };

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const angleDamp = (a: number, b: number, k: number, dt: number) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * (1 - Math.exp(-k * dt));
};

/**
 * "Code bug": a neon robot spider that drops in on a silk thread, then walks
 * after the pointer with 2-bone IK legs and an alternating tetrapod gait.
 * It leaves a trail: neon footprints where feet land and code glyphs that
 * drift off its tail and fade. When the pointer rests it cross-fades into Abu Omar's face and blinks twice.
 * On phones there is no pointer to follow, so a tap summons it instead: it
 * walks in to the finger, bursts code around the tap, blinks and fades away.
 * Skipped entirely for reduced motion.
 */
export default function CodeBug() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const kind = useSyncExternalStore<Kind>(subscribeKind, getKind, () => "off");

  useEffect(() => {
    if (kind === "off") return;
    const touch = kind === "touch";
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: w * 0.7, y: h * 0.4, seen: false, movedAt: performance.now() };
    const body = { x: w * 0.7, y: -60, heading: Math.PI / 2, vx: 0, vy: 0 };
    let mode: "hanging" | "walking" | "hidden" = touch ? "hidden" : "hanging";
    let presence = touch ? 0 : 1; // overall opacity (phones fade the bug in and out)
    let hangT = 0;
    let threadFade = 1;
    const anchorX = { v: body.x };
    let face = 0; // 0 = bug, 1 = Abu Omar's face
    let faceClock = 0;
    let feet: Foot[] = [];
    const prints: Print[] = [];
    const glyphs: Glyph[] = [];
    let travelled = 0;

    const toWorld = (lx: number, ly: number): Vec => {
      const c = Math.cos(body.heading);
      const s = Math.sin(body.heading);
      return { x: body.x + lx * c - ly * s, y: body.y + lx * s + ly * c };
    };
    const restTarget = (i: number, lead: Vec): Vec => {
      const side = i < 4 ? -1 : 1;
      const leg = i % 4;
      const p = toWorld(REST_X[leg], REST_Y[leg] * side);
      return { x: p.x + lead.x, y: p.y + lead.y };
    };
    const plantFeet = () => {
      feet = Array.from({ length: 8 }, (_, i) => {
        const p = restTarget(i, { x: 0, y: 0 });
        return { ...p, from: { ...p }, to: { ...p }, t: 1, stepping: false };
      });
    };

    const burst = (x: number, y: number) => {
      for (let i = 0; i < 10 && glyphs.length < MAX_TRAIL; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
        const v = 50 + Math.random() * 60;
        glyphs.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 10,
          age: 0,
          life: 0.8 + Math.random() * 0.5,
          ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          color: i % 3 ? CERULEAN : ROSE,
          size: 11 + Math.random() * 4,
        });
      }
      prints.push({ x, y, age: 0, color: ROSE });
    };

    // Phones: a tap summons the bug, which walks in from just off the finger.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.movedAt = performance.now();
      pointer.seen = true;
      burst(e.clientX, e.clientY);
      if (mode === "hidden") {
        const a = Math.random() * Math.PI * 2;
        body.x = Math.min(w - 30, Math.max(30, e.clientX + Math.cos(a) * 140));
        body.y = Math.min(h - 30, Math.max(30, e.clientY + Math.sin(a) * 140));
        body.heading = Math.atan2(e.clientY - body.y, e.clientX - body.x);
        body.vx = body.vy = 0;
        face = 0;
        faceClock = 0;
        threadFade = 0;
        mode = "walking";
        plantFeet();
      }
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (touch && mode === "hidden") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.movedAt = performance.now();
      if (!pointer.seen) {
        pointer.seen = true;
        if (mode === "hanging" && hangT < 0.05) anchorX.v = body.x = Math.min(w - 60, Math.max(60, e.clientX + 120));
      }
    };

    // Two-bone IK: knee placed so the leg bends outward, away from the body.
    const knee = (hip: Vec, foot: Vec, bendSign: number): Vec => {
      const dx = foot.x - hip.x;
      const dy = foot.y - hip.y;
      const d = Math.min(Math.hypot(dx, dy), UPPER + LOWER - 0.5);
      const a = Math.atan2(dy, dx);
      const cosB = (UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d);
      const b = Math.acos(Math.max(-1, Math.min(1, cosB)));
      return { x: hip.x + Math.cos(a + bendSign * b) * UPPER, y: hip.y + Math.sin(a + bendSign * b) * UPPER };
    };

    const glow = (color: string, blur: number) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
    };

    const drawBug = (alpha: number, dangling: boolean) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Legs
      glow(CERULEAN, 8);
      ctx.strokeStyle = CERULEAN;
      for (let i = 0; i < 8; i++) {
        const side = i < 4 ? -1 : 1;
        const leg = i % 4;
        const hip = toWorld(HIP_X[leg], 6 * side);
        const raw = dangling
          ? toWorld(REST_X[leg] * 0.55, REST_Y[leg] * side * 0.7 + Math.sin(hangT * 9 + i) * 2)
          : feet[i];
        // Never draw a leg longer than it is: clamp the foot to the leg's reach.
        const reach = UPPER + LOWER - 0.5;
        const len = Math.hypot(raw.x - hip.x, raw.y - hip.y);
        const foot = len > reach ? { x: hip.x + ((raw.x - hip.x) / len) * reach, y: hip.y + ((raw.y - hip.y) / len) * reach } : raw;
        const k = knee(hip, foot, side * (leg < 2 ? -1 : 1));
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(k.x, k.y);
        ctx.stroke();
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(k.x, k.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.stroke();
        ctx.fillStyle = CERULEAN;
        ctx.beginPath();
        ctx.arc(k.x, k.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Body: abdomen, thorax, head (drawn in the body frame)
      ctx.translate(body.x, body.y);
      ctx.rotate(body.heading);
      ctx.fillStyle = INK;
      ctx.strokeStyle = CERULEAN;
      ctx.lineWidth = 2;
      glow(CERULEAN, 12);
      ctx.beginPath();
      ctx.ellipse(-17, 0, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(1, 0, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // "</>" on the abdomen, neon rose eyes
      glow(ROSE, 10);
      ctx.strokeStyle = ROSE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-11, -4);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-11, 4);
      ctx.moveTo(-23, -4);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-23, 4);
      ctx.moveTo(-15, 5);
      ctx.lineTo(-19, -5);
      ctx.stroke();
      ctx.fillStyle = ROSE;
      for (const y of [-2.4, 2.4]) {
        ctx.beginPath();
        ctx.arc(14.5, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // Abu Omar: dark visor, glowing eyes and smile, red agal band.
    const drawFace = (alpha: number, blink: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(body.x, body.y);
      const s = 0.6 + 0.4 * alpha;
      ctx.scale(s, s);
      glow(CERULEAN, 18);
      ctx.fillStyle = INK;
      ctx.strokeStyle = CERULEAN;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      glow(ROSE, 8);
      ctx.strokeStyle = ROSE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -14, 17, 5, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      glow("#bff1ff", 12);
      ctx.fillStyle = "#dff8ff";
      for (const x of [-7, 7]) {
        ctx.beginPath();
        ctx.ellipse(x, -2, 3.2, 4.6 * (1 - blink * 0.9), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 5, 7, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      // Real-time motion even on slow frames (cap only guards against tab-switch jumps).
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);

      if (mode === "hanging") {
        hangT += dt;
        // Drop on the thread, then dangle until the pointer moves.
        const drop = Math.min(1, hangT / 1.3);
        const ease = 1 - Math.pow(1 - drop, 3);
        body.y = -60 + ease * (h * 0.22 + 60) + Math.sin(hangT * 2) * 4 * ease;
        body.x = anchorX.v + Math.sin(hangT * 1.4) * 6 * ease;
        body.heading = Math.PI / 2 + Math.sin(hangT * 1.4) * 0.08;
        if (pointer.seen && drop >= 1) {
          mode = "walking";
          plantFeet();
        }
      } else {
        threadFade = Math.max(0, threadFade - dt * 2.5);

        // Chase the pointer, stopping a little short of it.
        const dx = pointer.x - body.x;
        const dy = pointer.y - body.y;
        const dist = Math.hypot(dx, dy);
        const want = dist > FOLLOW_GAP ? Math.min(MAX_SPEED, (dist - FOLLOW_GAP) * 6) : 0;
        const tvx = dist ? (dx / dist) * want : 0;
        const tvy = dist ? (dy / dist) * want : 0;
        body.vx = damp(body.vx, face > 0.5 ? 0 : tvx, 7, dt);
        body.vy = damp(body.vy, face > 0.5 ? 0 : tvy, 7, dt);
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const speed = Math.hypot(body.vx, body.vy);
        if (speed > 25) body.heading = angleDamp(body.heading, Math.atan2(body.vy, body.vx), 9, dt);

        // Gait: a group may lift only while the other group is fully planted.
        const lead = { x: body.vx * 0.09, y: body.vy * 0.09 };
        for (const g of [0, 1]) {
          const otherStepping = feet.some((f, i) => GROUP[i] !== g && f.stepping);
          if (otherStepping) continue;
          const needs = feet.some((f, i) => {
            if (GROUP[i] !== g || f.stepping) return false;
            const t = restTarget(i, { x: 0, y: 0 });
            return Math.hypot(f.x - t.x, f.y - t.y) > STEP_TRIGGER;
          });
          if (!needs) continue;
          feet.forEach((f, i) => {
            if (GROUP[i] !== g) return;
            f.from = { x: f.x, y: f.y };
            f.to = restTarget(i, lead);
            f.t = 0;
            f.stepping = true;
          });
          break;
        }
        // Safety net: a foot left out of reach (fast moves) steps at once, out of turn.
        feet.forEach((f, i) => {
          if (f.stepping) return;
          const side = i < 4 ? -1 : 1;
          const hip = toWorld(HIP_X[i % 4], 6 * side);
          if (Math.hypot(f.x - hip.x, f.y - hip.y) > (UPPER + LOWER) * 0.97) {
            f.from = { x: f.x, y: f.y };
            f.to = restTarget(i, lead);
            f.t = 0.4; // start part-way so it catches up quickly
            f.stepping = true;
          }
        });
        for (const f of feet) {
          if (!f.stepping) continue;
          f.t = Math.min(1, f.t + dt / STEP_TIME);
          const e = f.t * f.t * (3 - 2 * f.t);
          f.x = f.from.x + (f.to.x - f.from.x) * e;
          f.y = f.from.y + (f.to.y - f.from.y) * e;
          if (f.t >= 1) {
            f.stepping = false;
            if (speed > 40 && prints.length < MAX_TRAIL)
              prints.push({ x: f.x, y: f.y, age: 0, color: Math.random() < 0.25 ? ROSE : CERULEAN });
          }
        }

        // Code glyphs shed from the tail, drifting outward and up.
        travelled += speed * dt;
        while (travelled > GLYPH_EVERY) {
          travelled -= GLYPH_EVERY;
          if (glyphs.length >= MAX_TRAIL) break;
          const side = Math.random() < 0.5 ? -1 : 1;
          const tail = toWorld(-32, side * Math.random() * 8);
          const c = Math.cos(body.heading);
          const s = Math.sin(body.heading);
          const out = 18 + Math.random() * 22;
          glyphs.push({
            x: tail.x,
            y: tail.y,
            vx: -c * 14 - s * side * out,
            vy: -s * 14 + c * side * out - 10,
            age: 0,
            life: 0.9 + Math.random() * 0.6,
            ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            color: Math.random() < 0.3 ? ROSE : CERULEAN,
            size: 10 + Math.random() * 4,
          });
        }

        // Rest -> Abu Omar's face, then two blinks; any movement turns it back.
        const resting = performance.now() - pointer.movedAt > IDLE_MS && speed < 8;
        face = resting ? Math.min(1, face + dt / 0.45) : Math.max(0, face - dt / 0.25);
        faceClock = face >= 1 ? faceClock + dt : 0;
      }

      if (touch && mode === "walking") {
        // Fade in on arrival, fade out after the face has blinked.
        const leaving = faceClock > TOUCH_STAY;
        presence = leaving ? Math.max(0, presence - dt / 0.4) : Math.min(1, presence + dt / 0.2);
        if (leaving && presence === 0) mode = "hidden";
      }

      // Trail (drawn under the bug)
      ctx.save();
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        p.age += dt;
        if (p.age > PRINT_LIFE) {
          prints.splice(i, 1);
          continue;
        }
        const k = p.age / PRINT_LIFE;
        glow(p.color, 8);
        ctx.globalAlpha = (1 - k) * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * (1 - k) + 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = (1 - k) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + k * 9, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = glyphs.length - 1; i >= 0; i--) {
        const g = glyphs[i];
        g.age += dt;
        if (g.age > g.life) {
          glyphs.splice(i, 1);
          continue;
        }
        g.vx = damp(g.vx, 0, 3, dt);
        g.vy = damp(g.vy, -6, 3, dt);
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        const k = g.age / g.life;
        glow(g.color, 10);
        ctx.globalAlpha = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * 0.85;
        ctx.fillStyle = g.color;
        ctx.font = `600 ${g.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillText(g.ch, g.x, g.y);
      }
      ctx.restore();

      if (threadFade > 0) {
        ctx.save();
        ctx.globalAlpha = 0.7 * threadFade;
        ctx.strokeStyle = "#dff8ff";
        ctx.lineWidth = 1;
        glow(CERULEAN, 6);
        ctx.beginPath();
        ctx.moveTo(anchorX.v, 0);
        ctx.lineTo(body.x, body.y - 10);
        ctx.stroke();
        ctx.restore();
      }

      const blink = [0.35, 0.75].some((t) => faceClock > t && faceClock < t + 0.1) ? 1 : 0;
      if (mode !== "hidden") {
        if (face < 1) drawBug((1 - face) * presence, mode === "hanging");
        if (face > 0) drawFace(face * presence, blink);
      }

      // Phones: sleep once everything has faded, until the next tap.
      if (touch && mode === "hidden" && !prints.length && !glyphs.length) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!document.hidden) wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (!touch) wake();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind]);

  if (kind === "off") return null;
  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[99] h-full w-full" />;
}
