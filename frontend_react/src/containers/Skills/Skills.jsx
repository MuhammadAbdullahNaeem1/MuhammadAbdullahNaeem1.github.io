import React from "react";
import { motion } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import { AppWrap, MotionWrap } from "../../wrapper";
import { skills, experience } from "../../data/profile";
import "./Skills.scss";

const Skills = () => {
  const skillVariants = {
    view: {
      x: [-15, 0],
      opacity: [0, 1],
      transition: {
        x: {
          type: "spring",
          stiffness: "10",
        },
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    hover: {
      y: -7,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      y: -7,
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <h2 className="head-text">
        Tech Stacks <span>&</span> Core Experience
      </h2>
      <div className="app__skills-container">
        <motion.div className="app__skills-list">
          {skills.map((skill, index) => (
            <motion.div
              variants={skillVariants}
              whileInView="view"
              whileHover="hover"
              whileTap="tap"
              className="app__skills-item app__flex"
              key={skill.name + "-" + index}
            >
              <div className="app__flex" style={{ backgroundColor: "var(--skill-bg)" }}>
                {skill.icon && (
                  <skill.icon
                    color={skill.color}
                    size={45}
                    aria-label={skill.name}
                  />
                )}
              </div>
              <p className="p-text">{skill.name}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="app__skills-exp">
          <div className="app__timeline">
            {experience?.map((exp, index) => (
              <motion.div
                className="app__timeline-item"
                key={`exp-${index}`}
                whileInView={{ opacity: [0, 1], x: [-40, 0] }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                data-tooltip-id="exp-tooltip"
                data-tooltip-content={exp.desc}
              >
                <div className="app__timeline-marker">
                  <span className="app__timeline-dot" />
                </div>
                <div className="app__timeline-content">
                  <span className="app__timeline-period">{exp.period}</span>
                  <h4 className="bold-text">{exp.role}</h4>
                  <p className="p-text app__timeline-company">{exp.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* One shared tooltip instance that repositions to whichever item is
              hovered — so only a single description can ever be on screen. */}
          <ReactTooltip
            id="exp-tooltip"
            className="skills-tooltip"
            // Opens toward the right edge so it no longer covers the tech-stack
            // icons sitting to the left of the timeline. floating-ui flips it
            // back to the left automatically if a narrow screen lacks room.
            place="right"
            noArrow
            opacity={1}
            delayShow={80}
          />
        </motion.div>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Skills, "app__skills"),
  "skills",
  "app__whitebg"
);
