import React from "react";
import { FiMail, FiCalendar } from "react-icons/fi";

import { aboutMe, profile } from "../../data/profile";
import { AppWrap, MotionWrap } from "../../wrapper";
import "./About.scss";

const About = () => {
  return (
    <>
      <h2 className="head-text">
        Production <span>AI</span>
        <br />
        built to <span>scale</span>
      </h2>
      <div className="app__about-context app__flex">
        <div className="app__about-data app__flex">
          <h2 className="head-text">What I Do</h2>

          {aboutMe.headline && (
            <p className="app__about-headline">{aboutMe.headline}</p>
          )}

          <p
            className="p-text"
            dangerouslySetInnerHTML={{ __html: aboutMe.description }}
          ></p>

          {/* The copy above closes on a call to action, so the next step needs
              to be right here rather than a resume download. */}
          <div className="app__about-actions">
            <a
              className="app__cta-button app__cta-button--primary"
              href={`mailto:${profile.email}`}
            >
              <FiMail />
              <span>Email Me</span>
            </a>
            <a
              className="app__cta-button"
              href={profile.calLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiCalendar />
              <span>Book a Call</span>
            </a>
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
