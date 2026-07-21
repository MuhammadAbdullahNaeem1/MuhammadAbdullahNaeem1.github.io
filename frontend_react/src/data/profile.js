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
  SiKaggle,
  SiHuggingface,
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
  // The "Building Intelligent Systems for Measurable Growth" line that used to
  // sit here is now the section's main heading, in About.jsx.
  description: `Are you looking to build the next AI-powered product? Or, do you need an intelligent solution that actually works in production? Whatever the case may be, let my industrial competence bridge the technical gaps.<br/><br/>Specializing in production-ready AI agents, LLM applications, and machine learning solutions that are not only reliable and scalable but also designed for real-world impact has been my go-to since I stepped into the AI world.<br/><br/>Expertise spans agentic AI, Retrieval-Augmented Generation (RAG), multi-agent systems, intelligent workflow automation, and predictive machine learning.<br/><br/>AI agents are engineered with LangGraph, LangChain, and modern LLMs to reason, use tools, retrieve knowledge from enterprise data, and smoothly escalate to humans when confidence is low. Machine learning experience includes privacy-preserving federated learning, explainable AI with SHAP, and predictive models that enable confident, data-driven decisions.<br/><br/>Count on me for solutions built with a focus on strong architecture, safe failure handling, explainability, and long-term maintainability.<br/><br/>Let's connect and discuss what your goal is: to build AI agents, automate business workflows, integrate LLMs into existing products, or deploy production-ready machine learning systems.<br/><br/>Always ready to turn your AI vision into a measurable business impact!`,
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
    role: "AI Backend Engineer",
    company: "Techlogix",
    period: "July 2025 – Present",
    desc: "Built and scaled AI-powered backend systems using Python, FastAPI, Django, LangGraph, and vector databases — enabling semantic search, RAG pipelines, intelligent automation, and AI inference workflows for enterprise applications processing 1,000+ medical imaging records, contributing to a 21% improvement in diagnostic accuracy over older workflows. Engineered secure, cloud-native REST APIs and microservices on AWS EC2 with Nginx, reducing average API response latency by 27% through caching and query optimization, and integrated deep learning models, computer vision pipelines, and Redis caching with Docker-based CI/CD to improve reliability across healthcare and retail domains.",
  },
  {
    role: "Software Engineer",
    company: "Contour Software",
    period: "Mar 2025 – June 2025",
    desc: "Developed AI backend systems with Python, FastAPI, Django, LangGraph, and ChromaDB — building RAG pipelines, semantic search, and multi-agent workflows. Built AI-driven backend APIs for customer support, integrating LLMs, vector embeddings, and document retrieval to automate ticket routing and improve response accuracy.",
  },
  {
    role: "Teaching Assistant",
    company: "FAST-NUCES",
    period: "Aug 2024 – Jun 2025",
    desc: "Supported instruction for Software Design and Analysis, Databases, and Computer Networks Lab — grading, leading review sessions, and helping students work through difficult technical concepts.",
  },
  {
    role: "Web Development Intern",
    company: "Wateen Telecom",
    period: "Jun 2024 – Aug 2024",
    desc: "Designed and developed secure RESTful APIs to enable smooth cross-platform communication, third-party integrations, and efficient data exchange.",
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
const HUGGINGFACE = { org: "Hugging Face", icon: SiHuggingface, color: "#FF9D00" };
const KAGGLE = { org: "Kaggle", icon: SiKaggle, color: "#20BEFF" };

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
  {
    ...HUGGINGFACE,
    title: "AI Agents Course",
    issued: "Jul 2026",
    credentialUrl:
      "https://huggingface.co/datasets/agents-course/final-certificates/resolve/main/certificates/muhammadabdullahnaeem/2026-07-18.png",
  },
  // Kaggle certificates are verified by their public URL alone — there is no
  // separate credential ID printed on them, so that line is omitted.
  {
    ...KAGGLE,
    title: "Machine Learning Explainability",
    issued: "Jul 2026",
    credentialUrl:
      "https://www.kaggle.com/learn/certification/abdullahnaeem7/machine-learning-explainability",
  },
  {
    ...KAGGLE,
    title: "Intermediate Machine Learning",
    issued: "Jul 2026",
    credentialUrl:
      "https://www.kaggle.com/learn/certification/abdullahnaeem7/intermediate-machine-learning",
  },
  {
    ...KAGGLE,
    title: "Intro to Deep Learning",
    issued: "Jul 2026",
    credentialUrl:
      "https://www.kaggle.com/learn/certification/abdullahnaeem7/intro-to-deep-learning",
  },
  {
    ...KAGGLE,
    title: "Advanced SQL",
    issued: "Jul 2026",
    credentialUrl:
      "https://www.kaggle.com/learn/certification/abdullahnaeem7/advanced-sql",
  },
];
