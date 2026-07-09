import React from "react";
import { motion } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";

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
        Skills <span>&</span> Experience
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
            {experience?.map((exp, index) => {
              const tooltipId = `exp-${index}`;
              return (
                <motion.div
                  className="app__timeline-item"
                  key={tooltipId}
                  whileInView={{ opacity: [0, 1], x: [-40, 0] }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  data-tooltip-id={tooltipId}
                >
                  <div className="app__timeline-marker">
                    <span className="app__timeline-dot" />
                  </div>
                  <div className="app__timeline-content">
                    <span className="app__timeline-period">{exp.period}</span>
                    <h4 className="bold-text">{exp.role}</h4>
                    <p className="p-text app__timeline-company">{exp.company}</p>
                  </div>
                  <ReactTooltip id={tooltipId} className="skills-tooltip">
                    {exp.desc}
                  </ReactTooltip>
                </motion.div>
              );
            })}
          </div>
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
