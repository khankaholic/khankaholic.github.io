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

export const projectEntries: ProjectEntry[] = [];

export const experienceEntries: ExperienceEntry[] = [
  {
    role: "AI Research Engineer",
    company: "Employment Hero",
    period: "Mar 2025 - Present",
    location: "Hanoi, Vietnam",
    highlights: [
      "Developed an intelligent onboarding information-extraction pipeline for scanned/naive PDFs, Excel, and CSV sources.",
      "Designed and implemented HeroAI agent workflows for KBA/policy, payroll, leave, and roster domains.",
      "Maintained research datasets, prompt versions, tracing, and feedback loops to keep experiments consistent across the team."
    ]
  },
  {
    role: "AI Engineer / Researcher",
    company: "Cinnamon",
    period: "Jun 2023 - Mar 2025",
    location: "Ho Chi Minh City",
    highlights: [
      "Researched and implemented document image understanding pipelines with LLMs for extraction and structured outputs.",
      "Built dynamic few-shot extraction workflows that improved F1 by 5-15% while reducing annotation effort.",
      "Developed asynchronous microservice AI systems that reduced 50-page processing time from ~500s to ~340s."
    ]
  },
  {
    role: "AI Research Engineer",
    company: "Rikkeisoft",
    period: "Jan 2023 - Aug 2023",
    location: "Hanoi, Vietnam",
    highlights: [
      "Trained and evaluated lightweight CV models for document image classification with 85%+ accuracy on client datasets.",
      "Worked with YOLOv5 for object counting tasks and tuned augmentation strategies for varying daylight environments."
    ]
  },
  {
    role: "Bachelor of Data Science and AI (Very Good)",
    company: "Hanoi University of Science and Technology (HUST)",
    period: "2019 - 2023",
    location: "Hanoi, Vietnam",
    highlights: [
      "Focused on machine learning, deep learning, NLP, and practical AI system development.",
      "Published at PAKDD 2025: Automatic Prompt Selection for Large Language Models (arXiv:2404.02717)."
    ]
  }
];
