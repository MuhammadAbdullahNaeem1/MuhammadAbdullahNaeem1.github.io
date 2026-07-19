import React from "react";
import { FaLinkedinIn } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

import { profile } from "../../data/profile";
import "./SocialRail.scss";

// Persistent left-hand shortcuts. Rendered once from App (not through AppWrap)
// because it is position: fixed — mounting it per section would stack six
// copies on top of each other.
const links = [
  {
    id: "linkedin",
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    href: profile.socials.linkedin,
    external: true,
  },
  {
    id: "email",
    label: profile.email,
    Icon: FiMail,
    href: `mailto:${profile.email}`,
    external: false,
  },
];

const SocialRail = () => (
  <aside className="app__rail" aria-label="Contact shortcuts">
    {links.map(({ id, label, Icon, href, external }) => (
      <a
        key={id}
        className="app__rail-link"
        href={href}
        aria-label={label}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        <Icon aria-hidden />
        <span className="app__rail-label">{label}</span>
      </a>
    ))}
    <span className="app__rail-line" aria-hidden />
  </aside>
);

export default SocialRail;
