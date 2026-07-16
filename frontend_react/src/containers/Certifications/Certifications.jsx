import React from "react";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";

import { AppWrap, MotionWrap } from "../../wrapper";
import { certifications } from "../../data/profile";
import "./Certifications.scss";

const Certifications = () => {
  return (
    <>
      <h2 className="head-text">
        <span>Certifications</span>
      </h2>

      <div className="app__certs-list">
        {certifications?.map((cert, index) => (
          <motion.div
            className="app__certs-item"
            key={`${cert.org}-${index}`}
            whileInView={{ opacity: [0, 1], y: [24, 0] }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <div
              className="app__certs-logo app__flex"
              style={{ backgroundColor: "var(--skill-bg)" }}
            >
              {cert.icon && (
                <cert.icon color={cert.color} size={30} aria-label={cert.org} />
              )}
            </div>

            <div className="app__certs-content">
              <h4 className="bold-text app__certs-title">{cert.title}</h4>
              <p className="p-text app__certs-org">{cert.org}</p>

              {cert.issued && (
                <span className="app__certs-meta">Issued {cert.issued}</span>
              )}

              {cert.credentialId && (
                <span className="app__certs-meta">
                  Credential ID {cert.credentialId}
                </span>
              )}

              {/* Only render the button once there's a real link to point at. */}
              {cert.credentialUrl && (
                <a
                  className="app__certs-link"
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Show credential
                  <FiExternalLink />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Certifications, "app__certs"),
  "certifications",
  "app__primarybg"
);
