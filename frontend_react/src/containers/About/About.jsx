import React from "react";

import { aboutMe, profile } from "../../data/profile";
import { AppWrap, MotionWrap } from "../../wrapper";
import "./About.scss";

const About = () => {
  const viewResumeHandler = () => {
    window.open(profile.resumeUrl, "_blank");
  };

  return (
    <>
      <h2 className="head-text">
        Production <span>AI</span>
        <br />
        built to <span>scale</span>
      </h2>
      <div className="app__about-context app__flex">
        <div className="app__about-data app__flex">
          <h2 className="head-text">About Me</h2>
          <p
            className="p-text"
            dangerouslySetInnerHTML={{ __html: aboutMe.description }}
          ></p>
          <div>
            <button className="portfolio-button" onClick={viewResumeHandler}>
              Resume
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(About, "app__about"),
  "about",
  "app__whitebg"
);
