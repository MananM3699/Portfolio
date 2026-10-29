// Single source of truth for profile content. Keep this in sync with the resume PDF in /public.

// Bump when content changes. A constant keeps every page statically prerendered.
export const LAST_UPDATED = "October 2026";

export const profile = {
  name: "Manan Mandaliya",
  role: "Senior Software Engineer",
  company: "IITIL",
  location: "Vadodara, India",
  yearsOfExperience: "5+",
  email: "mandaliyamanan@gmail.com",
  phone: "+91 79845 70126",
  phoneHref: "tel:+917984570126",
  linkedin: "https://www.linkedin.com/in/manan-mandaliya-8a1797197",
  // TODO: add a GitHub URL if you want it shown, or leave empty to hide it.
  github: "",
  resumePath: "/manan-mandaliya-resume.pdf",
  // Portrait for the hero (file in /public). Empty = a monogram card is shown instead.
  photo: "/me.webp",
  // Optional booking link (Calendly, Cal.com, Google Calendar). When set, /contact shows a
  // "Schedule a call" card.
  schedulingUrl: "https://calendly.com/mandaliyamanan/30min",
  headline: "I architect the frontends enterprise SaaS teams ship on.",
  summary:
    "Full Stack Engineer with 5+ years of experience building scalable web applications across enterprise HR platforms, AI-powered analytics, and Web3 ecosystems. Specialized in React and TypeScript, with experience developing Node.js and MongoDB backends to deliver secure, high-performance, end-to-end solutions.",
} as const;

// The resume says "6+" in Experience and "nine" in Projects. Pick one and use it everywhere.
export const HRMS_MODULE_COUNT = 9;

export const about =
  "I've shipped production software since 2021. I started as an intern at Alite Projects writing Solidity contracts and wallet UIs, moved to full-stack SaaS at Helios Solutions (an AI analytics product, a publishing platform, a MongoDB remodel), and now architect the frontend of a multi-module HRMS at IITIL. The parts I care about most are the ones users never see: permission models, cache invalidation and type-safe contracts between frontend and backend.";

export const quickFacts = [
  `${profile.role} @ ${profile.company}`,
  "5+ years of experience",
  "React + TypeScript, Express + MongoDB",
  "Bachelor of Engineering",
  profile.location,
] as const;

// Shown on /contact. Keep it to what you'd actually say yes to.
export const openTo = [
  "Senior frontend / full-stack roles",
  "Frontend architecture & design-system work",
  "Contract and consulting projects",
  "Remote teams across time zones",
] as const;

export const proofPoints = [
  {
    value: `${HRMS_MODULE_COUNT}`,
    label: "HRMS modules on one shared component system",
  },
  {
    value: "30–35%",
    label: "faster MongoDB reads after a schema redesign",
  },
  {
    value: "SSE",
    label: "LLM answers streamed into live charts",
  },
  {
    value: "800+",
    label: "testnet transactions; 10% lower gas costs",
  },
] as const;

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    role: "Senior Software Engineer",
    company: "IITIL",
    location: "Hyderabad (remote)",
    period: "May 2026 – Present",
    current: true,
    summary: "Frontend architecture for a multi-module enterprise HRMS.",
    highlights: [
      `Architect the frontend across ${HRMS_MODULE_COUNT} HRMS modules in React + TypeScript, with reusable component patterns and type-safe API contracts.`,
      "Built the shared Tailwind + shadcn/ui component layer the modules are assembled from.",
      "Own server state with Redux Toolkit + RTK Query: caching, mutations and tag-based cache invalidation.",
      "Implement RBAC, schema-validated forms and scheduling workflows, driven by spec-first development with GitHub Spec Kit.",
      "Contribute to database schema design and backend business logic with the API team.",
    ],
    stack: [
      "React",
      "TypeScript",
      "RTK Query",
      "Tailwind",
      "shadcn/ui",
      "Zod",
      "FullCalendar",
    ],
  },
  {
    role: "Software Engineer",
    company: "Helios Solutions",
    location: "Vadodara",
    period: "May 2024 – May 2026",
    summary:
      "Full-stack product work on SaaS dashboards, an AI analytics product and a publishing platform.",
    highlights: [
      "Shipped full-stack features (dashboards, auth, dynamic forms) with React, Next.js, Express and MongoDB.",
      "Built REST APIs with JWT auth, RBAC and request-validation middleware.",
      "Redesigned MongoDB models (embedding related documents where reads dominate), which cut query overhead by 30–35%.",
      "Added offline persistence with IndexedDB and supported deployments on AWS EC2 and S3.",
    ],
    stack: [
      "Next.js",
      "React",
      "Nuxt",
      "Express",
      "MongoDB",
      "Redux Toolkit",
      "AWS",
    ],
  },
  {
    role: "Software Engineer (Intern → Full-time)",
    company: "Alite Projects",
    location: "Vadodara",
    period: "Jul 2021 – May 2024",
    summary:
      "Web3 product engineering: smart contracts and wallet-connected interfaces.",
    highlights: [
      "Wrote and tested Solidity contracts (ERC-20/ERC-721) with Hardhat across 800+ testnet transactions, and cut gas costs by 10%.",
      "Built React dApp interfaces with Ethers.js and RainbowKit: 6+ wallet providers and real-time transaction tracking.",
      "Grew from intern to full-time engineer across frontend, contracts and integrations.",
    ],
    stack: ["Solidity", "Hardhat", "Ethers.js", "Wagmi", "RainbowKit", "React"],
  },
];

// Tiered by how often each is used, not a logo wall.
export const skillTiers = [
  {
    tier: "Daily",
    note: "What I reach for on every feature",
    items: [
      "React",
      "TypeScript",
      "Next.js",
      "Redux Toolkit",
      "RTK Query",
      "React Hook Form",
      "Zod",
      "Tailwind CSS",
      "shadcn/ui",
      "Node.js",
      "Express",
      "MongoDB",
    ],
  },
  {
    tier: "Shipped in production",
    note: "Used in real products, not just tutorials",
    items: [
      "Vue / Nuxt",
      "Pinia",
      "IndexedDB",
      "Server-Sent Events",
      "FullCalendar",
      "Plotly",
      "React-Leaflet",
      "JWT + RBAC",
      "AWS EC2 / S3",
      "Solidity",
      "Hardhat",
      "Ethers.js",
      "Wagmi",
      "RainbowKit",
      "Zoom Video SDK",
      "GitHub Spec Kit",
    ],
  },
  {
    tier: "Worked with",
    note: "Comfortable, less depth",
    items: [
      "PostgreSQL",
      "Docker",
      "n8n",
      "OpenAI / Claude / Mistral / Groq APIs",
      "OpenZeppelin",
      "ERC-1155",
      "Bootstrap",
      "jQuery",
    ],
  },
] as const;

export const education = [
  {
    title: "Bachelor of Engineering",
    org: "Neotech Technical Campus (GTU)",
    period: "2016 – 2020",
  },
] as const;
