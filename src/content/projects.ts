import { HRMS_MODULE_COUNT } from "./site";

export type ProjectSlug = "hrms" | "solbi" | "solidify" | "accomplishr";

export type Project = {
  slug: ProjectSlug;
  title: string;
  org: string;
  domain: string;
  period: string;
  role: string;
  tagline: string;
  outcome: string;
  stack: string[];
  readTime: string;
  hasDemo: boolean;
  /** Has a full /work/[slug] page. Others are summarised on the home page. */
  caseStudy: boolean;
};

// Ordered by how strongly each story supports the positioning.
const projects: Project[] = [
  {
    slug: "hrms",
    title: "HRMS",
    org: "IITIL",
    domain: "Enterprise SaaS",
    period: "2026 – Present",
    role: "Senior Software Engineer · Frontend architecture",
    tagline: "A permission-aware HR platform, built as one design system.",
    outcome: `${HRMS_MODULE_COUNT} modules (employee lifecycle, org, leave, attendance, documents, rosters) on a shared, type-safe component layer.`,
    stack: ["React", "TypeScript", "RTK Query", "shadcn/ui", "Zod", "FullCalendar", "Spec Kit"],
    readTime: "6 min",
    hasDemo: true,
    caseStudy: true,
  },
  {
    slug: "solbi",
    title: "SolBI",
    org: "Helios Solutions",
    domain: "AI · Business Intelligence",
    period: "2024 – 2026",
    role: "Software Engineer · Full stack",
    tagline: "Ask a business question in plain English, then watch the answer and chart stream in.",
    outcome: "Natural-language queries to streamed answers and interactive charts and maps, with saved dashboards.",
    stack: ["Next.js", "React", "SSE", "Plotly", "React-Leaflet", "Express", "MongoDB", "IndexedDB"],
    readTime: "5 min",
    hasDemo: true,
    caseStudy: true,
  },
  {
    slug: "solidify",
    title: "Solidify",
    org: "Alite Projects",
    domain: "Web3 · DApp",
    period: "2021 – 2024",
    role: "Software Engineer · Contracts + frontend",
    tagline: "Designing UI for irreversible actions: ICOs, governance and airdrops.",
    outcome: "6+ wallet providers, real-time transaction tracking, and contracts tested across 800+ testnet transactions with 10% lower gas costs.",
    stack: ["Next.js", "Solidity", "Hardhat", "Wagmi", "RainbowKit", "Ethers.js"],
    readTime: "4 min",
    hasDemo: false,
    caseStudy: false,
  },
  {
    slug: "accomplishr",
    title: "Accomplishr",
    org: "Helios Solutions",
    domain: "Publishing · Video",
    period: "2024 – 2025",
    role: "Software Engineer · Frontend",
    tagline: "Blogs, live fireside chats and session booking in one modular Nuxt app.",
    outcome: "Zoom Video SDK sessions, a publishing CMS and validated booking flows on Vue composables + Pinia.",
    stack: ["Nuxt", "Vue", "Pinia", "Zoom Video SDK", "Zod", "date-fns"],
    readTime: "3 min",
    hasDemo: false,
    caseStudy: false,
  },
];

export function getProject(slug: ProjectSlug): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

export const caseStudies = projects.filter((p) => p.caseStudy);

export function getAdjacentProjects(slug: ProjectSlug) {
  const i = caseStudies.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? caseStudies[i - 1] : null,
    next: i >= 0 && i < caseStudies.length - 1 ? caseStudies[i + 1] : null,
  };
}
