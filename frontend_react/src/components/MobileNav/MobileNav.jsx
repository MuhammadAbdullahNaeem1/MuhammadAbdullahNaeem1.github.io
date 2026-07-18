import React, { useEffect, useState } from "react";
import { FiUser, FiBriefcase, FiAward, FiMail } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

import "./MobileNav.scss";

// Bottom tab bar, mobile only. "home" is deliberately left out — the logo and
// the hamburger already cover getting back to the top, and five tabs fit the
// width comfortably where six start to crowd.
const tabs = [
  { id: "about", label: "About", Icon: FiUser },
  { id: "work", label: "Work", Icon: FiBriefcase },
  { id: "skills", label: "Skills", Icon: HiOutlineSparkles },
  { id: "certifications", label: "Certs", Icon: FiAward },
  { id: "contact", label: "Contact", Icon: FiMail },
];

const MobileNav = () => {
  const [active, setActive] = useState("");

  // Highlight whichever section currently occupies the viewport, so the bar
  // reflects where you are while scrolling — not just what was last tapped.
  useEffect(() => {
    const targets = tabs
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (!targets.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(visible.target.id);
        }
      },
      // Middle band of the screen decides the active section.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="app__mobilenav" aria-label="Section navigation">
      {tabs.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`app__mobilenav-tab ${active === id ? "active" : ""}`}
          aria-current={active === id ? "true" : undefined}
          onClick={() => setActive(id)}
        >
          <Icon aria-hidden />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
};

export default MobileNav;
