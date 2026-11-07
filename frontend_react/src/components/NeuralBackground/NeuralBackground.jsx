import React from "react";

import { useLazyScene } from "./useLazyScene";
import "./NeuralBackground.scss";

const loadField = () =>
  import("./neuralScene").then((module) => module.createNeuralScene);

// Sparse drifting constellation fixed behind the whole page.
const NeuralBackground = () => {
  const { ref, enabled } = useLazyScene(loadField);
  if (!enabled) return null;
  return <div ref={ref} className="app__neural" aria-hidden="true" />;
};

export default NeuralBackground;
