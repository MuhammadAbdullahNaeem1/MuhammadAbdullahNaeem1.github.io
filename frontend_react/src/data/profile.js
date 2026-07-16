// All bio, skills, experience, and contact content lives here — no CMS.
// Edit this file to update copy across the About, Skills, and Contact sections.

import {
  SiPytorch,
  SiFastapi,
  SiLangchain,
  SiReact,
  SiPostgresql,
  SiJavascript,
  SiNodedotjs,
  SiDocker,
  SiNextdotjs,
  SiDjango,
  SiTensorflow,
  SiPython,
  SiOpenai,
  SiAnthropic,
} from "react-icons/si";


// ---------------------------------------------------------------------------
// Identity & contact
// ---------------------------------------------------------------------------
export const profile = {
  name: "M. Abdullah Naeem",
  title: "Full-Stack & Applied ML Developer",
  email: "Abdullahnaeem175@gmail.com",
  calLink: "https://cal.com/abdullah-naeem",
  // Drop a resume file at frontend_react/public/resume.pdf to wire up the button.
  resumeUrl: `${import.meta.env.BASE_URL}resume.pdf`,
  socials: {
    linkedin: "https://www.linkedin.com/in/abdullahnaeem-",
    github: "https://github.com/MuhammadAbdullahNaeem1",
  },
};

// ---------------------------------------------------------------------------
// About Me — rendered as HTML (paragraphs separated by <br/>)
// ---------------------------------------------------------------------------
export const aboutMe = {
  description: `I'm a developer who works across the full stack, building products that are both well-designed and technically sound. My focus spans two things: crafting clean, considered web experiences, and building applied machine learning systems that solve real problems.<br/><br/>On the web side, that means React-based storefronts and portfolios with real e-commerce logic, smooth interactions, and design that doesn't feel templated. On the ML side, it's meant building things like a federated learning pipeline for privacy-preserving medical diagnostics, and a full data-to-dashboard stock intelligence system built with a team.<br/><br/>I care about the full picture, not just functional, but considered: interfaces that feel intentional, code that's maintainable, and systems that are built to actually be used.<br/><br/>If you're working on a project and want to team up, let's collaborate and build something great.`,
};

// ---------------------------------------------------------------------------
// Skills — icons come from react-icons (Simple Icons set)
// ---------------------------------------------------------------------------
export const skills = [
  { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C" },
  { name: "FastAPI", icon: SiFastapi, color: "#009688" },
  { name: "Langchain", icon: SiLangchain, color: "#1C7D73" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "Django", icon: SiDjango, color: "#0C4B33" },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
];

// ---------------------------------------------------------------------------
// Experience — a single chronological timeline, most recent first.
// `period` is the human-readable date range shown on the timeline.
// ---------------------------------------------------------------------------
export const experience = [
  {
    role: "Software Developer",
    company: "Techlogix",
    period: "July 2025 – Present",
    desc: "Designed and built AI-driven, full-stack applications by integrating machine learning models into scalable production systems. Developed backend and frontend infrastructure supporting end-to-end ML pipelines, partnering with cross-functional teams to ship data-powered features.",
  },
  {
    role: "Software Developer",
    company: "Contour Software",
    period: "Mar 2025 – June 2025",
    desc: "Built core features for an Employee Management System using .NET Web APIs and MVC architecture. Applied dependency injection, LINQ, and generics for clean, modular, type-safe code, and developed secure RESTful APIs for CRUD operations while strengthening system stability through robust exception handling.",
  },
  {
    role: "Teaching Assistant",
    company: "FAST-NUCES",
    period: "Aug 2024 – Jun 2025",
    desc: "Supported instruction for Software Design and Analysis, Databases, and Computer Networks Lab — grading, leading review sessions, and helping students work through difficult technical concepts.",
  },
  {
    role: "Software Engineer Intern",
    company: "Wateen Telecom",
    period: "Jun 2024 – Aug 2024",
    desc: "Built a real-time .NET Core application using MVC architecture, including a custom logging system with middleware for automatic HTTP request/response tracking. Logged critical data to SQL and local storage for auditability, and developed APIs to streamline log setup — reducing error detection time by 30% and improving system scalability.",
  },
  {
    role: "Web Developer Intern",
    company: "FastDev Labs",
    period: "Jun 2023 – Sep 2023",
    desc: "Built full-stack web applications using MongoDB, Express, React, and Node.js, contributing across both frontend interfaces and backend services.",
  },
  {
    role: "Freelance Software Engineer",
    company: "Fiverr",
    period: "Aug 2021 – Dec 2023",
    desc: "Delivered full-cycle software projects for clients — designing, building, debugging, and shipping solutions across multiple stacks, with a strong focus on fast turnaround and reliability.",
  },
];

// ---------------------------------------------------------------------------
// Certifications — cards render in this array's order (grouped by issuer here);
// reorder the array to reorder them.
//
//   title          certificate name, as printed on the credential
//   org            issuing organization
//   issued         "Month Year" it was issued (e.g. "Jan 2026")
//   credentialId   ID on the credential — omit or leave "" to hide the line
//   credentialUrl  public verification link — omit or leave "" and the
//                  "Show credential" button is hidden (no dead links)
//   icon / color   issuing org's logo (react-icons) and the color it renders in
//
// The colors below are chosen to stay legible in both light and dark mode.
// ---------------------------------------------------------------------------
const OPENAI = { org: "OpenAI", icon: SiOpenai, color: "#10A37F" };
const ANTHROPIC = { org: "Anthropic", icon: SiAnthropic, color: "#D97757" };

export const certifications = [
  {
    ...OPENAI,
    title: "AI Foundations",
    issued: "Jul 2026",
    credentialId: "cen4gk2635",
    credentialUrl: "https://academy.openai.com/public/certificate/cen4gk2635",
  },
  {
    ...OPENAI,
    title: "Agents and Workflows",
    issued: "Jul 2026",
    credentialId: "qtx16lcy4n",
    credentialUrl: "https://academy.openai.com/public/certificate/qtx16lcy4n",
  },
  {
    ...OPENAI,
    title: "Applied AI Foundations",
    issued: "Jul 2026",
    credentialId: "0wu16ld9l1",
    credentialUrl: "https://academy.openai.com/public/certificate/0wu16ld9l1",
  },
  {
    ...ANTHROPIC,
    title: "Claude 101",
    issued: "Jul 2026",
    credentialId: "xha5tyvv5kzb",
    credentialUrl: "https://verify.skilljar.com/c/xha5tyvv5kzb",
  },
  {
    ...ANTHROPIC,
    title: "Claude Code 101",
    issued: "Jul 2026",
    credentialId: "zogrft6gamtb",
    credentialUrl: "https://verify.skilljar.com/c/zogrft6gamtb",
  },
];
