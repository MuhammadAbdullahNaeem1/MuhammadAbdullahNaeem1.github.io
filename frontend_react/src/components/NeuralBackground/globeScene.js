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
  isCompact,
  linkShader,
  readPalette,
  starShader,
  watchTheme,
} from "./sceneKit";

const RADIUS = 1;
const MAX_NEIGHBOURS = 4;

const globeLook = (palette) => ({
  pointOpacity: palette.dark ? 0.95 : 0.85,
  lineOpacity: palette.dark ? 0.5 : 0.32,
  halo: palette.dark ? 1 : 0,
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
    },
    transparent: true,
    depthWrite: false,
    blending: palette.blending,
  });
  globe.add(new LineSegments(lineGeometry, lineMaterial));

  const applyTheme = () => {
    palette = readPalette();
    look = globeLook(palette);
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
    renderer.render(scene, camera);
  };

  // Only while the hero is in view and the tab is visible.
  let onScreen = true;
  const loop = createFrameLoop({
    canRun: () => onScreen && !document.hidden,
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
