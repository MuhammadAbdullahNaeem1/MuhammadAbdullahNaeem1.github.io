// Pieces shared by the background field and the hero globe: renderer setup,
// theme colours, the star/link shaders and a frame-capped render loop.
import {
  AdditiveBlending,
  Color,
  NormalBlending,
  Vector3,
  WebGLRenderer,
} from "three";

/** Phones get lighter scenes: fewer nodes, lower resolution, lower fps. */
export const isCompact = () => window.innerWidth < 700;

/**
 * Creates a transparent renderer inside `host`. Resolution is capped (1.5x
 * desktop, 1.25x phones) because these are background visuals, not detail.
 * Returns null when WebGL is unavailable so callers can bail out quietly.
 */
export function createRenderer(host, compact) {
  let renderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  return { renderer, pixelRatio };
}

/**
 * Dark mode uses the purple accent with additive glow; light mode uses the
 * site's text colour (near-black), which reads clearly on the pale background.
 */
export function readPalette() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const dark = root.getAttribute("data-theme") === "dark";
  const tone = dark
    ? styles.getPropertyValue("--secondary-color").trim() || "#8b93ff"
    : styles.getPropertyValue("--black-color").trim() || "#030303";
  return {
    dark,
    color: new Color(tone),
    blending: dark ? AdditiveBlending : NormalBlending,
  };
}

/** Uniforms every star/link material needs for the focus effect (off). */
export const focusUniforms = () => ({
  uFocusAmt: { value: 0 },
  uFocusDir: { value: new Vector3(0, 0, 1) },
});

/** Calls `onChange` whenever the site's theme toggle flips data-theme. */
export function watchTheme(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

// Stars: a crisp core, a gentle twinkle and a rare brief sparkle. The glow
// halo (uHalo) is on in dark mode only; a dark halo on a light page smudges.
// uDepthFade dims the far side of a 3D object (the globe); the flat
// background field leaves it at 0. uFocusAmt/uFocusDir brighten the part of
// the globe facing a direction (used when a tech icon is hovered); the field
// leaves uFocusAmt at 0.
export const starShader = {
  vertexShader: `
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    uniform float uOpacity;
    uniform float uDepthFade;
    uniform float uRadius;
    uniform float uFocusAmt;
    uniform vec3 uFocusDir;
    varying float vAlpha;
    varying float vSparkle;
    varying float vFocus;
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      float front = 0.5 + 0.5 * clamp(world.z / uRadius, -1.0, 1.0);
      float depth = mix(1.0, 0.15 + 0.85 * front, uDepthFade);
      float twinkle = 0.72 + 0.28 * sin(uTime * aSpeed + aPhase);
      float sparkle = pow(max(0.0, sin(uTime * aSpeed * 0.35 + aPhase * 1.7)), 40.0);
      float focus = uFocusAmt * uDepthFade *
        smoothstep(0.78, 0.97, dot(normalize(world.xyz), uFocusDir));
      vSparkle = sparkle;
      vFocus = focus;
      vAlpha = min(1.0, (uOpacity * twinkle + sparkle * 0.55 + focus * 0.9) * depth + focus * 0.3);
      gl_Position = projectionMatrix * viewMatrix * world;
      gl_PointSize = uSize * uPixelRatio * (1.0 + 0.55 * sparkle + 1.2 * focus);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uHalo;
    varying float vAlpha;
    varying float vSparkle;
    varying float vFocus;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float core = smoothstep(0.24, 0.14, d);
      float halo = smoothstep(0.5, 0.0, d) * uHalo * (0.25 + 0.75 * max(vSparkle, vFocus));
      float a = (core + halo) * vAlpha;
      if (a <= 0.003) discard;
      gl_FragColor = vec4(uColor, a);
    }
  `,
};

// Links fade with their per-vertex alpha (distance) and, on the globe, depth;
// they also brighten under the same focus as the stars.
export const linkShader = {
  vertexShader: `
    attribute float alpha;
    uniform float uDepthFade;
    uniform float uRadius;
    uniform float uFocusAmt;
    uniform vec3 uFocusDir;
    varying float vAlpha;
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      float front = 0.5 + 0.5 * clamp(world.z / uRadius, -1.0, 1.0);
      float focus = uFocusAmt * uDepthFade *
        smoothstep(0.78, 0.97, dot(normalize(world.xyz), uFocusDir));
      vAlpha = min(1.0, alpha * mix(1.0, 0.1 + 0.9 * front, uDepthFade) + focus * 0.8);
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
      gl_FragColor = vec4(uColor, vAlpha * uOpacity);
    }
  `,
};

// Adaptive frame-rate tuning. A decorative background may use at most this
// share of each display refresh on the main thread; above it, or when frames
// start arriving late, the loop renders less often so scrolling and clicks
// keep priority. It never drops below MIN_FPS.
const WORK_BUDGET_SHARE = 0.25;
const MIN_FPS = 30;
const WARMUP_FRAMES = 60; // ignore the first second: shader compile, page load
const RECOVER_AFTER_MS = 3000; // sustained headroom before stepping back up

/**
 * A render loop that matches the display's refresh rate (60, 120, 144Hz...)
 * and adapts downward under load, running only while `canRun()` is true.
 *
 * `frame(dt, seconds)` gets `dt` in 60fps frames, so motion speed is the same
 * at every frame rate. `getStats()` reports the detected refresh rate and the
 * rate actually being rendered.
 */
export function createFrameLoop({ canRun, frame }) {
  let id = 0;
  let lastTick = 0; // previous display refresh
  let lastFrame = 0; // previous refresh we actually rendered
  let tickCount = 0;
  let rendered = 0;

  // Display refresh interval, learned from the median of recent refreshes
  // (the median ignores the odd dropped frame).
  let refresh = 1000 / 60;
  const deltas = [];

  let skip = 1; // render every `skip`-th refresh; 1 = full rate
  let workAvg = 0; // smoothed main-thread cost of one frame (ms)
  let lateAvg = 0; // smoothed share of frames that arrived late
  let healthySince = 0; // when the current run of headroom began (0 = none)

  const maxSkip = () => Math.max(1, Math.round(1000 / MIN_FPS / refresh));

  const tick = (now) => {
    id = 0;
    if (!canRun()) return;
    id = requestAnimationFrame(tick);

    if (lastTick) {
      const delta = now - lastTick;
      if (delta > 3 && delta < 100) {
        deltas.push(delta);
        if (deltas.length > 60) deltas.shift();
        if (deltas.length >= 10 && tickCount % 30 === 0) {
          const sorted = [...deltas].sort((a, b) => a - b);
          refresh = sorted[sorted.length >> 1];
        }
      }
    }
    lastTick = now;
    tickCount++;
    if (tickCount % skip !== 0) return;

    const interval = lastFrame ? now - lastFrame : 0;
    // Clamped so a long stall doesn't fling anything across the screen.
    const dt = lastFrame ? Math.min(interval / (1000 / 60), 3) : 1;
    lastFrame = now;

    const started = performance.now();
    frame(dt, now / 1000);
    const work = performance.now() - started;
    rendered++;

    if (rendered <= WARMUP_FRAMES) return;

    workAvg = workAvg * 0.9 + work * 0.1;
    const late = interval > refresh * skip * 1.5 ? 1 : 0;
    lateAvg = lateAvg * 0.95 + late * 0.05;

    // Main-thread budget when rendering every `s`-th refresh. Rendering less
    // often doesn't make one frame cheaper, but it does spread that cost over
    // more time, so the allowance grows with `s`.
    const budgetAt = (s) => refresh * s * WORK_BUDGET_SHARE;

    if ((workAvg > budgetAt(skip) || lateAvg > 0.2) && skip < maxSkip()) {
      skip++; // e.g. 120 -> 60 -> 40 -> 30 fps
      healthySince = 0;
      lateAvg = 0;
    } else if (
      skip > 1 &&
      workAvg < budgetAt(skip - 1) * 0.8 && // would fit at the next rate up
      lateAvg < 0.05
    ) {
      if (!healthySince) healthySince = now;
      if (now - healthySince > RECOVER_AFTER_MS) {
        skip--;
        healthySince = now;
      }
    } else {
      healthySince = 0;
    }
  };

  return {
    start() {
      if (!id && canRun()) {
        // Resume after a pause without a jump; re-earn trust after warm-up.
        lastTick = 0;
        lastFrame = 0;
        rendered = 0;
        id = requestAnimationFrame(tick);
      }
    },
    stop() {
      if (id) cancelAnimationFrame(id);
      id = 0;
    },
    getStats() {
      return {
        displayHz: Math.round(1000 / refresh),
        renderHz: Math.round(1000 / (refresh * skip)),
        skip,
        workMs: +workAvg.toFixed(3),
      };
    },
  };
}
