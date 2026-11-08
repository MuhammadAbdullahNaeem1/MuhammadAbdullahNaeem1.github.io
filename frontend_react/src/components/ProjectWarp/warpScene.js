// Opening transition for a project: the clicked card dissolves into glowing
// particles that sweep across the screen on gentle arcs, with short motion
// streaks, and trace the outline (and header rule) of the modal that appears
// where they land. The outline glows briefly, then fades.
//
// All motion is computed in the vertex shader from a single time uniform, so
// the CPU only ticks a clock. The renderer and canvas are created once and
// reused; between transitions the canvas is hidden and nothing renders.
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineSegments,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
} from "three";

import { createRenderer, isCompact, readPalette } from "../NeuralBackground/sceneKit";

const FLIGHT_MS = 540; // one particle's trip
const MAX_DELAY_MS = 200; // particles leave the card over this window
const TRAIL_MS = 26; // streak length, in time (short: a glint, not a hair)
const LINGER_MS = 560; // outline glow after landing

const vertexShader = `
  attribute vec2 aStart;
  attribute vec2 aEnd;
  attribute float aDelay;
  attribute float aArc;
  attribute float aTail;
  uniform float uTime;
  uniform float uFlight;
  uniform float uTrail;
  uniform float uLinger;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uLine;
  varying float vAlpha;

  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float local = uTime - aDelay;
    float t = clamp((local - aTail * uTrail) / uFlight, 0.0, 1.0);
    float e = ease(t);
    vec2 d = aEnd - aStart;
    vec2 n = normalize(vec2(-d.y, d.x) + vec2(0.0001));
    float flight = sin(3.14159265 * e);
    vec2 p = mix(aStart, aEnd, e) + n * flight * aArc;

    float appear = smoothstep(0.0, 70.0, local);
    float fade = 1.0 - smoothstep(uFlight + 60.0, uFlight + uLinger, local);
    float alpha = appear * fade;
    // Streaks only show in flight and taper to nothing at the tail; dots are
    // brightest as they settle onto the outline.
    vAlpha = uLine > 0.5
      ? alpha * flight * (1.0 - aTail) * 0.45
      : alpha * (0.7 + 0.3 * (1.0 - flight));

    gl_Position = projectionMatrix * viewMatrix * vec4(p, 0.0, 1.0);
    gl_PointSize = (uSize + 2.2 * flight) * uPixelRatio;
  }
`;

const pointFragment = `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    if (a <= 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const lineFragment = `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    if (vAlpha <= 0.004) discard;
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

let kit = null; // { host, renderer, scene, camera, pointMat, lineMat, pixelRatio }
let run = null; // { id, points, lines }

function setup() {
  const host = document.createElement("div");
  host.className = "app__warp";
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    inset: "0",
    zIndex: "1001",
    pointerEvents: "none",
    display: "none",
  });
  document.body.appendChild(host);

  const made = createRenderer(host, isCompact());
  if (!made) {
    host.remove();
    return null;
  }
  const { renderer, pixelRatio } = made;
  const uniforms = () => ({
    uTime: { value: 0 },
    uFlight: { value: FLIGHT_MS },
    uTrail: { value: TRAIL_MS },
    uLinger: { value: LINGER_MS },
    uSize: { value: isCompact() ? 2.2 : 2.6 },
    uPixelRatio: { value: pixelRatio },
    uColor: { value: new Color() },
    uLine: { value: 0 },
  });
  const material = (fragmentShader, line) => {
    const m = new ShaderMaterial({
      uniforms: uniforms(),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    m.uniforms.uLine.value = line ? 1 : 0;
    return m;
  };

  return {
    host,
    renderer,
    scene: new Scene(),
    camera: new OrthographicCamera(0, 1, 0, 1, -1, 1),
    pointMat: material(pointFragment, false),
    lineMat: material(lineFragment, true),
  };
}

// A random point on the rectangle's outline (plus, sometimes, its header rule).
function onOutline(to) {
  if (to.rule && Math.random() < 0.16) {
    return [to.x + Math.random() * to.w, to.y + to.rule];
  }
  const perimeter = 2 * (to.w + to.h);
  let s = Math.random() * perimeter;
  if (s < to.w) return [to.x + s, to.y];
  s -= to.w;
  if (s < to.h) return [to.x + to.w, to.y + s];
  s -= to.h;
  if (s < to.w) return [to.x + to.w - s, to.y + to.h];
  s -= to.w;
  return [to.x, to.y + to.h - s];
}

function buildGeometry(from, to, count) {
  const start = new Float32Array(count * 2);
  const end = new Float32Array(count * 2);
  const delay = new Float32Array(count);
  const arc = new Float32Array(count);
  const cxFrom = from.x + from.w / 2;
  const cyFrom = from.y + from.h / 2;
  const reach = Math.hypot(from.w, from.h) / 2;

  for (let i = 0; i < count; i++) {
    const sx = from.x + Math.random() * from.w;
    const sy = from.y + Math.random() * from.h;
    const [ex, ey] = onOutline(to);
    start.set([sx, sy], i * 2);
    end.set([ex, ey], i * 2);
    // The card dissolves from its centre outwards.
    const fromCentre = Math.min(1, Math.hypot(sx - cxFrom, sy - cyFrom) / (reach || 1));
    delay[i] = fromCentre * MAX_DELAY_MS * 0.7 + Math.random() * MAX_DELAY_MS * 0.3;
    const dist = Math.hypot(ex - sx, ey - sy);
    arc[i] = (Math.random() - 0.5) * Math.min(110, dist * 0.25);
  }

  const points = new BufferGeometry();
  points.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
  points.setAttribute("aStart", new Float32BufferAttribute(start, 2));
  points.setAttribute("aEnd", new Float32BufferAttribute(end, 2));
  points.setAttribute("aDelay", new Float32BufferAttribute(delay, 1));
  points.setAttribute("aArc", new Float32BufferAttribute(arc, 1));
  points.setAttribute("aTail", new Float32BufferAttribute(new Float32Array(count), 1));

  // Streaks: two vertices per particle, head (aTail 0) and tail (aTail 1).
  const dup = (src, size) => {
    const out = new Float32Array(src.length * 2);
    for (let i = 0; i < count; i++) {
      for (let k = 0; k < size; k++) {
        out[(i * 2) * size + k] = src[i * size + k];
        out[(i * 2 + 1) * size + k] = src[i * size + k];
      }
    }
    return out;
  };
  const tails = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) tails[i * 2 + 1] = 1;
  const lines = new BufferGeometry();
  lines.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 6), 3));
  lines.setAttribute("aStart", new Float32BufferAttribute(dup(start, 2), 2));
  lines.setAttribute("aEnd", new Float32BufferAttribute(dup(end, 2), 2));
  lines.setAttribute("aDelay", new Float32BufferAttribute(dup(delay, 1), 1));
  lines.setAttribute("aArc", new Float32BufferAttribute(dup(arc, 1), 1));
  lines.setAttribute("aTail", new Float32BufferAttribute(tails, 1));

  return { points, lines };
}

function finish() {
  if (!run) return;
  cancelAnimationFrame(run.id);
  kit.scene.remove(run.pointsObj, run.linesObj);
  run.points.dispose();
  run.lines.dispose();
  run = null;
  kit.renderer.clear();
  kit.host.style.display = "none";
}

/**
 * Plays the transition from the `from` rect (the clicked card, in viewport
 * pixels: { x, y, w, h }) to the `to` rect (the modal, plus `rule`: the
 * header divider's offset from its top). Returns false if WebGL is missing.
 */
export function playWarp(from, to) {
  if (!kit) kit = setup();
  if (!kit) return false;
  finish();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const { renderer, camera, scene, pointMat, lineMat, host } = kit;
  host.style.display = "block";
  renderer.setSize(w, h);
  camera.right = w;
  camera.bottom = h;
  camera.updateProjectionMatrix();

  // Dark mode: the accent as is. Light mode: lifted towards white so it still
  // glows on the dimmed page.
  const palette = readPalette();
  const color = palette.color.clone();
  if (!palette.dark) color.lerp(new Color(1, 1, 1), 0.35);
  pointMat.uniforms.uColor.value.copy(color);
  lineMat.uniforms.uColor.value.copy(color);

  const count = isCompact() ? 420 : 900;
  const { points, lines } = buildGeometry(from, to, count);
  const pointsObj = new Points(points, pointMat);
  const linesObj = new LineSegments(lines, lineMat);
  pointsObj.frustumCulled = false;
  linesObj.frustumCulled = false;
  scene.add(linesObj, pointsObj);

  const total = MAX_DELAY_MS + FLIGHT_MS + LINGER_MS + 40;
  const t0 = performance.now();
  run = { id: 0, points, lines, pointsObj, linesObj };

  const tick = (now) => {
    // Dev-only: window.__warpHold = ms freezes the transition at that moment
    // (for checking frames); removed from production builds.
    const hold = import.meta.env.DEV ? window.__warpHold : undefined;
    const elapsed = hold ?? now - t0;
    pointMat.uniforms.uTime.value = elapsed;
    lineMat.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
    if (hold === undefined && elapsed >= total) {
      finish();
      return;
    }
    run.id = requestAnimationFrame(tick);
  };
  run.id = requestAnimationFrame(tick);
  // Dev-only: render the frame at `ms` on demand, for checking the look.
  if (import.meta.env.DEV) {
    window.__warpRenderAt = (ms) => {
      if (!run) return false;
      pointMat.uniforms.uTime.value = ms;
      lineMat.uniforms.uTime.value = ms;
      renderer.render(scene, camera);
      return true;
    };
  }
  return true;
}

/** Cuts a running transition short (e.g. the modal closed mid-way). */
export function stopWarp() {
  if (kit) finish();
}
