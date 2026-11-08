// The site-wide background: a sparse, drifting constellation behind every
// section. Deliberately quiet; the hero globe is the focal point.
//
// - Stars near a mouse cursor drift toward it and link to it (mouse and
//   trackpad only; touch screens have no hovering cursor).
// - On load the stars fly in from scattered positions and settle (~1.3s).
//
// One viewport-sized canvas, fixed behind the page, so drawing cost depends
// on screen size and never on how long the page is.
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
} from "three";

import {
  createFrameLoop,
  createRenderer,
  focusUniforms,
  isCompact,
  pageCovered,
  PAGE_COVER_EVENT,
  linkShader,
  readPalette,
  starShader,
  watchTheme,
} from "./sceneKit";

const FOV = 50;
const CAMERA_Z = 20;
const DEPTH = 3; // nodes drift ±DEPTH on z for a little parallax depth
const SCROLL_PARALLAX = 0.25; // field moves at a quarter of the scroll speed
const ASSEMBLY_MS = 1300;
const CURSOR_REACH = 0.32; // as a share of the screen's half-height
const CURSOR_PULL = 0.0009;

const fieldLook = (palette) => ({
  // Light mode: indigo on white has no additive glow, so the dots carry a bit
  // more opacity and a gentler tinted halo; links stay faint to keep it airy.
  pointOpacity: palette.dark ? 0.8 : 0.9,
  lineOpacity: palette.dark ? 0.38 : 0.26,
  halo: palette.dark ? 1 : 0.6,
});

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

export function createNeuralScene(host) {
  const compact = isCompact();
  const made = createRenderer(host, compact);
  if (!made) return () => {};
  const { renderer, pixelRatio } = made;
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;
  const group = new Group();
  scene.add(group);

  // Visible half-extents of the z=0 plane; recomputed on resize.
  let halfH = 1;
  let halfW = 1;
  let viewportW = 1;
  let viewportH = 1;
  const computeBounds = (w, h) => {
    halfH = Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
    halfW = halfH * (w / h);
    viewportW = w;
    viewportH = h;
  };
  computeBounds(
    host.clientWidth || window.innerWidth,
    host.clientHeight || window.innerHeight
  );

  // Sparse on purpose: a few dozen stars per screen, occasionally linked.
  const area =
    (host.clientWidth || window.innerWidth) *
    (host.clientHeight || window.innerHeight);
  const count = compact
    ? 22
    : Math.round(Math.min(44, Math.max(26, area / 34000)));

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3); // steady drift
  const pull = new Float32Array(count * 2); // extra x/y velocity from the cursor
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * halfW;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * DEPTH;
    velocities[i * 3] = (Math.random() * 2 - 1) * 0.012;
    velocities[i * 3 + 1] = (Math.random() * 2 - 1) * 0.012;
    velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.004;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.0;
  }

  // Load assembly: every star starts far away and behind, and eases home.
  const home = positions.slice();
  const scattered = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spread = 1.6 + Math.random() * 1.2;
    scattered[i * 3] = home[i * 3] + Math.cos(angle) * halfW * spread;
    scattered[i * 3 + 1] = home[i * 3 + 1] + Math.sin(angle) * halfH * spread;
    scattered[i * 3 + 2] = -12 - Math.random() * 10;
  }
  positions.set(scattered);
  let assemblyStart = 0; // set on the first rendered frame

  let palette = readPalette();
  let look = fieldLook(palette);

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  pointGeometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  pointGeometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
  const pointMaterial = new ShaderMaterial({
    ...starShader,
    uniforms: {
      uColor: { value: palette.color.clone() },
      uOpacity: { value: look.pointOpacity },
      uHalo: { value: look.halo },
      uTime: { value: 0 },
      uSize: { value: compact ? 7 : 8 },
      uPixelRatio: { value: pixelRatio },
      uDepthFade: { value: 0 },
      uRadius: { value: 1 },
      ...focusUniforms(),
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  group.add(new Points(pointGeometry, pointMaterial));

  // Star-to-star links, plus up to one link per star to the cursor.
  const maxSegments = (count * (count - 1)) / 2 + count;
  const linePositions = new Float32Array(maxSegments * 6);
  const lineAlphas = new Float32Array(maxSegments * 2);
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("alpha", new BufferAttribute(lineAlphas, 1));
  const lineMaterial = new ShaderMaterial({
    ...linkShader,
    uniforms: {
      uColor: { value: palette.color.clone() },
      uOpacity: { value: look.lineOpacity },
      uDepthFade: { value: 0 },
      uRadius: { value: 1 },
      ...focusUniforms(),
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  group.add(new LineSegments(lineGeometry, lineMaterial));

  const applyTheme = () => {
    palette = readPalette();
    look = fieldLook(palette);
    pointMaterial.uniforms.uColor.value.copy(palette.color);
    pointMaterial.uniforms.uOpacity.value = look.pointOpacity;
    pointMaterial.uniforms.uHalo.value = look.halo;
    lineMaterial.uniforms.uColor.value.copy(palette.color);
    lineMaterial.uniforms.uOpacity.value = look.lineOpacity;
    pointMaterial.blending = palette.blending;
    lineMaterial.blending = palette.blending;
    pointMaterial.needsUpdate = true;
    lineMaterial.needsUpdate = true;
    renderer.render(scene, camera);
  };

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    const sx = halfW;
    const sy = halfH;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    computeBounds(w, h);
    // Stretch existing nodes into the new bounds rather than re-seeding.
    for (let i = 0; i < count; i++) {
      positions[i * 3] *= halfW / sx;
      positions[i * 3 + 1] *= halfH / sy;
      home[i * 3] *= halfW / sx;
      home[i * 3 + 1] *= halfH / sy;
    }
  };

  // Cursor: drives the gentle tilt, and (with a mouse) the attraction.
  let targetX = 0;
  let targetY = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let cursorClientX = 0;
  let cursorClientY = 0;
  let cursorInside = false;
  const onPointerMove = (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = (e.clientY / window.innerHeight) * 2 - 1;
    if (e.pointerType === "mouse") {
      cursorClientX = e.clientX;
      cursorClientY = e.clientY;
      cursorInside = true;
    }
  };
  const onPointerLeave = () => {
    cursorInside = false;
  };

  // Scroll parallax: the field drifts with the page, slower than the content.
  let lastScrollY = window.scrollY;
  let pendingScroll = 0;
  const onScroll = () => {
    pendingScroll += window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
  };

  const bounce = (index, limit, vel) => {
    if (positions[index] > limit) {
      positions[index] = limit;
      vel[index] = -Math.abs(vel[index]);
    } else if (positions[index] < -limit) {
      positions[index] = -limit;
      vel[index] = Math.abs(vel[index]);
    }
  };

  const frame = (dt, seconds) => {
    const nowMs = seconds * 1000;
    if (!assemblyStart) assemblyStart = nowMs;
    const assembly = Math.min(1, (nowMs - assemblyStart) / ASSEMBLY_MS);
    const assembling = assembly < 1;

    const scrollShift =
      pendingScroll * ((2 * halfH) / viewportH) * SCROLL_PARALLAX;
    pendingScroll = 0;

    // Cursor position on the field's plane (world units).
    const reach = halfH * CURSOR_REACH;
    const cursorActive = hasMouse && cursorInside && !assembling;
    const cursorX = (cursorClientX / viewportW) * 2 * halfW - halfW;
    const cursorY = halfH - (cursorClientY / viewportH) * 2 * halfH;

    if (assembling) {
      const e = easeOutCubic(assembly);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = scattered[i] + (home[i] - scattered[i]) * e;
      }
    } else {
      const damping = Math.pow(0.96, dt);
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const px = i * 2;

        if (cursorActive) {
          const dx = cursorX - positions[ix];
          const dy = cursorY - positions[ix + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < reach && dist > 0.4) {
            pull[px] += (dx / dist) * CURSOR_PULL * dt;
            pull[px + 1] += (dy / dist) * CURSOR_PULL * dt;
          }
        }
        pull[px] *= damping;
        pull[px + 1] *= damping;

        positions[ix] += (velocities[ix] + pull[px]) * dt;
        positions[ix + 1] +=
          (velocities[ix + 1] + pull[px + 1]) * dt + scrollShift;
        positions[ix + 2] += velocities[ix + 2] * dt;

        // Scrolling wraps nodes around vertically so the field never empties;
        // normal drift bounces off the edges.
        if (scrollShift !== 0) {
          if (positions[ix + 1] > halfH) positions[ix + 1] -= 2 * halfH;
          else if (positions[ix + 1] < -halfH) positions[ix + 1] += 2 * halfH;
        }
        bounce(ix, halfW, velocities);
        bounce(ix + 1, halfH, velocities);
        bounce(ix + 2, DEPTH, velocities);
      }
    }
    pointGeometry.attributes.position.needsUpdate = true;
    pointMaterial.uniforms.uTime.value = seconds;

    // Link pairs closer than the threshold, measured off the shorter side so
    // tall phone screens don't link everything across their width.
    const threshold = Math.min(halfH * 0.42, halfW * 0.75);
    const thresholdSq = threshold * threshold;
    let segment = 0;
    for (let a = 0; a < count; a++) {
      const ax = positions[a * 3];
      const ay = positions[a * 3 + 1];
      const az = positions[a * 3 + 2];
      for (let b = a + 1; b < count; b++) {
        const dx = ax - positions[b * 3];
        const dy = ay - positions[b * 3 + 1];
        const dz = az - positions[b * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < thresholdSq) {
          const o = segment * 6;
          linePositions[o] = ax;
          linePositions[o + 1] = ay;
          linePositions[o + 2] = az;
          linePositions[o + 3] = positions[b * 3];
          linePositions[o + 4] = positions[b * 3 + 1];
          linePositions[o + 5] = positions[b * 3 + 2];
          const strength = Math.pow(1 - Math.sqrt(distSq) / threshold, 1.4);
          lineAlphas[segment * 2] = strength;
          lineAlphas[segment * 2 + 1] = strength;
          segment++;
        }
      }
      if (cursorActive) {
        const cx = ax - cursorX;
        const cy = ay - cursorY;
        const dist = Math.sqrt(cx * cx + cy * cy);
        if (dist < reach) {
          const o = segment * 6;
          linePositions[o] = ax;
          linePositions[o + 1] = ay;
          linePositions[o + 2] = az;
          linePositions[o + 3] = cursorX;
          linePositions[o + 4] = cursorY;
          linePositions[o + 5] = 0;
          const strength = Math.min(1, Math.pow(1 - dist / reach, 1.2) * 1.3);
          lineAlphas[segment * 2] = strength;
          lineAlphas[segment * 2 + 1] = strength;
          segment++;
        }
      }
    }
    lineGeometry.setDrawRange(0, segment * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.alpha.needsUpdate = true;

    const ease = 1 - Math.pow(1 - 0.04, dt);
    parallaxX += (targetX - parallaxX) * ease;
    parallaxY += (targetY - parallaxY) * ease;
    group.rotation.y = parallaxX * 0.08;
    group.rotation.x = parallaxY * 0.05;

    renderer.render(scene, camera);
  };

  const loop = createFrameLoop({
    canRun: () => !document.hidden && !pageCovered(),
    frame,
  });
  // Dev-only frame-rate readout for testing; removed from production builds.
  if (import.meta.env.DEV) {
    window.__neuralStats = { ...window.__neuralStats, field: loop.getStats };
  }

  const sizeWatcher = new ResizeObserver(resize);
  sizeWatcher.observe(host);
  const stopWatchingTheme = watchTheme(applyTheme);
  const onVisibilityChange = () => loop.start();
  const onContextLost = (e) => {
    e.preventDefault();
    loop.stop();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("blur", onPointerLeave);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener(PAGE_COVER_EVENT, onVisibilityChange);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  resize();
  loop.start();

  return () => {
    loop.stop();
    sizeWatcher.disconnect();
    stopWatchingTheme();
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("blur", onPointerLeave);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener(PAGE_COVER_EVENT, onVisibilityChange);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    pointGeometry.dispose();
    lineGeometry.dispose();
    pointMaterial.dispose();
    lineMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
