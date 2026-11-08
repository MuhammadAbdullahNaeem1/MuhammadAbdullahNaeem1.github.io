// The hero's rotating network globe: nodes clustered on a sphere, linked to
// their nearest neighbours, with the far side fading out for depth.
//
// Cheap by design: the node layout and every link are computed once, and the
// globe then turns as a single object, so a frame is just a rotation and a
// draw. It renders only while the hero is on screen.
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

const RADIUS = 1;
const MAX_NEIGHBOURS = 4;

const globeLook = (palette) => ({
  pointOpacity: palette.dark ? 0.95 : 0.9,
  lineOpacity: palette.dark ? 0.5 : 0.3,
  halo: palette.dark ? 1 : 0.6,
});

// Gentle density variation over the sphere: enough to keep the mesh from
// looking machine-perfect, never enough to open visible holes.
function density(x, y, z) {
  const n =
    Math.sin(2.3 * x + 0.7) + Math.sin(2.9 * y + 1.9) + Math.sin(3.3 * z + 0.2);
  return (n + 3) / 6; // 0..1
}

// Evenly spaced points (a Fibonacci sphere) with a little jitter, so the
// globe reads as complete all the way round. Random placement alone leaves
// clumps and gaps.
function buildNodes(count) {
  const nodes = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y0 = 1 - ((i + 0.5) / count) * 2;
    const theta0 = golden * i;
    const y = Math.max(-1, Math.min(1, y0 + (Math.random() - 0.5) * 0.04));
    const theta = theta0 + (Math.random() - 0.5) * 0.15;
    const r = Math.sqrt(1 - y * y);
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    if (Math.random() < 0.72 + 0.28 * density(x, y, z)) {
      nodes.push([x * RADIUS, y * RADIUS, z * RADIUS]);
    }
  }
  return nodes;
}

// Each node links to its few nearest neighbours within reach (computed once).
function buildLinks(nodes, reach) {
  const reachSq = reach * reach;
  const seen = new Set();
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    const near = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const dz = nodes[i][2] - nodes[j][2];
      const dSq = dx * dx + dy * dy + dz * dz;
      if (dSq < reachSq) near.push([j, dSq]);
    }
    near.sort((a, b) => a[1] - b[1]);
    for (let k = 0; k < Math.min(MAX_NEIGHBOURS, near.length); k++) {
      const j = near[k][0];
      const key = i < j ? i * 100000 + j : j * 100000 + i;
      if (!seen.has(key)) {
        seen.add(key);
        links.push([i, j, 1 - Math.sqrt(near[k][1]) / reach]);
      }
    }
  }
  return links;
}

export function createGlobeScene(host) {
  const compact = isCompact();
  const made = createRenderer(host, compact);
  if (!made) return () => {};
  const { renderer, pixelRatio } = made;

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.z = 3.2;
  const globe = new Group();
  scene.add(globe);

  const nodes = buildNodes(compact ? 300 : 420);
  const links = buildLinks(nodes, compact ? 0.3 : 0.26);

  const positions = new Float32Array(nodes.length * 3);
  const phases = new Float32Array(nodes.length);
  const speeds = new Float32Array(nodes.length);
  nodes.forEach((n, i) => {
    positions.set(n, i * 3);
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.0;
  });

  const linePositions = new Float32Array(links.length * 6);
  const lineAlphas = new Float32Array(links.length * 2);
  links.forEach(([a, b, strength], i) => {
    linePositions.set(nodes[a], i * 6);
    linePositions.set(nodes[b], i * 6 + 3);
    const alpha = 0.35 + 0.65 * strength;
    lineAlphas[i * 2] = alpha;
    lineAlphas[i * 2 + 1] = alpha;
  });

  let palette = readPalette();
  let look = globeLook(palette);

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
      uSize: { value: compact ? 5.5 : 6.5 },
      uPixelRatio: { value: pixelRatio },
      uDepthFade: { value: 1 },
      uRadius: { value: RADIUS },
      ...focusUniforms(),
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  globe.add(new Points(pointGeometry, pointMaterial));

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("alpha", new BufferAttribute(lineAlphas, 1));
  const lineMaterial = new ShaderMaterial({
    ...linkShader,
    uniforms: {
      uColor: { value: palette.color.clone() },
      uOpacity: { value: look.lineOpacity },
      uDepthFade: { value: 1 },
      uRadius: { value: RADIUS },
      ...focusUniforms(),
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  globe.add(new LineSegments(lineGeometry, lineMaterial));

  // Data pulses: bright points that travel along links and hop to a
  // neighbouring link at each node, like signals moving through the network.
  // Only a couple of dozen points, moved a short step per frame.
  const neighbours = nodes.map(() => []);
  links.forEach(([a, b]) => {
    neighbours[a].push(b);
    neighbours[b].push(a);
  });
  const pulseCount = compact ? 14 : 24;
  const randomNode = () => Math.floor(Math.random() * nodes.length);
  const nextPulse = (prev) => {
    let from = prev && prev.hops < 6 ? prev.to : randomNode();
    if (!neighbours[from].length) from = randomNode();
    const options = neighbours[from];
    const to = options.length ? options[Math.floor(Math.random() * options.length)] : from;
    return {
      from,
      to,
      t: prev ? 0 : Math.random(),
      speed: 0.012 + Math.random() * 0.012,
      hops: prev && prev.hops < 6 ? prev.hops + 1 : 0,
    };
  };
  const pulses = Array.from({ length: pulseCount }, () => nextPulse(null));
  const pulsePositions = new Float32Array(pulseCount * 3);
  const pulseGeometry = new BufferGeometry();
  pulseGeometry.setAttribute("position", new BufferAttribute(pulsePositions, 3));
  // Phase π/2 with zero speed holds the shared twinkle at full brightness.
  pulseGeometry.setAttribute(
    "aPhase",
    new BufferAttribute(new Float32Array(pulseCount).fill(Math.PI / 2), 1)
  );
  pulseGeometry.setAttribute(
    "aSpeed",
    new BufferAttribute(new Float32Array(pulseCount), 1)
  );
  const pulseMaterial = new ShaderMaterial({
    ...starShader,
    uniforms: {
      uColor: { value: palette.color.clone() },
      uOpacity: { value: 1 },
      uHalo: { value: look.halo },
      uTime: { value: 0 },
      uSize: { value: compact ? 8 : 10 },
      uPixelRatio: { value: pixelRatio },
      uDepthFade: { value: 1 },
      uRadius: { value: RADIUS },
      ...focusUniforms(),
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  globe.add(new Points(pulseGeometry, pulseMaterial));

  // Icon focus: hovering one of the hero's tech icons brightens the side of
  // the globe facing it.
  const header = host.closest(".app__header");
  const icons = header ? [...header.querySelectorAll(".circle-cmp")] : [];
  const focusDir = pointMaterial.uniforms.uFocusDir.value;
  const focusTarget = focusDir.clone();
  let focusAmount = 0;
  let focusWanted = 0;
  const iconHandlers = icons.map((icon) => {
    const enter = () => {
      const g = host.getBoundingClientRect();
      const r = icon.getBoundingClientRect();
      const radius = g.width / 2 || 1;
      focusTarget
        .set(
          (r.left + r.width / 2 - (g.left + g.width / 2)) / radius,
          -(r.top + r.height / 2 - (g.top + g.height / 2)) / radius,
          0.75
        )
        .normalize();
      focusWanted = 1;
    };
    const leave = () => {
      focusWanted = 0;
    };
    icon.addEventListener("pointerenter", enter);
    icon.addEventListener("pointerleave", leave);
    return { icon, enter, leave };
  });

  const applyTheme = () => {
    palette = readPalette();
    look = globeLook(palette);
    pointMaterial.uniforms.uColor.value.copy(palette.color);
    pointMaterial.uniforms.uOpacity.value = look.pointOpacity;
    pointMaterial.uniforms.uHalo.value = look.halo;
    lineMaterial.uniforms.uColor.value.copy(palette.color);
    lineMaterial.uniforms.uOpacity.value = look.lineOpacity;
    pulseMaterial.uniforms.uColor.value.copy(palette.color);
    pulseMaterial.uniforms.uHalo.value = look.halo;
    [pointMaterial, lineMaterial, pulseMaterial].forEach((m) => {
      m.blending = palette.blending;
      m.needsUpdate = true;
    });
    renderer.render(scene, camera);
  };

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  // Slight tilt toward the cursor on top of the steady spin.
  let targetX = 0;
  let targetY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let spin = 0;
  const onPointerMove = (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const frame = (dt, seconds) => {
    spin += 0.0045 * dt; // about one turn every 23 seconds
    const ease = 1 - Math.pow(1 - 0.05, dt);
    tiltX += (targetX - tiltX) * ease;
    tiltY += (targetY - tiltY) * ease;
    globe.rotation.y = spin + tiltX * 0.3;
    globe.rotation.x = 0.32 + tiltY * 0.15;
    pointMaterial.uniforms.uTime.value = seconds;

    for (let i = 0; i < pulseCount; i++) {
      let p = pulses[i];
      p.t += p.speed * dt;
      if (p.t >= 1) {
        p = nextPulse(p);
        pulses[i] = p;
      }
      const a = nodes[p.from];
      const b = nodes[p.to];
      pulsePositions[i * 3] = a[0] + (b[0] - a[0]) * p.t;
      pulsePositions[i * 3 + 1] = a[1] + (b[1] - a[1]) * p.t;
      pulsePositions[i * 3 + 2] = a[2] + (b[2] - a[2]) * p.t;
    }
    pulseGeometry.attributes.position.needsUpdate = true;

    const focusEase = 1 - Math.pow(1 - 0.12, dt);
    focusAmount += (focusWanted - focusAmount) * focusEase;
    focusDir.lerp(focusTarget, focusEase).normalize();
    [pointMaterial, lineMaterial].forEach((m) => {
      m.uniforms.uFocusAmt.value = focusAmount;
      m.uniforms.uFocusDir.value.copy(focusDir);
    });

    renderer.render(scene, camera);
  };

  // Only while the hero is in view and the tab is visible.
  let onScreen = true;
  const loop = createFrameLoop({
    canRun: () => onScreen && !document.hidden && !pageCovered(),
    frame,
  });
  // Dev-only frame-rate readout for testing; removed from production builds.
  if (import.meta.env.DEV) {
    window.__neuralStats = { ...window.__neuralStats, globe: loop.getStats };
  }

  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    loop.start();
  });
  visibility.observe(host);
  const sizeWatcher = new ResizeObserver(resize);
  sizeWatcher.observe(host);
  const stopWatchingTheme = watchTheme(applyTheme);
  const onVisibilityChange = () => loop.start();
  const onContextLost = (e) => {
    e.preventDefault();
    loop.stop();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener(PAGE_COVER_EVENT, onVisibilityChange);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  resize();
  frame(1, performance.now() / 1000);
  loop.start();

  return () => {
    loop.stop();
    visibility.disconnect();
    sizeWatcher.disconnect();
    stopWatchingTheme();
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener(PAGE_COVER_EVENT, onVisibilityChange);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    iconHandlers.forEach(({ icon, enter, leave }) => {
      icon.removeEventListener("pointerenter", enter);
      icon.removeEventListener("pointerleave", leave);
    });
    pulseGeometry.dispose();
    pulseMaterial.dispose();
    pointGeometry.dispose();
    lineGeometry.dispose();
    pointMaterial.dispose();
    lineMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
