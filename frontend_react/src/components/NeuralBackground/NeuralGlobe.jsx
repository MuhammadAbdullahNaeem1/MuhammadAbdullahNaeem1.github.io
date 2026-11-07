import React from "react";

import { useLazyScene } from "./useLazyScene";
import "./NeuralGlobe.scss";

const loadGlobe = () =>
  import("./globeScene").then((module) => module.createGlobeScene);

// The hero's rotating network globe, sitting behind the illustration.
const NeuralGlobe = () => {
  const { ref, enabled } = useLazyScene(loadGlobe);
  if (!enabled) return null;
  return <div ref={ref} className="app__globe" aria-hidden="true" />;
};

export default NeuralGlobe;
