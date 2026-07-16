import React from "react";

import {
  About,
  Certifications,
  Contact,
  Header,
  Skills,
  Work,
} from "./containers";

import { Navbar, Footer } from "./components";
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
      
    </div>
  );
};

export default App;
