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
        {certifications?.map((cert, index) => {
          // The whole tile is the link when there's a credential to open — a
          // "Show credential" button on every card added far too much weight
          // once the list grew past a handful.
          const Card = cert.credentialUrl ? motion.a : motion.div;
          const linkProps = cert.credentialUrl
            ? { href: cert.credentialUrl, target: "_blank", rel: "noreferrer" }
            : {};

          return (
            <Card
              className={`app__certs-item${
                cert.credentialUrl ? " app__certs-item--link" : ""
              }`}
              key={`${cert.org}-${index}`}
              {...linkProps}
              whileInView={{ opacity: [0, 1], y: [20, 0] }}
              // Capped so the last cards don't sit blank waiting their turn.
              transition={{ duration: 0.45, delay: Math.min(index, 7) * 0.04 }}
            >
              <div
                className="app__certs-logo app__flex"
                style={{ backgroundColor: "var(--skill-bg)" }}
              >
                {cert.icon && (
                  <cert.icon
                    color={cert.color}
                    size={24}
                    aria-label={cert.org}
                  />
                )}
              </div>

              <div className="app__certs-content">
                <h4 className="bold-text app__certs-title">{cert.title}</h4>

                {/* Issuer and date share a line to keep each tile compact. */}
                <p className="app__certs-meta">
                  {cert.org}
                  {cert.issued && ` · ${cert.issued}`}
                </p>

                {cert.credentialId && (
                  <span className="app__certs-id">ID {cert.credentialId}</span>
                )}
              </div>

              {cert.credentialUrl && (
                <FiExternalLink className="app__certs-arrow" aria-hidden />
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Certifications, "app__certs"),
  "certifications",
  "app__primarybg"
);
