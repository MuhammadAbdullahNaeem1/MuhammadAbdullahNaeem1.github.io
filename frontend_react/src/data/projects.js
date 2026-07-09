// All project data lives here — no CMS, no runtime fetches.
//
// Each project:
//   id          unique slug (also used as the image folder name in /public/projects)
//   title       display name
//   description short one-liner shown on the project card
//   metaDescription  used for the document <title>/description when the drawer opens
//   screenshots carousel images (served statically from /public/projects/<id>/)
//   imgUrl      card thumbnail (defaults to the first screenshot)
//   caseStudy   full write-up; blank lines separate blocks, short lines render as headings
//
// To reorder how projects appear, reorder this array.

const img = (id, file) => `/projects/${id}/${file}`;

const projects = [
  {
    id: "symptomsense-ai",
    title: "SymptomSense AI",
    description:
      "	Federated-learning cardiac diagnostics, fully private",
    metaDescription:
      "SymptomSense AI — federated-learning cardiac MRI diagnostics for early Hypertrophic Cardiomyopathy detection, built with SwinUNet, a Random Forest classifier, and a Django/Next.js stack.",
    screenshots: [
      img("symptomsense-ai", "1.png"),
      img("symptomsense-ai", "2.png"),
      img("symptomsense-ai", "3.png"),
      img("symptomsense-ai", "4.png"),
    ],
    caseStudy: `Overview

SymptomSense AI is a medical imaging diagnostic system built to detect Hypertrophic Cardiomyopathy (HCM) early, using cardiac MRI scans. It combines a transformer-based segmentation model, a feature-based classifier, and a federated learning architecture that lets multiple hospitals collaboratively train the system without ever sharing patient data.

The Problem

Medical AI faces a hard constraint: hospitals can't pool patient scans to build better models without violating privacy regulations and patient trust. Most diagnostic tools either compromise on data privacy or end up siloed within a single institution, limiting how well they generalize across patient populations.

The Solution

I designed a federated learning pipeline that allows the model to train across distributed hospital datasets while patient data never leaves its source. Each institution trains locally; only model updates are aggregated, not raw data. On the imaging side, I implemented SwinUNet, a transformer-based segmentation model, to isolate cardiac structures from MRI scans with high precision. Extracted features (texture, shape, intensity) feed into a Random Forest classifier that distinguishes HCM patients from healthy controls. Clinicians interact with the system through a Next.js dashboard built for simplicity, upload a scan, view the segmentation, and get a diagnostic prediction. Django handles the backend, orchestrating preprocessing, model inference, and communication across the federated nodes.

Key Challenges

Federated learning introduces real engineering complexity; custom aggregation strategies were needed to handle the variation across different hospitals' data distributions without sacrificing accuracy. Integrating a transformer-based segmentation model with a traditional classifier into one cohesive pipeline required careful API design between the two stages. Coordinating real-time scan upload, processing, and visualization across the frontend and backend also demanded tight, well-defined contracts between services.

Outcome

The result is a working system that enables privacy-preserving HCM detection across distributed datasets, without compromising clinical usability. It reflects deep, hands-on experience across federated learning, medical imaging, and full-stack ML system design, the kind of work that points toward scalable, secure AI in healthcare.

Technical Stack

Next.js, Django, SwinUNet, Random Forest, Federated Learning, TensorFlow, Pandas`,
  },
    {
    id: "logiflow",
    title: "LogiFlow Support Agent",
    description:
      "Multi-agent system that triages and resolves support tickets",
    metaDescription:
      "LogiFlow Support Agent — a LangGraph multi-agent system that triages support tickets by urgency and churn risk, drafts documentation-grounded replies, and escalates to humans when unsure.",
    screenshots: [
      img("logiflow", "1.png"),
      img("logiflow", "2.png"),
      img("logiflow", "3.png"),
      img("logiflow", "4.png"),
      img("logiflow", "5.png"),
      img("logiflow", "6.png"),
      img("logiflow", "7.png"),
    ],
    caseStudy: `Overview

LogiFlow Support Agent is an AI system that reads every incoming support ticket the moment it arrives, figures out how urgent it is, tries to answer it automatically using your own help documentation, and hands it to a human, with full context, the moment it can't. It's built for support teams who are drowning in a mixed queue of urgent outages, routine questions, and quietly unhappy customers, all treated the same way today.

The Problem

If you run a support inbox, this will sound familiar: a customer reporting a full outage sits in the same queue as someone asking "how do I connect my store," and a customer hinting "I'm thinking about cancelling" gets the exact same generic reply as everyone else. Three things go wrong as a result: urgent issues get noticed late because nothing sorts them to the top, answer quality depends entirely on which agent happens to pick up the ticket, and customers who are about to leave don't get flagged until it's too late to save them. None of this is anyone's fault, it's just what happens when every ticket is triaged by hand.

The Solution

Think of it as three specialists reviewing every ticket before a human ever sees it. The first is a triage nurse: it reads the ticket, tags what it's about, decides how urgent it is, and notices if the customer sounds ready to walk. The second is a research assistant: it searches your own help documentation for the answer and drafts a reply, but only when it's genuinely confident it found the right one; if it isn't sure, it says so instead of guessing. The third is a case manager: it steps in for anything serious (an outage, a question nothing in the docs answers, or a customer at risk of leaving) and prepares a briefing for your human agent: what happened, why it's urgent, and what to do first, including tailored talking points if it's a save-the-customer situation.

The one hard rule behind all of it: the system never invents an answer. If it's not confident, it escalates to a person rather than replying with something that sounds right but might be wrong.

What Your Team Actually Sees

A live console showing every ticket, sorted by urgency and flagged for churn risk. Click into any ticket and see exactly why it was prioritized the way it was, which help-doc passages the drafted answer came from (with a confidence score, so nothing is a black box), and an editable reply before it goes out. Tickets flagged as a retention risk get a dedicated panel showing exactly what the customer said that triggered the flag, plus suggested talking points scaled to that customer's account size. A dashboard shows the day's ticket volume, how many critical issues are still open, and a 7-day churn trend so you can tell at a glance if things are improving.

Why This Actually Works

The system is built so it fails safely. A genuine outage skips the documentation search entirely and goes straight to a human, flagged as top priority because no article helps when the platform is down, and every second matters. And a fixed set of rules sits underneath the AI and overrides it whenever certain danger words show up (like "everything is down" or "all orders failing"), so urgent tickets get flagged correctly even if the AI model is having an off day. That combination of an AI that's smart when things are routine and a rule layer that takes over when things aren't is what makes this safe to run automatically instead of needing constant supervision.

For the Technically Curious

Under the hood, the three specialists are nodes in a LangGraph state machine: a graph of AI agents that pass a shared understanding of the ticket between them, routing differently depending on what each one decides. Every agent pairs its AI judgment with a deterministic rule check, and the rules always win when they disagree, which is what lets the system keep working correctly even if the underlying AI model is unavailable or wrong. The research step retrieves answers from a vector database built from your own documentation, it's not searching the open internet, and it's not allowed to answer unless the retrieved material actually supports a confident response.

Outcome

A support pipeline your team can trust to look at every ticket first because when it's not sure, it asks a human instead of guessing. Urgent issues get surfaced immediately, common questions get answered instantly and consistently, and customers showing early signs of leaving get flagged before they're gone. All without needing someone to sit and manually sort the queue.

Technical Stack

LangGraph, Gemini 2.5 Flash, ChromaDB, sentence-transformers, FastAPI, SQLAlchemy, SQLite, Server-Sent Events, React, Vite, Tailwind`,
  },
  {
    id: "churn-radar",
    title: "Churn Radar",
    description:
      "Predicts which customers will churn and what to do",
    metaDescription:
      "Churn Radar — a customer churn prediction dashboard powered by XGBoost and SHAP, re-scoring the entire customer base nightly with explainable risk tiers and recommended actions.",
    screenshots: [
      img("churn-radar", "1.png"),
      img("churn-radar", "2.png"),
      img("churn-radar", "3.png"),
      img("churn-radar", "4.png"),
      img("churn-radar", "5.png"),
      img("churn-radar", "6.png"),
      img("churn-radar", "7.png"),
    ],
    caseStudy: `Overview

Churn Radar is a customer churn prediction dashboard built for non-technical customer success teams. Every night it re-scores the entire customer base, assigns each customer a Low/Medium/High risk tier, explains the specific factors driving that risk, and generates a concrete recommended action, all surfaced in an interface a business owner can read and act on without touching a spreadsheet or a data scientist.

The Problem

SaaS companies lose revenue to customers who quietly cancel, usually after weeks of visible warning signs like shrinking usage, month-to-month contracts, and support friction that never reach the people who could act. Two things go wrong: there's no early warning (teams learn a customer is unhappy only when they cancel), and there's no prioritization (even when risk is known, nobody knows which customer to call first, why they're at risk, or what to say).

The Solution

I trained an XGBoost classifier on the IBM Telco Customer Churn dataset, wrapped in a single scikit-learn Pipeline so training and inference always share identical preprocessing. The model reaches 0.84 ROC-AUC — solid discrimination for a "who should I call today" ranking tool. For explainability, SHAP contributions are computed for every customer at scoring time rather than on demand, so opening a customer page is instant. A separate rules engine sits on top of the model, translating each risk tier into a concrete action (discount outreach, check-in call, monitor) that flows into an action queue the team works through. APScheduler runs the full pipeline nightly, and a Next.js dashboard presents four views — overview, customer list, customer detail, and model performance — designed so a non-technical user never sees a raw number without context.

Key Challenges

The key architectural decisions were about trade-offs, not just accuracy. Precomputing SHAP values during the nightly batch (instead of on page load) spends a little scheduled compute to buy an always-instant UI which is the right call for a dashboard someone checks every morning. Keeping the rules engine separate from the ML model means a business stakeholder can retune the "what to do about it" logic without retraining anything. I also made the system resilient to missing data: if Kaggle credentials aren't present, it generates a synthetic dataset with the same schema and realistic churn relationships, so the app never has a hard dependency on an external service to run.

Outcome

A working end-to-end system where a non-technical manager can open a browser, see exactly how many customers are at high risk out of the full base, understand why the top ones are slipping, and work a pre-built recommendation queue. All backed by a model that can be retrained and re-score everyone with one click.

Technical Stack

Next.js, Tailwind, Recharts, FastAPI, XGBoost, scikit-learn, SHAP, pandas, SQLite, SQLAlchemy, APScheduler`,
  },
  {
    id: "nl2sql",
    title: "Ask-Your-Database Analytics Agent",
    description:
      "Plain-English questions turned into live SQL",
    metaDescription:
      "NL2SQL Analytics Agent — a ReAct-style LangChain agent that inspects a live PostgreSQL schema, writes and runs SQL from plain-English questions, and returns answers alongside the exact query.",
    screenshots: [img("nl2sql", "1.png"), img("nl2sql", "2.png")],
    caseStudy: `Overview

NL2SQL Analytics Agent lets non-technical business users query a real PostgreSQL database by typing questions in plain English. An LLM agent inspects the live schema, writes SQL, executes it, and returns a plain-language answer alongside the exact query it ran and the results table. It's built on the Olist Brazilian e-commerce dataset: nine related tables covering orders, customers, products, sellers, payments, and reviews.

The Problem

Business questions like "which product category had the highest revenue?" or "what percentage of orders shipped late?" live inside the database, but the people who need those answers usually can't write SQL. The result is a bottleneck: every question routes through a data analyst, and simple lookups take hours or days. Generic chatbots don't solve this either as without access to the real schema, they hallucinate table names and invent answers that look plausible but are wrong.

The Solution

I built a ReAct-style SQL agent using LangChain that introspects the database schema dynamically at runtime where no table or column names are hardcoded, so the agent adapts to whatever it's pointed at. The agent reasons about the question, drafts a query, and runs it. If the query errors, the failure is fed back into the LLM, which self-corrects and retries within a bounded iteration limit. Reasoning is powered by Llama 3 70B served through Groq for fast inference. Every response returns three things: the plain-English answer, the exact SQL used (for trust and auditability), and the raw results. A React frontend gives users a chat interface, a live schema browser, query history, and a SQL viewer, with FastAPI orchestrating the agent and database access behind the scenes.

Key Challenges

The hardest part was making the agent trustworthy rather than just functional. Dynamic schema introspection was essential as hardcoding structure would have made it a demo, not a tool but it meant the agent had to reason correctly about foreign-key relationships across nine tables on the fly. Building a bounded self-correction loop (feed the SQL error back, retry, but never loop forever) required careful tuning so the agent recovers from mistakes without spiraling. Surfacing the generated SQL to the user was a deliberate design choice: it turns an opaque black box into something a skeptical analyst can verify at a glance.

Outcome

The result is a working analytics tool that collapses the "ask an analyst and wait" loop into a few seconds, while staying honest because every answer ships with the query that produced it, users can trust the result or check the work themselves.

Technical Stack

React, Vite, Tailwind, FastAPI, PostgreSQL, SQLAlchemy, LangChain, Groq, Llama 3 70B`,
  },
//   {
//     id: "car-snap",
//     title: "Car-Snap",
//     description:
//       "AI-powered car damage detection",
//     metaDescription:
//       "Car-Snap — an automotive inspection platform using a two-stage custom CNN for damage detection and classification, with a blockchain ledger for tamper-proof inspection records.",
//     screenshots: [
//       img("car-snap", "1.jpeg"),
//       img("car-snap", "2.jpeg"),
//       img("car-snap", "3.jpeg"),
//       img("car-snap", "4.jpeg"),
//       img("car-snap", "5.jpeg"),
//       img("car-snap", "6.jpeg"),
//       img("car-snap", "7.jpeg"),
//       img("car-snap", "8.jpeg"),
//       img("car-snap", "9.jpeg"),
//     ],
//     caseStudy: `Overview

// Car-Snap is an automotive inspection platform that replaces manual damage assessment with instant, AI-driven analysis, backed by blockchain for tamper-proof record-keeping. Built with a custom CNN architecture, a decentralized verification layer, and a full-stack React and Django foundation, it's designed to make car inspection faster, more consistent, and trustworthy at scale.

// The Problem

// Manual car inspections are slow, inconsistent, and hard to verify after the fact, a problem that compounds in high-stakes scenarios like insurance claims or cross-border vehicle auctions, where trust between parties can't be assumed. There's no easy way to prove an inspection result hasn't been altered after the fact.

// The Solution

// I built two custom CNN models working in sequence: the first detects whether damage is present at all, the second classifies it into specific categories, front, trunk, sides, or windshield. This two-stage approach keeps classification accurate and avoids false positives on undamaged vehicles. To solve the trust problem, every inspection result and image hash gets recorded on a blockchain ledger. Once written, that record can't be altered, giving users a verifiable, tamper-proof history for every assessment, whether they're inspecting a car locally or verifying a vehicle for an international auction. The platform runs on React for the frontend and Django for the backend, with a community layer built on Django Channels, letting users connect, share insights, and engage around automotive inspection as a shared interest rather than just a transaction.

// Key Challenges

// Training a CNN to reliably distinguish damage presence from damage type required careful dataset curation and a two-model architecture rather than a single classifier, this kept accuracy high despite a limited dataset focused on main body parts. Integrating blockchain for review and image hash storage meant designing a system that stayed fast and usable for end users while still leveraging a decentralized, immutable ledger underneath. Bridging real-time community features with the inspection workflow also required tight coordination between the Django backend and Django Channels for live interaction.

// Outcome

// Car-Snap delivers instant, data-driven damage assessments that hold up to scrutiny, removing the guesswork and trust gaps of manual inspection. While currently scoped to main body parts due to dataset limitations, the architecture is built to scale, with a clear path to expanding classification coverage as the dataset and platform grow.

// Technical Stack

// React, Django, Django Channels, Convolutional Neural Networks (CNN), Blockchain`,
//   },
  {
    id: "aesh-summer",
    title: "Aesh.Summer",
    description:
      "A full e-commerce platform for a clothing brand.",
    metaDescription:
      "Aesh.Summer — a full e-commerce platform for a clothing brand built with Next.js and MongoDB, balancing product discovery and checkout with a distinct brand identity.",
    screenshots: [img("aesh-summer", "1.png"), img("aesh-summer", "2.png")],
    caseStudy: `Overview

Aesh.Summer is a full e-commerce platform built for a clothing brand, designed to feel less like a generic online store and more like an extension of the brand itself. Built with Next.js on the frontend and MongoDB on the backend, it handles everything from product discovery to checkout while putting brand identity front and center.

The Problem

Most e-commerce templates prioritize transactions over identity, products get listed, carts get filled, but the brand behind them gets lost. For a clothing label trying to build a distinct presence, that's a missed opportunity. The challenge was building a platform that could move products efficiently without flattening the brand into just another storefront.

The Solution

I built a dynamic product catalog with search, filtering, and personalized recommendations to make discovery effortless, alongside a dedicated portfolio section showcasing the brand's vision and craftsmanship. Community features encourage users to engage and share, turning the site into more than a transactional space. On the technical side, Next.js handles a responsive, SEO-friendly frontend with server-side rendering so products surface well in search. MongoDB manages product data, user accounts, and order handling, structured for scale as the catalog grows. Styled Components keep the UI modular and themeable, making it easy to evolve the brand's look without rebuilding from scratch.

Key Challenges

Balancing storytelling with functionality was the core tension throughout, every product page needed to sell, but also needed to feel like part of a cohesive brand world rather than a generic listing. On the backend, optimizing MongoDB schemas for scalability took iteration, especially as product variants and order relationships grew more complex. Implementing server-side rendering also meant rethinking how content was structured for both SEO performance and fast page loads.

Outcome

The result is a fast, stylish platform that holds its own as both a functioning store and a brand statement, giving customers a shopping experience that feels intentional, not templated.

Technical Stack

Next.js, React, Node.js, MongoDB, Styled Components`,
  },
  {
    id: "legal-doc-intelligence",
    title: "Legal Document Intelligence",
    description:
      "Question any contract, get answers with cited proof",
    metaDescription:
      "Legal Document Intelligence — a RAG platform for querying contracts and NDAs in plain English, with a two-stage retrieval pipeline that cites the exact quoted passage and page for every answer.",
    screenshots: [
      img("legal-doc-intelligence", "1.png"),
      img("legal-doc-intelligence", "2.png"),
    ],
    caseStudy: `Overview

Legal Document Intelligence is a RAG-powered platform for interrogating contracts, NDAs, and policy documents in plain English. You upload a PDF and ask questions like a person and every answer comes back with the exact quoted passage and page number it was built from, so you can verify it in seconds instead of re-reading the whole document. It supports multiple documents at once and can answer comparison questions across an entire library.

The Problem

Legal, procurement, and operations teams spend hours re-reading dense contracts to answer routine questions like termination notice periods, confidentiality terms, which of three leases has the strictest default clause. The alternatives all fail at scale: manually re-reading is slow, asking a lawyer is expensive for simple lookups, and pasting text into a generic chatbot invites confident, invented answers which is a serious risk when the response might inform a business or legal decision.

The Solution

I built a two-stage retrieval pipeline designed around trust rather than just convenience. Uploaded PDFs are parsed page-by-page with PyMuPDF (so page numbers stay exact), split into token-aware overlapping chunks, embedded locally, and stored in ChromaDB with metadata. On a query, the system retrieves the top 15 candidate passages by embedding similarity, then re-ranks them with a cross-encoder that reads the question and each passage together, catching cases where "closest fingerprint" isn't the same as "actually answers the question." Only the best 5 passages reach the LLM, under a strict prompt that forbids answering from anything outside the provided text, requires a document-and-page citation for every claim, and demands the model say "I couldn't find this" rather than guess. Every answer carries a High/Medium/Low confidence badge derived from embedding similarity.

Key Challenges

The core insight was that a single retrieval pass isn't enough: embedding similarity is fast and searches everything but only measures topical closeness, while a cross-encoder is accurate but too slow to run over every chunk. Splitting retrieval into a fast wide net plus a slow precise re-rank gave both. A subtler challenge was confidence scoring as the cross-encoder's ranking score is good for ordering candidates but is an unbounded, often-negative number that's meaningless to show a user, so the displayed confidence uses bounded cosine similarity instead. Keeping documents private was also a hard constraint: parsing, embedding, and indexing all run locally, and the only thing that ever leaves the machine is the handful of ranked snippets sent to the LLM at answer time.

Outcome

A question that used to mean opening a PDF and hunting for a clause now takes seconds and comes back with the exact sentence behind it. Because every answer traces to a quote and a page, the system works as a trustworthy first-pass research assistant which is fast enough to be useful and honest enough to rely on.

Technical Stack

React, Vite, Tailwind, FastAPI, ChromaDB, sentence-transformers, cross-encoder re-ranking, LangChain, Groq, PyMuPDF`,
  },

];

// Card thumbnail defaults to the first screenshot unless one is set explicitly.
projects.forEach((p) => {
  if (!p.imgUrl) p.imgUrl = p.screenshots[0];
});

export default projects;
