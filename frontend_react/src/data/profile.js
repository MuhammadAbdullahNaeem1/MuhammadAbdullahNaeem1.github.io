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
} from "react-icons/si";


// ---------------------------------------------------------------------------
// Identity & contact
// ---------------------------------------------------------------------------
export const profile = {
  name: "M. Abdullah Naeem",
  title: "Full-Stack & Applied ML Developer",
  email: "Abdullahnaeem175@gmail.com",
  calLink: "https://cal.com/abdullah-naeem-j3ehlk/meeting",
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
    period: "Apr 2025 – Present",
    desc: "Designed and built AI-driven, full-stack applications by integrating machine learning models into scalable production systems. Developed backend and frontend infrastructure supporting end-to-end ML pipelines, partnering with cross-functional teams to ship data-powered features.",
  },
  {
    role: "Software Developer",
    company: "Contour Software",
    period: "Mar 2025 – Apr 2025",
    desc: "Built core features for an Employee Management System using .NET Web APIs and MVC architecture. Applied dependency injection, LINQ, and generics for clean, modular, type-safe code, and developed secure RESTful APIs for CRUD operations while strengthening system stability through robust exception handling.",
  },
  {
    role: "Teaching Assistant",
    company: "FAST-NUCES",
    period: "Aug 2024 – Jun 2025",
    desc: "Supported instruction for Software Design and Analysis, Databases, and Computer Networks Lab — grading, leading review sessions, and helping students work through difficult technical concepts.",
  },
  {
    role: "Software Engineer",
    company: "Wateen Telecom",
    period: "Jun 2024 – Aug 2024",
    desc: "Built a real-time .NET Core application using MVC architecture, including a custom logging system with middleware for automatic HTTP request/response tracking. Logged critical data to SQL and local storage for auditability, and developed APIs to streamline log setup — reducing error detection time by 30% and improving system scalability.",
  },
  {
    role: "Web Developer",
    company: "FastDev Labs",
    period: "Jun 2023 – Sep 2023",
    desc: "Built full-stack web applications using MongoDB, Express, React, and Node.js, contributing across both frontend interfaces and backend services.",
  },
  {
    role: "Freelance Software Engineer",
    company: "Fiverr",
    period: "2021 – 2023",
    desc: "Delivered full-cycle software projects for clients — designing, building, debugging, and shipping solutions across multiple stacks, with a strong focus on fast turnaround and reliability.",
  },
];
