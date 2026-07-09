import React from "react";
import { FiCalendar } from "react-icons/fi";

import { images } from "../../constants";
import { profile } from "../../data/profile";
import { AppWrap, MotionWrap } from "../../wrapper";

import "./Contact.scss";

const Contact = () => {
  return (
    <>
      <h2 className="head-text">
        Got a project in mind? <span>Let's talk</span>
      </h2>

      <div className="app__contact-cards">
        <a
          href={`mailto:${profile.email}`}
          className="app__contact-card app__flex"
        >
          <div className="app__contact-card-icon app__flex">
            <img src={images.email} alt="email" />
          </div>
          <div className="app__contact-card-info">
            <span className="app__contact-card-label">Email me at</span>
            <span className="app__contact-card-value">{profile.email}</span>
          </div>
        </a>
      </div>

      <div className="app__contact-cta app__flex">
        <h3 className="bold-text">Prefer a quick chat?</h3>
        <p className="p-text">
          Book a free call and let's talk about how I can help bring your idea
          to life.
        </p>
        <a
          href={profile.calLink}
          target="_blank"
          rel="noopener noreferrer"
          className="app__contact-cta-button app__flex"
        >
          <FiCalendar />
          <span>Book a Call</span>
        </a>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Contact, "app__contact"),
  "contact",
  "app__whitebg"
);
