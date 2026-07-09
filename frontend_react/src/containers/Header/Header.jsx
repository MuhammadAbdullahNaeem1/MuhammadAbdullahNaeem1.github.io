import React from "react";
import { motion } from "framer-motion";
import { SiDjango, SiLangchain, SiFastapi, SiPython } from "react-icons/si";
import { TbDatabaseSearch } from "react-icons/tb";
import { BiNetworkChart } from "react-icons/bi";

import { AppWrap } from "../../wrapper";
import { images } from "../../constants";
import profilePhoto from "../../assets/profile.png";
import profilePhotoDark from "../../assets/profile-dark.jpeg";
import "./Header.scss";

const scaleVariants = {
  whileInView: {
    scale: [0, 1],
    opacity: [0, 1],
  },
  transition: {
    duration: 0.5,
    ease: "easeInOut",
  },
};

const headerSkillVariants = {
  visible: {
    rotate: [-120, 0],
    y: -10,
    x: 10,
    transition: {
      rotate: { delay: 0.5, duration: 0.3, ease: "easeOut" },
      y: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeOut",
      },
      x: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 5,
        ease: "easeOut",
      },
    },
  },
  hover: {
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
  },
};

// Floating tech-stack icons. Sizes (60/92/60) match the circle sizes
// (100/150/100px), so the middle circle reads bigger on both sides.
// RAG and LangGraph have no official logos, so they use representative
// icons (retrieval = database+search, LangGraph = node graph).
const rightIcons = [
  { Icon: SiDjango, color: "#0C4B33", size: 60 }, // Django
  { Icon: SiPython, color: "#3776AB", size: 58 }, // Python
  { Icon: TbDatabaseSearch, color: "#7C3AED", size: 58 }, // RAG
];

const leftIcons = [
  { Icon: SiLangchain, color: "#1C7D73", size: 60 }, // LangChain
  { Icon: BiNetworkChart, color: "#E11D48", size: 92 }, // LangGraph
  { Icon: SiFastapi, color: "#009688", size: 58 }, // FastAPI
];

const Header = () => {
  return (
    <div className="app__header app__flex">
      <motion.div
        whileInView={{ x: [-100, 0], opacity: [0, 1] }}
        transition={{ duration: 0.5 }}
        className="app__header-info"
      >
        <div className="app__header-badge">
          <div className="badge-cmp">
            {/* Light mode uses the transparent cut-out over a soft gradient;
                dark mode swaps to the navy-backdrop version. Only one is ever
                displayed (the other is display:none via [data-theme]). */}
            <img
              className="header-photo header-photo--light"
              src={profilePhoto}
              alt="M. Abdullah Naeem"
            />
            <img
              className="header-photo header-photo--dark"
              src={profilePhotoDark}
              alt="M. Abdullah Naeem"
            />
            <p className="header-eyebrow">Hello, I am</p>
            <h1 className="header-name">M.&nbsp;Abdullah Naeem</h1>
            <span className="header-divider" />
          </div>
        </div>
      </motion.div>

      {/* Left icon column comes after the name so it flanks the image
          symmetrically with the right column. */}
      <motion.div
        variants={scaleVariants}
        whileInView={scaleVariants.whileInView}
        className="app__header-circles app__header-circles--left"
      >
        {leftIcons.map(({ Icon, color, size }, index) => (
          <motion.div
            variants={headerSkillVariants}
            whileInView="visible"
            whileHover="hover"
            drag
            dragConstraints={{ left: 10, right: 10, top: 10, bottom: 10 }}
            dragElastic={0.1}
            className="circle-cmp app__flex"
            key={`left-circle-${index}`}
          >
            <Icon color={color} size={size} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        whileInView={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="app__header-img"
      >
        <motion.img
          src={images.programmer}
          alt="profile_bg"
          whileInView={{ y: [-100, 0] }}
        />
        <motion.img
          whileInView={{ scale: [0, 1] }}
          transition={{ duration: 1, ease: "easeInOut" }}
          src={images.circle}
          alt="profile-circle"
          className="overlay_circle"
        />
      </motion.div>
      <motion.div
        variants={scaleVariants}
        whileInView={scaleVariants.whileInView}
        className="app__header-circles"
      >
        {rightIcons.map(({ Icon, color, size }, index) => (
          <motion.div
            variants={headerSkillVariants}
            whileInView="visible"
            whileHover="hover"
            drag
            dragConstraints={{ left: 10, right: 10, top: 10, bottom: 10 }}
            dragElastic={0.1}
            className="circle-cmp app__flex"
            key={`circle-${index}`}
          >
            <Icon color={color} size={size} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AppWrap(Header, "home");
