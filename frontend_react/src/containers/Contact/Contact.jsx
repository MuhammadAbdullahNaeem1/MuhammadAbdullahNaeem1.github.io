import React from "react";
import { FiCalendar, FiMail, FiFileText } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

import { images } from "../../constants";
import { profile } from "../../data/profile";
import { AppWrap, MotionWrap } from "../../wrapper";

import "./Contact.scss";

const Contact = () => {
  return (
    <>
      <h2 className="head-text">
        Let's Bring Your <span>AI Vision</span> to Life
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

      {/* Primary next steps, side by side. */}
      <div className="app__contact-actions">
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

      {/* GitHub and the resume get their own labelled row rather than being
          reduced to anonymous icons — they are the two things a client most
          often wants to open before getting in touch. */}
      <div className="app__contact-links">
        <a
          className="app__contact-link"
          href={profile.socials.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
          <span>View GitHub</span>
        </a>
        <a
          className="app__contact-link"
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiFileText />
          <span>View Resume</span>
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
