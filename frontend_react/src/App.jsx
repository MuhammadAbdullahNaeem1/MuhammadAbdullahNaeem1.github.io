import React from "react";

import {
  About,
  Certifications,
  Contact,
  Header,
  Skills,
  Work,
} from "./containers";

import { Navbar, Footer, MobileNav, SocialRail } from "./components";
import NeuralBackground from "./components/NeuralBackground/NeuralBackground";
import "./App.scss";

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <Header />
      <About />
      <Work />
      <Skills />
      <Certifications />
      <Contact />
      <Footer />
      {/* After the sections on purpose: the fixed layer has to paint over
          their backgrounds (content is lifted above it in its stylesheet). */}
      <NeuralBackground />
      <SocialRail />
      <MobileNav />
    </div>
  );
};

export default App;
