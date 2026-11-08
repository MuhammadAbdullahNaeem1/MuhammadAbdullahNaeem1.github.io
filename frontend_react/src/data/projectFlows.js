// Project modal content, keyed by project id: a one-line summary, the
// interactive "How it works" diagram, and short Problem / Approach / Outcome
// sections. Everything is condensed from the case studies in projects.js
// (which still show in full under "Read the full case study").
//
// Diagram format and routing rules: components/FlowChart/FlowChart.jsx.
// Columns are 0 (left), 1 (centre), 2 (right). Keep titles under ~22
// characters and subtitles under ~30 so they fit their boxes.

const flows = {
  "symptomsense-ai": {
    summary:
      "Cardiac MRI diagnostics that learn across hospitals without patient scans ever leaving them.",
    nodes: [
      { id: "upload", title: "Cardiac MRI upload", sub: "Next.js clinician portal", col: 1, row: 0,
        detail: "A clinician uploads a patient's cardiac MRI scan through the web portal and follows its progress in real time." },
      { id: "hospitals", title: "Hospital nodes", sub: "train locally, scans stay put", col: 0, row: 1,
        detail: "Each participating hospital trains the model on its own scans. Raw patient data never leaves the institution." },
      { id: "api", title: "Django API", sub: "validation & preprocessing", col: 1, row: 1,
        detail: "The backend validates the upload and prepares the scan for the imaging model." },
      { id: "agg", title: "Federated aggregation", sub: "merges model updates only", col: 0, row: 2,
        detail: "Only model updates are sent and merged, using a custom aggregation strategy that copes with different hospitals' data distributions." },
      { id: "seg", title: "SwinUNet", sub: "segments cardiac structures", col: 1, row: 2,
        detail: "A transformer-based segmentation model isolates the heart's structures from the MRI with high precision." },
      { id: "features", title: "Feature extraction", sub: "structural measurements", col: 1, row: 3,
        detail: "Measurements are taken from the segmented structures and turned into features for classification." },
      { id: "rf", title: "Random Forest", sub: "HCM classification", col: 1, row: 4,
        detail: "A Random Forest classifier uses the extracted features to flag Hypertrophic Cardiomyopathy." },
      { id: "report", title: "Diagnosis report", sub: "back to the clinician", col: 1, row: 5,
        detail: "The result goes back to the clinician in the portal, ready for clinical review." },
    ],
    edges: [
      ["upload", "api"],
      ["api", "seg"],
      ["hospitals", "agg", { label: "updates" }],
      ["agg", "seg"],
      ["seg", "features"],
      ["features", "rf"],
      ["rf", "report"],
    ],
    problem:
      "Hospitals can't pool patient scans to build better models without breaking privacy rules, so diagnostic AI either compromises on privacy or stays stuck inside one institution.",
    approach: [
      "Built a federated learning pipeline where each hospital trains locally and only model updates are aggregated.",
      "Used SwinUNet, a transformer segmentation model, to isolate cardiac structures from MRI scans.",
      "Fed the extracted features into a Random Forest classifier for HCM detection, behind a Django and Next.js app.",
    ],
    outcome:
      "Privacy-preserving HCM detection across distributed datasets, without giving up clinical usability.",
  },

  logiflow: {
    summary:
      "Multi-agent support desk that triages every ticket, answers from your docs, and escalates what it shouldn't handle.",
    nodes: [
      { id: "ticket", title: "Support ticket", sub: "web form or email", col: 1, row: 0,
        detail: "A new ticket arrives from the support form or inbox and enters the pipeline straight away." },
      { id: "classify", title: "Classifier agent", sub: "Gemini · intent, urgency, mood", col: 1, row: 1,
        detail: "Gemini reads the ticket and labels its intent, urgency and sentiment." },
      { id: "policy", title: "Policy rule layer", sub: "deterministic overrides", col: 1, row: 2,
        detail: "Plain rules make the final routing call, so an outage is always treated as critical regardless of what the model thought." },
      { id: "escalate", title: "Escalate to human", sub: "priority handoff", col: 0, row: 3,
        detail: "Critical or low-confidence tickets go to a person with the full context attached." },
      { id: "rag", title: "RAG resolver", sub: "ChromaDB knowledge base", col: 1, row: 3,
        detail: "Standard tickets are answered from the company's own help docs, retrieved from ChromaDB." },
      { id: "churn", title: "Churn alert", sub: "flagged for retention", col: 2, row: 3,
        detail: "Customers hinting they might leave get flagged with the exact trigger phrase and talking points scaled to their account." },
      { id: "confidence", title: "Confidence check", sub: "score vs. floor", col: 1, row: 4,
        detail: "Each drafted answer is scored. Anything below the confidence floor is escalated rather than sent." },
      { id: "reply", title: "Grounded reply", sub: "cites its sources", col: 1, row: 5,
        detail: "An editable reply that shows which help-doc passages it came from." },
      { id: "audit", title: "Audit trail", sub: "live console over SSE", col: 1, row: 6,
        detail: "Every decision streams to a live console, sorted by urgency, so you can see why each ticket was handled the way it was." },
    ],
    edges: [
      ["ticket", "classify"],
      ["classify", "policy"],
      ["policy", "escalate", { label: "critical" }],
      ["policy", "rag", { label: "standard" }],
      ["policy", "churn", { label: "churn risk" }],
      ["rag", "confidence"],
      ["confidence", "escalate", { label: "below floor", via: "elbow" }],
      ["confidence", "reply", { label: "above floor" }],
      ["escalate", "audit", { via: "lane", side: "left" }],
      ["reply", "audit"],
      ["churn", "audit"],
    ],
    problem:
      "Outages sit in the same queue as how-to questions, answer quality depends on who picks up the ticket, and customers about to cancel get the same generic reply as everyone else.",
    approach: [
      "Classified every ticket with Gemini, then let a deterministic rule layer make the final routing call.",
      "Answered standard tickets from the help docs via RAG, with a confidence floor that escalates weak answers.",
      "Flagged churn risk with the triggering phrase and streamed every decision to a live console.",
    ],
    outcome:
      "Urgent issues surface first, answers are consistent and sourced, and at-risk customers are caught while there's still time to save them.",
  },

  "dental-voice-agent": {
    summary:
      "After-hours voice receptionist that books real appointments, texts confirmations and escalates emergencies.",
    nodes: [
      { id: "call", title: "Patient call", sub: "Twilio phone number", col: 1, row: 0,
        detail: "A patient calls the practice after hours and the agent picks up." },
      { id: "vapi", title: "Vapi voice agent", sub: "Deepgram · Groq · ElevenLabs", col: 1, row: 1,
        detail: "Vapi runs the real-time conversation: speech-to-text, the language model and a natural voice." },
      { id: "intent", title: "Intent & triage", sub: "what does the caller need?", col: 1, row: 2,
        detail: "The agent works out whether this is a booking, an emergency or a question it shouldn't answer." },
      { id: "emergency", title: "Emergency check", sub: "never a routine slot", col: 0, row: 3,
        detail: "A knocked-out tooth or heavy bleeding is never booked into a routine slot." },
      { id: "tools", title: "Booking tool layer", sub: "dates, times, number readback", col: 1, row: 3,
        detail: "A separate tool layer owns everything that has to be exact: date and time conversion, and reading the phone number back." },
      { id: "log", title: "Log for staff", sub: "insurance, pricing, clinical", col: 2, row: 3,
        detail: "Insurance, pricing and clinical questions are logged for staff instead of guessed at." },
      { id: "staff", title: "Staff escalation", sub: "urgent handling", col: 0, row: 4,
        detail: "Emergencies are escalated to staff straight away." },
      { id: "cal", title: "Cal.com booking", sub: "live availability", col: 1, row: 4,
        detail: "Checks live calendar availability and holds a real appointment." },
      { id: "sms", title: "SMS confirmation", sub: "sent automatically", col: 1, row: 5,
        detail: "The caller gets a text confirming the booking before the call ends." },
      { id: "callback", title: "Callback promise", sub: "details taken, no dropped line", col: 2, row: 5,
        detail: "If booking fails mid-call, the agent takes the caller's details and promises a callback instead of dropping the line." },
      { id: "dashboard", title: "Supabase dashboard", sub: "every call recorded", col: 1, row: 6,
        detail: "Every call lands in a dashboard with its intent, outcome, transcript and recording." },
    ],
    edges: [
      ["call", "vapi"],
      ["vapi", "intent"],
      ["intent", "emergency", { label: "emergency" }],
      ["intent", "tools", { label: "booking" }],
      ["intent", "log", { label: "won't guess" }],
      ["emergency", "staff"],
      ["tools", "cal"],
      ["cal", "sms", { label: "booked" }],
      ["cal", "callback", { label: "fails" }],
      ["staff", "dashboard"],
      ["sms", "dashboard"],
      ["callback", "dashboard"],
    ],
    problem:
      "Dental practices miss after-hours calls, and every missed call is a lost booking or an emergency nobody heard about.",
    approach: [
      "Orchestrated the live call with Vapi, keeping exact work like dates and phone numbers in a separate tool layer.",
      "Booked against live Cal.com availability and sent SMS confirmations automatically.",
      "Escalated emergencies and refused to guess on insurance, pricing or clinical questions.",
    ],
    outcome:
      "Calls are answered around the clock, real appointments get booked, and anything sensitive reaches staff instead of being improvised.",
  },

  "ai-inbox-manager": {
    summary:
      "Self-hosted n8n workflow that sorts the inbox and drafts grounded replies, but never sends anything itself.",
    nodes: [
      { id: "email", title: "Incoming email", sub: "Gmail, opt-in label", col: 1, row: 0,
        detail: "Only mail under an opt-in label enters the workflow." },
      { id: "triage", title: "Triage", sub: "Gemini · category, urgency, mood", col: 1, row: 1,
        detail: "Each email is labelled Sales, Billing, Urgent and so on, and scored for urgency, sentiment and confidence." },
      { id: "skip", title: "Label & skip", sub: "newsletters, notifications", col: 0, row: 2,
        detail: "Newsletters and automated notifications are labelled and skipped, so noise doesn't create work." },
      { id: "draft", title: "Grounded draft", sub: "RAG over policy docs · Qdrant", col: 1, row: 2,
        detail: "Where a reply is owed, a draft is written from the business's own policy documents, so it never invents a price, policy or date." },
      { id: "log", title: "Collect & log", sub: "a Postgres row per email", col: 1, row: 3,
        detail: "Every email and decision is recorded in Postgres." },
      { id: "write", title: "Write back to Gmail", sub: "labels, read, draft in thread", col: 1, row: 4,
        detail: "Labels are applied, the email is marked read, and the draft is placed in its own thread." },
      { id: "human", title: "Human approves", sub: "no send or delete access", col: 1, row: 5,
        detail: "The workflow has no permission to send or delete. A person reviews and sends every reply." },
    ],
    edges: [
      ["email", "triage"],
      ["triage", "skip", { label: "no reply owed" }],
      ["triage", "draft", { label: "reply owed" }],
      ["skip", "log"],
      ["draft", "log"],
      ["log", "write"],
      ["write", "human"],
    ],
    problem:
      "A busy inbox mixes customers waiting on answers with newsletters and notifications, and writing every reply by hand eats the day.",
    approach: [
      "Built an n8n workflow that labels every email and scores urgency, sentiment and confidence.",
      "Drafted replies with RAG over the business's own policy documents.",
      "Kept a human in control: drafts wait in-thread, and the workflow can't send or delete.",
    ],
    outcome:
      "A sorted inbox with replies ready to approve, and nothing goes out without a person signing off.",
  },

  "churn-radar": {
    summary:
      "Churn model with per-customer SHAP explanations and a nightly-scored action queue.",
    nodes: [
      { id: "data", title: "Customer data", sub: "IBM Telco dataset", col: 1, row: 0,
        detail: "The customer base the model is trained on and re-scores every night." },
      { id: "pipeline", title: "scikit-learn pipeline", sub: "same preprocessing everywhere", col: 1, row: 1,
        detail: "One Pipeline wraps preprocessing and the model, so training and scoring always transform data the same way." },
      { id: "schedule", title: "Nightly scheduler", sub: "APScheduler re-scores all", col: 0, row: 2,
        detail: "An APScheduler job re-scores the entire customer base every night." },
      { id: "model", title: "XGBoost classifier", sub: "0.84 ROC-AUC", col: 1, row: 2,
        detail: "An XGBoost classifier ranks customers by churn probability, with 0.84 ROC-AUC." },
      { id: "shap", title: "SHAP drivers", sub: "precomputed, instant UI", col: 0, row: 3,
        detail: "Each customer's top churn drivers are computed during the nightly run, so pages load instantly." },
      { id: "rules", title: "Rules engine", sub: "retunable without retraining", col: 1, row: 3,
        detail: "Turns risk and drivers into a recommended action. It's separate from the model, so the business can retune it without retraining." },
      { id: "tiers", title: "Risk tiers", sub: "Low / Medium / High", col: 2, row: 3,
        detail: "Every customer gets a Low, Medium or High risk tier." },
      { id: "queue", title: "Action queue", sub: "a next step per customer", col: 1, row: 4,
        detail: "A prioritised list of who to contact and what to do about it." },
      { id: "dashboard", title: "Dashboard", sub: "Next.js · Recharts · FastAPI", col: 1, row: 5,
        detail: "A dashboard a non-technical manager can read: how many customers are at risk, why, and what to do next." },
    ],
    edges: [
      ["data", "pipeline"],
      ["pipeline", "model"],
      ["schedule", "model"],
      ["model", "shap", { label: "why" }],
      ["model", "tiers", { label: "how risky" }],
      ["shap", "rules"],
      ["tiers", "rules"],
      ["rules", "queue"],
      ["queue", "dashboard"],
    ],
    problem:
      "SaaS teams only learn a customer is unhappy when they cancel, and even when risk is known, nobody knows who to call first.",
    approach: [
      "Trained an XGBoost classifier inside a single scikit-learn Pipeline, re-scoring everyone nightly.",
      "Precomputed SHAP drivers for every customer so explanations load instantly.",
      "Kept a separate rules engine that turns risk into a concrete, retunable next step.",
    ],
    outcome:
      "A manager can see who is at risk, why, and work a ready-made action queue, all without touching a spreadsheet.",
  },

  nl2sql: {
    summary:
      "Plain-English questions answered from a live PostgreSQL database, with the exact SQL shown.",
    nodes: [
      { id: "question", title: "Plain-English question", sub: "React chat UI", col: 1, row: 0,
        detail: "A business user types a question like “which category had the highest revenue?”" },
      { id: "api", title: "FastAPI", sub: "one request per question", col: 1, row: 1,
        detail: "The backend passes the question to the agent and returns its answer." },
      { id: "schema", title: "Schema introspection", sub: "live PostgreSQL, 9 tables", col: 0, row: 2,
        detail: "The agent reads the live schema at runtime. No table or column names are hardcoded." },
      { id: "agent", title: "ReAct SQL agent", sub: "LangChain · Llama 3 70B", col: 1, row: 2,
        detail: "A LangChain ReAct agent on Llama 3 70B (via Groq) reasons about the question and the schema." },
      { id: "sql", title: "Draft SQL", sub: "joins worked out on the fly", col: 1, row: 3,
        detail: "It writes a query, working out the foreign-key joins across nine tables." },
      { id: "run", title: "Execute query", sub: "read against PostgreSQL", col: 1, row: 4,
        detail: "The query runs against the real database." },
      { id: "error", title: "Error fed back", sub: "bounded retries", col: 2, row: 4,
        detail: "If the query fails, the error goes back to the model, which corrects itself, with a cap on retries so it never loops forever." },
      { id: "answer", title: "Answer", sub: "plus the SQL and results", col: 1, row: 5,
        detail: "A plain-language answer, shown with the exact query and results table, so anyone can check the work." },
    ],
    edges: [
      ["question", "api"],
      ["api", "agent"],
      ["agent", "schema"],
      ["agent", "sql"],
      ["sql", "run"],
      ["run", "error"],
      ["error", "sql", { label: "self-correct" }],
      ["run", "answer", { label: "success" }],
    ],
    problem:
      "Business questions live in the database, but the people asking them can't write SQL, so every simple lookup waits on an analyst.",
    approach: [
      "Built a ReAct SQL agent that introspects the live schema instead of hardcoding it.",
      "Fed query errors back to the model for bounded self-correction.",
      "Returned every answer with the SQL that produced it and the results table.",
    ],
    outcome:
      "Questions that took hours through an analyst now take seconds, and every answer can be verified.",
  },

  "aesh-summer": {
    summary:
      "Full e-commerce platform for a clothing label, built to sell while keeping the brand front and centre.",
    nodes: [
      { id: "shopper", title: "Shopper", sub: "search & social traffic", col: 1, row: 0,
        detail: "Visitors arrive from search and social, landing on fast server-rendered pages." },
      { id: "ssr", title: "Next.js storefront", sub: "server-rendered for SEO", col: 1, row: 1,
        detail: "Server-side rendering keeps pages fast and helps products surface well in search." },
      { id: "brand", title: "Brand portfolio", sub: "vision & craftsmanship", col: 0, row: 2,
        detail: "A dedicated section that tells the brand's story and shows its craftsmanship." },
      { id: "catalog", title: "Product catalog", sub: "search, filters, recs", col: 1, row: 2,
        detail: "Search, filtering and personalised recommendations make products easy to find." },
      { id: "community", title: "Community", sub: "share & engage", col: 2, row: 2,
        detail: "Community features let customers engage and share, turning the store into more than a checkout." },
      { id: "cart", title: "Cart & checkout", sub: "variants & orders", col: 1, row: 3,
        detail: "Handles product variants through to a completed order." },
      { id: "api", title: "Node.js API", sub: "products, users, orders", col: 1, row: 4,
        detail: "The backend serves products, user accounts and orders." },
      { id: "db", title: "MongoDB", sub: "schemas built to scale", col: 1, row: 5,
        detail: "Schemas were iterated on to stay fast as variants and order relationships grew." },
    ],
    edges: [
      ["shopper", "ssr"],
      ["ssr", "brand"],
      ["ssr", "catalog"],
      ["ssr", "community"],
      ["catalog", "cart"],
      ["cart", "api"],
      ["community", "api"],
      ["api", "db"],
    ],
    problem:
      "Most e-commerce templates put transactions first and lose the brand behind the products.",
    approach: [
      "Built a dynamic catalog with search, filters and personalised recommendations.",
      "Added a brand portfolio and community features alongside the store.",
      "Used server-side rendering with Next.js and scalable MongoDB schemas.",
    ],
    outcome:
      "A fast, stylish store that works as both a shop and a brand statement.",
  },

  "legal-doc-intelligence": {
    summary:
      "Ask questions about contracts in plain English and get answers with the exact quote and page.",
    nodes: [
      { id: "pdf", title: "PDF upload", sub: "contracts, NDAs, policies", col: 0, row: 0,
        detail: "Upload one or more legal documents. They're processed locally." },
      { id: "question", title: "Plain-English question", sub: "one or many documents", col: 2, row: 0,
        detail: "Ask something like “what's the termination notice period?”, across one document or the whole library." },
      { id: "parse", title: "PyMuPDF parsing", sub: "page by page, exact pages", col: 0, row: 1,
        detail: "Parsed page by page so every page number stays exact." },
      { id: "embed", title: "Chunk & embed", sub: "local sentence-transformers", col: 0, row: 2,
        detail: "Split into token-aware overlapping chunks and embedded with a local model." },
      { id: "chroma", title: "ChromaDB", sub: "vectors + page metadata", col: 1, row: 2,
        detail: "Chunks are stored with their page and document metadata." },
      { id: "retrieve", title: "Top-15 retrieval", sub: "embedding similarity", col: 2, row: 2,
        detail: "A fast, wide first pass pulls the 15 passages closest to the question." },
      { id: "rerank", title: "Cross-encoder re-rank", sub: "keeps the best 5", col: 1, row: 3,
        detail: "A cross-encoder reads the question and each passage together, keeping the 5 that actually answer it." },
      { id: "llm", title: "LLM · Groq", sub: "strict cite-or-decline prompt", col: 1, row: 4,
        detail: "The model may only answer from those passages, and must cite them." },
      { id: "answer", title: "Cited answer", sub: "quote, page & confidence", col: 0, row: 5,
        detail: "Every answer comes with the quoted passage, its page, and a confidence score." },
      { id: "decline", title: "“Couldn’t find it”", sub: "never an invented clause", col: 2, row: 5,
        detail: "If the documents don't support an answer, it says so instead of inventing one." },
    ],
    edges: [
      ["pdf", "parse"],
      ["parse", "embed"],
      ["embed", "chroma"],
      ["question", "retrieve"],
      ["chroma", "retrieve"],
      ["retrieve", "rerank"],
      ["rerank", "llm"],
      ["llm", "answer", { label: "supported" }],
      ["llm", "decline", { label: "not in the docs" }],
    ],
    problem:
      "Teams spend hours re-reading contracts for routine answers, and generic chatbots invent confident answers, which is risky when legal decisions depend on them.",
    approach: [
      "Parsed PDFs page by page and stored local embeddings in ChromaDB.",
      "Retrieved widely with embeddings, then re-ranked precisely with a cross-encoder.",
      "Forced cite-or-decline answers with the quote, page and a bounded confidence score.",
    ],
    outcome:
      "A clause hunt now takes seconds, and every answer traces back to the exact sentence behind it.",
  },
};

export default flows;
