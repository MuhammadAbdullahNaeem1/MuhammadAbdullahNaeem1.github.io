import React, { useState, useEffect } from "react";

import { HiMenuAlt4, HiX } from "react-icons/hi";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";

import { sections } from "../../constants";
import "./Navbar.scss";

const getInitialTheme = () => {
  if (typeof document !== "undefined") {
    const current = document.documentElement.getAttribute("data-theme");
    if (current) return current;
  }
  return "light";
};

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [classFloat, setClassFloat] = useState("");
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    window.addEventListener("scroll", stickNavBar);

    return () => {
      window.removeEventListener("scroll", stickNavBar);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* ignore storage errors (private mode, etc.) */
      }
      return next;
    });
  };

  const stickNavBar = () => {
    if (window !== undefined) {
      let windowHeight = window.scrollY;
      if (windowHeight > 250) {
        setClassFloat("navbar-float");
      } else {
        setClassFloat("");
      }
    }
  };

  return (
    <nav className={`app__navbar ${classFloat}`}>
      <div className="app__navbar-logo">
        <a href="#home" onClick={() => setActive("home")}>
          Abdullah
        </a>
      </div>
      <ul className="app__navbar-links">
        {sections.map((item) => (
            <li
              key={`link-${item}`}
              className={`app__flex p-text ${active === item ? "active" : ""}`}
            >
              <a href={`#${item}`} onClick={() => setActive(item)}>
                {item}
              </a>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="app__navbar-theme"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        {theme === "dark" ? <FiSun /> : <FiMoon />}
      </button>

      <div className="app__navbar-menu">
        <HiMenuAlt4 onClick={() => setToggle(true)} />
        {toggle && (
          <motion.div
            whileInView={{ x: [300, 0] }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <HiX onClick={() => setToggle(false)} />
            <ul>
              {sections.map((item) => (
                <li key={item}>
                  <a href={`#${item}`} onClick={() => setToggle(false)}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
