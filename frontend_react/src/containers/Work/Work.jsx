import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AiOutlineClose,
  AiFillPlayCircle,
  AiOutlineLink,
  AiOutlineCheck,
  AiOutlineArrowRight,
  AiFillGithub,
} from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";

import { AppWrap, MotionWrap } from "../../wrapper";
import projects from "../../data/projects";
import flows from "../../data/projectFlows";
import FlowChart from "../../components/FlowChart/FlowChart";
import { profile } from "../../data/profile";
import { setPageCovered } from "../../utils/pageCover";
import "./Work.scss";

const isHeadingBlock = (block) =>
  block.length < 40 && !/[.!?,]$/.test(block) && !block.includes("\n");

// A carousel entry is a video when its URL ends in a known video extension;
// everything else is treated as an image.
const isVideoMedia = (media) => /\.(mp4|webm|mov|ogv)$/i.test(media || "");

// The first few entries of a case study's "Technical Stack" line, shown as
// chips on the card so each one says what it was built with at a glance.
const stackOf = (work, count = 3) => {
  const match = /Technical Stack\s*\n\s*\n?([^\n]+)/i.exec(work.caseStudy || "");
  return match
    ? match[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, count)
    : [];
};

// Shareable links: #project/<id> opens that project's modal on load.
const HASH_PREFIX = "#project/";
const projectFromHash = () => {
  const { hash } = window.location;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = decodeURIComponent(hash.slice(HASH_PREFIX.length));
  return projects.find((p) => p.id === id) || null;
};

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cards tilt towards the pointer (mouse and trackpad only). Writes two CSS
// variables; the transform itself is in Work.scss.
const handleTilt = (event) => {
  if (event.pointerType !== "mouse") return;
  const card = event.currentTarget;
  const r = card.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - 0.5;
  const y = (event.clientY - r.top) / r.height - 0.5;
  card.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
  card.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
};
const resetTilt = (event) => {
  event.currentTarget.style.removeProperty("--tilt-x");
  event.currentTarget.style.removeProperty("--tilt-y");
};

const renderCaseStudy = (text, withStack = true) => {
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

    const techSection = withStack ? blocks.slice(techIndex, end) : [];
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
  const [copied, setCopied] = useState(false);
  // The clicked card's rect: the opening transition starts from it.
  const originRef = useRef(null);
  const modalRef = useRef(null);
  const portfolioRef = useRef(null);

  // Open the project named in the URL (shared link), on load and whenever
  // the hash changes.
  useEffect(() => {
    const sync = () => {
      const fromHash = projectFromHash();
      if (fromHash) {
        originRef.current = null;
        setSelectedWork(fromHash);
        setSelectedImageIndex(0);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Touch screens can't hover, so there each card's shimmer plays once as it
  // scrolls into view instead (desktop plays it on hover, in CSS).
  useEffect(() => {
    const touch = window.matchMedia("(hover: none)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!touch || calm || !portfolioRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-shimmering");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    portfolioRef.current
      .querySelectorAll(".app__work-item")
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedWork) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    // The background scenes are hidden under the modal: pause them.
    setPageCovered(true);

    // Reflect the open project in the document title for SEO / shareability.
    const previousTitle = document.title;
    document.title = `${selectedWork.title} — ${profile.name}`;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      setPageCovered(false);
      document.title = previousTitle;
    };
  }, [selectedWork]);

  // Opening transition (three.js, loaded on demand): the card dissolves into
  // particles that trace the modal's outline before it fades in. The modal's
  // final box comes from its layout size, which its entry transform doesn't
  // affect. Skipped for reduced motion; if WebGL is unavailable the modal
  // simply fades in.
  useLayoutEffect(() => {
    const modal = modalRef.current;
    if (!selectedWork || !modal || reduceMotion()) return undefined;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = modal.offsetWidth;
    const h = modal.offsetHeight;
    const to = {
      x: (vw - w) / 2,
      y: (vh - h) / 2,
      w,
      h,
      rule: modal.querySelector(".app__work-modal-header")?.offsetHeight || 0,
    };
    const card = originRef.current;
    const from = card
      ? { x: card.left, y: card.top, w: card.width, h: card.height }
      : { x: vw / 2 - 60, y: vh / 2 - 40, w: 120, h: 80 }; // shared link

    let cancelled = false;
    let stop = null;
    import("../../components/ProjectWarp/warpScene")
      .then((warp) => {
        if (cancelled) return;
        stop = warp.stopWarp;
        warp.playWarp(from, to);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }, [selectedWork]);

  // Warm every still in the open project so stepping through the carousel is
  // instant. Without this the first visit to each slide waits on a fresh
  // network request, which is what made navigation feel slow the first time.
  useEffect(() => {
    if (!selectedWork) {
      return;
    }

    const stills = (selectedWork.screenshots || []).filter(
      (media) => media && !isVideoMedia(media)
    );

    stills.forEach((src) => {
      const preloaded = new Image();
      preloaded.decoding = "async";
      preloaded.src = src;
    });
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

  const handleOpenModal = (work, event) => {
    originRef.current = event?.currentTarget?.getBoundingClientRect() || null;
    setSelectedWork(work);
    setSelectedImageIndex(0);
    setCopied(false);
    window.history.replaceState(null, "", `${HASH_PREFIX}${work.id}`);
  };

  function handleCloseModal() {
    setSelectedWork(null);
    setSelectedImageIndex(0);
    if (window.location.hash.startsWith(HASH_PREFIX)) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#work`
      );
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${selectedWork.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard blocked (e.g. insecure context): fall back to a prompt.
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const flow = selectedWork ? flows[selectedWork.id] : null;
  const calm = reduceMotion();

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
        decoding="async"
      />
    );
  };

  return (
    <>
      <h2 className="head-text">
        <span>Solutions Delivered</span>
      </h2>

      <motion.div
        ref={portfolioRef}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="app__work-portfolio"
      >
        {projects.map((work, index) => (
          <motion.div
            className="app__work-item app__flex"
            key={index}
            onClick={(event) => handleOpenModal(work, event)}
            onPointerMove={handleTilt}
            onPointerLeave={resetTilt}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenModal(work, event);
              }
            }}
            aria-label={`Open ${work.title} case study`}
            // Staggers the touch-screen shimmer across a row of cards.
            style={{ "--shimmer-delay": `${(index % 3) * 0.12}s` }}
          >
            <div className="app__work-img app__flex">
              {work.imgUrl && (
                <img
                  src={getImageUrl(work.imgUrl)}
                  alt={work.title}
                  loading="lazy"
                  decoding="async"
                />
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
              {stackOf(work).length > 0 && (
                <ul className="app__work-stack" aria-label="Built with">
                  {stackOf(work).map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              )}
              <span className="app__work-cta" aria-hidden="true">
                View case study <AiOutlineArrowRight />
              </span>
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
                ref={modalRef}
                className="app__work-modal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: calm
                    ? { duration: 0.2 }
                    : { delay: 0.42, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.16, ease: "easeIn" },
                }}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={selectedWork.title}
              >
                <header className="app__work-modal-header">
                  <h3 className="app__work-modal-title">{selectedWork.title}</h3>
                  <div className="app__work-modal-actions">
                    <button
                      type="button"
                      className={`app__work-modal-icon${copied ? " is-copied" : ""}`}
                      onClick={handleCopyLink}
                      aria-label={copied ? "Link copied" : "Copy link to this project"}
                      title={copied ? "Link copied" : "Copy link"}
                    >
                      {copied ? <AiOutlineCheck /> : <AiOutlineLink />}
                    </button>
                    <button
                      type="button"
                      className="app__work-modal-icon"
                      onClick={handleCloseModal}
                      aria-label="Close project details"
                      title="Close"
                    >
                      <AiOutlineClose />
                    </button>
                  </div>
                </header>

                <div className="app__work-modal-body">
                  <p className="app__work-modal-summary">
                    {flow?.summary || selectedWork.description}
                  </p>

                  {flow && (
                    <section className="app__work-modal-section">
                      <h4 className="app__work-modal-label">How it works</h4>
                      <FlowChart flow={flow} title={selectedWork.title} />
                    </section>
                  )}

                  <div className="app__work-modal-media">
                    {renderMedia(activeImage)}

                    {/* Thumbnail strip. The video slide uses the project's
                        card image as its still, marked with a play badge. */}
                    {carouselImages.length > 1 && (
                      <div className="app__work-modal-thumbs">
                        {carouselImages.map((media, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`app__work-modal-thumb ${
                              selectedImageIndex === index ? "active" : ""
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                            aria-label={`Show item ${index + 1} of ${
                              carouselImages.length
                            }`}
                            aria-current={selectedImageIndex === index}
                          >
                            <img
                              src={getImageUrl(
                                isVideoMedia(media) ? selectedWork.imgUrl : media
                              )}
                              alt=""
                              loading="lazy"
                              decoding="async"
                            />
                            {isVideoMedia(media) && (
                              <span className="app__work-modal-thumb-play">
                                <AiFillPlayCircle />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {flow?.problem && (
                    <section className="app__work-modal-section">
                      <h4 className="app__work-modal-label">Problem</h4>
                      <p className="app__work-modal-text">{flow.problem}</p>
                    </section>
                  )}
                  {flow?.approach && (
                    <section className="app__work-modal-section">
                      <h4 className="app__work-modal-label">Approach</h4>
                      <ul className="app__work-modal-list">
                        {flow.approach.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {flow?.outcome && (
                    <section className="app__work-modal-section">
                      <h4 className="app__work-modal-label">Outcome</h4>
                      <p className="app__work-modal-text">{flow.outcome}</p>
                    </section>
                  )}

                  {/* The full write-up stays available without crowding the
                      modal, folded away like the rest of the details. */}
                  {selectedWork.caseStudy && (
                    <details className="app__work-modal-more">
                      <summary>Read the full case study</summary>
                      <div className="app__work-modal-casestudy">
                        {renderCaseStudy(selectedWork.caseStudy, false)}
                      </div>
                    </details>
                  )}

                  <footer className="app__work-modal-footer">
                    <p className="app__work-modal-stack">
                      {stackOf(selectedWork, 99).join(" · ")}
                    </p>
                    {selectedWork.repo && (
                      <a
                        className="app__work-modal-repo"
                        href={selectedWork.repo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <AiFillGithub /> Repository
                      </a>
                    )}
                  </footer>
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