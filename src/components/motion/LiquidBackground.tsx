"use client";

import { useEffect, useRef } from "react";

const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

/*
 * Domain-warped fbm "liquid light" in the brand blues. The mouse pulls the
 * flow towards it and lights it up; scroll speed stirs the warp harder.
 */
const fragment = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVel;
uniform float uFade;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
  float d = length(p - m);
  float t = uTime * 0.07;

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 + vec2(5.2, 1.3) - t));
  q += (m - p) * exp(-d * 2.6) * 0.9;
  vec2 r = vec2(fbm(p * 1.4 + 2.2 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.4 + 2.2 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p * 1.4 + (2.4 + uVel) * r);

  vec3 col = mix(vec3(0.0, 0.0, 0.015), vec3(0.03, 0.07, 0.32), clamp(f * f * 2.4, 0.0, 1.0));
  col = mix(col, vec3(0.13, 0.62, 0.96), clamp(length(q) * 0.5 * f * f, 0.0, 1.0));
  col += vec3(0.0, 0.83, 0.96) * pow(clamp(r.x * f * 1.15, 0.0, 1.0), 3.0) * 0.85;

  // Thin contour lines riding the flow, like light on liquid metal.
  float c = abs(fract(f * 9.0 - t * 2.0) - 0.5);
  col += vec3(0.25, 0.55, 1.0) * smoothstep(0.03, 0.0, c) * 0.12 * f;

  col += vec3(0.18, 0.45, 1.0) * exp(-d * 3.5) * 0.22;
  col *= smoothstep(1.25, 0.15, length(uv - 0.5) * 1.35);
  col *= uFade;
  col += (hash(gl_FragCoord.xy + fract(uTime * 13.0)) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

/** Full-page fixed WebGL background that lives behind every page. */
export default function LiquidBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const gl = el.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      vel: gl.getUniformLocation(program, "uVel"),
      fade: gl.getUniformLocation(program, "uFade"),
    };

    // The flow is soft, so rendering below native resolution is invisible and much cheaper.
    const scale = window.innerWidth < 768 ? 0.45 : 0.6;
    const resize = () => {
      el.width = Math.round(window.innerWidth * scale);
      el.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(u.res, el.width, el.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const target = { x: el.width * 0.5, y: el.height * 0.55 };
    const mouse = { ...target };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX * scale;
      target.y = (window.innerHeight - e.clientY) * scale;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let lastY = window.scrollY;
    let vel = 0;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    const frame = (now: number) => {
      const y = window.scrollY;
      vel += (Math.min(Math.abs(y - lastY) / 40, 1.5) - vel) * 0.06;
      lastY = y;
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;

      // Bright over the hero, a quieter ambient glow behind the content below.
      const fade = 1 - Math.min(y / window.innerHeight, 1) * 0.62;

      gl.uniform1f(u.time, reduce ? 20 : (now - start) / 1000);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.vel, vel);
      gl.uniform1f(u.fade, fade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ width: "100vw", height: "100lvh" }}
    />
  );
}
