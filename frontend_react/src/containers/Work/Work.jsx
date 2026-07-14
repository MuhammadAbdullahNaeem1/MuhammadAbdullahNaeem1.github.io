import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";

import { AppWrap, MotionWrap } from "../../wrapper";
import projects from "../../data/projects";
import { profile } from "../../data/profile";
import "./Work.scss";

const isHeadingBlock = (block) =>
  block.length < 40 && !/[.!?,]$/.test(block) && !block.includes("\n");

// A carousel entry is a video when its URL ends in a known video extension;
// everything else is treated as an image.
const isVideoMedia = (media) => /\.(mp4|webm|mov|ogv)$/i.test(media || "");

const renderCaseStudy = (text) => {
  if (!text) return null;

  let blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  // Move the "Technical Stack" section (its heading + the lines that follow
  // it, up to the next heading) all the way down, leaving everything else
  // in place.
  const techIndex = blocks.findIndex(
    (block) =>
      isHeadingBlock(block) && block.toLowerCase() === "technical stack"
  );

  if (techIndex !== -1) {
    let end = techIndex + 1;
    while (end < blocks.length && !isHeadingBlock(blocks[end])) {
      end += 1;
    }

    const techSection = blocks.slice(techIndex, end);
    blocks = [...blocks.slice(0, techIndex), ...blocks.slice(end), ...techSection];
  }

  return blocks.map((block, index) => {
    if (isHeadingBlock(block)) {
      return (
        <h4 key={index} className="app__work-modal-heading">
          {block}
        </h4>
      );
    }

    return (
      <p key={index} className="p-text">
        {block.replace(/\n/g, " ")}
      </p>
    );
  });
};

const Work = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!selectedWork) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedWork(null);
        setSelectedImageIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Reflect the open project in the document title for SEO / shareability.
    const previousTitle = document.title;
    document.title = `${selectedWork.title} — ${profile.name}`;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.title = previousTitle;
    };
  }, [selectedWork]);

  const getImageUrl = (image) => image || "";

  const getCarouselImages = (work) => {
    if (!work) {
      return [];
    }

    if (Array.isArray(work.screenshots) && work.screenshots.length > 0) {
      return work.screenshots;
    }

    return work.imgUrl ? [work.imgUrl] : [];
  };

  const handleOpenModal = (work) => {
    setSelectedWork(work);
    setSelectedImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedWork(null);
    setSelectedImageIndex(0);
  };

  const handleCarouselChange = (direction) => {
    if (!selectedWork) {
      return;
    }

    const images = getCarouselImages(selectedWork);
    if (images.length <= 1) {
      return;
    }

    setSelectedImageIndex((currentIndex) => {
      if (direction === "next") {
        return (currentIndex + 1) % images.length;
      }

      return (currentIndex - 1 + images.length) % images.length;
    });
  };

  const carouselImages = selectedWork ? getCarouselImages(selectedWork) : [];
  const activeImage = carouselImages[selectedImageIndex] || carouselImages[0];

  const renderMedia = (media) => {
    if (!media) {
      return null;
    }

    if (isVideoMedia(media)) {
      return (
        <video
          key={media}
          className="app__work-modal-video"
          src={getImageUrl(media)}
          controls
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <img
        src={getImageUrl(media)}
        alt={`${selectedWork?.title || "Project"} screenshot`}
      />
    );
  };

  return (
    <>
      <h2 className="head-text">
        <span>Projects</span>
      </h2>

      <motion.div
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="app__work-portfolio"
      >
        {projects.map((work, index) => (
          <motion.div
            className="app__work-item app__flex"
            key={index}
            onClick={() => handleOpenModal(work)}
            onTouchStart={() => handleOpenModal(work)}
          >
            <div className="app__work-img app__flex">
              {work.imgUrl && (
                <img src={getImageUrl(work.imgUrl)} alt={work.title} />
              )}
            </div>
            <div className="app__work-content app__flex">
              <h4 className="bold-text" title={work.title}>
                {work.title}
              </h4>
              <p
                className="p-text"
                style={{ marginTop: 10 }}
                title={work.description}
              >
                {work.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {selectedWork && (
            <motion.div
              className="app__work-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              <motion.div
                className="app__work-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="app__work-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close project details"
                >
                  <AiOutlineClose />
                </button>

                <div className="app__work-modal-media">
                  {carouselImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="app__work-modal-nav app__work-modal-nav-left"
                        onClick={() => handleCarouselChange("prev")}
                        aria-label="Show previous screenshot"
                      >
                        <AiOutlineLeft />
                      </button>
                      {renderMedia(activeImage)}
                      <button
                        type="button"
                        className="app__work-modal-nav app__work-modal-nav-right"
                        onClick={() => handleCarouselChange("next")}
                        aria-label="Show next screenshot"
                      >
                        <AiOutlineRight />
                      </button>
                    </>
                  ) : (
                    renderMedia(activeImage)
                  )}

                  {carouselImages.length > 1 && (
                    <div className="app__work-modal-dots">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`app__work-modal-dot ${
                            selectedImageIndex === index ? "active" : ""
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                          aria-label={`Show screenshot ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="app__work-modal-content">
                  <h3 className="head-text">{selectedWork.title}</h3>
                  <div className="app__work-modal-casestudy">
                    {selectedWork?.caseStudy ? (
                      renderCaseStudy(selectedWork.caseStudy)
                    ) : (
                      <p className="p-text">{selectedWork?.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default AppWrap(
  MotionWrap(Work, "app__works"),
  "work",
  "app__primarybg"
);