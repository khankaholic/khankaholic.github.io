export type WritingKind = "post" | "review";

export interface WritingEntry {
  title: string;
  excerpt: string;
  date: string;
  kind: WritingKind;
  url: string;
  tag: string;
  readingTime: string;
}

export interface ProjectEntry {
  name: string;
  summary: string;
  stack: string[];
  link: string;
  year: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

export const writingEntries: WritingEntry[] = [
  {
    title: "Building Quiet Systems",
    excerpt:
      "A practical guide for reducing product noise so readers stay inside the core idea.",
    date: "2026-01-22",
    kind: "post",
    url: "/posts/quiet-systems.html",
    tag: "Writing",
    readingTime: "6 min"
  },
  {
    title: "Deep Work Notes for Engineers",
    excerpt:
      "Field notes on defending focus windows while still collaborating with fast-moving teams.",
    date: "2025-12-10",
    kind: "post",
    url: "/posts/deep-work-notes.html",
    tag: "Career",
    readingTime: "7 min"
  },
  {
    title: "Atomic Habits: What Actually Stuck",
    excerpt:
      "My takeaways after applying the book for 90 days in coding and reading habits.",
    date: "2025-11-15",
    kind: "review",
    url: "/reviews/atomic-habits-notes.html",
    tag: "Book Review",
    readingTime: "5 min"
  },
  {
    title: "Learning in Public Without Burning Out",
    excerpt:
      "How to share progress consistently without turning every week into a content sprint.",
    date: "2025-10-06",
    kind: "post",
    url: "#",
    tag: "Learning",
    readingTime: "4 min"
  },
  {
    title: "Slow Productivity by Cal Newport",
    excerpt:
      "A review focused on pace, ambition, and sustainable output for software careers.",
    date: "2025-09-04",
    kind: "review",
    url: "#",
    tag: "Book Review",
    readingTime: "6 min"
  }
];

export const projectEntries: ProjectEntry[] = [
  {
    name: "Handbook Search",
    summary:
      "Internal documentation search with semantic ranking and keyboard-first navigation.",
    stack: ["TypeScript", "Elastic", "Node"],
    link: "#",
    year: "2025"
  },
  {
    name: "Book Notes API",
    summary:
      "A tiny API that stores highlights, tags, and review drafts from my reading workflow.",
    stack: ["TypeScript", "Fastify", "PostgreSQL"],
    link: "#",
    year: "2024"
  },
  {
    name: "Release Pulse",
    summary:
      "Dashboard for tracking deployment lead time, rollback rate, and PR cycle health.",
    stack: ["TypeScript", "React", "Supabase"],
    link: "#",
    year: "2024"
  }
];

export const experienceEntries: ExperienceEntry[] = [
  {
    role: "Senior Software Engineer",
    company: "Your Current Team",
    period: "2023 - Present",
    location: "Remote",
    highlights: [
      "Led a migration from monolith endpoints to typed service modules with measurable reliability gains.",
      "Introduced performance budgets and cut critical page payloads by more than 35%.",
      "Mentored three engineers through design docs and release planning."
    ]
  },
  {
    role: "Software Engineer",
    company: "Previous Company",
    period: "2020 - 2023",
    location: "Ho Chi Minh City",
    highlights: [
      "Built internal tooling that reduced support response time from hours to minutes.",
      "Owned CI pipeline hardening and lowered flaky test rate by introducing deterministic fixtures."
    ]
  },
  {
    role: "BSc in Computer Science",
    company: "Your University",
    period: "2016 - 2020",
    location: "Vietnam",
    highlights: ["Focused on distributed systems, data structures, and practical software design."]
  }
];
