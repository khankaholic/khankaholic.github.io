export const SITE_NAME = "Khanh Hoang";
export const DATAFAST_PUBLIC_DASHBOARD_URL =
  "https://datafa.st/share/6988a75508b2828cdde2c989?realtime=1";

export interface SiteMeta {
  title: string;
  description: string;
}

const defaultDescription =
  "Khanh's personal site with technical writing, book reviews, projects, and CV.";

export const DEFAULT_META: SiteMeta = {
  title: `${SITE_NAME} | Writing, Projects, Books`,
  description: defaultDescription
};

export const PAGE_META: Record<string, SiteMeta> = {
  "/": DEFAULT_META,
  "/writing.html": {
    title: `Writing | ${SITE_NAME}`,
    description: "Writing archive: engineering essays and notes by Khanh."
  },
  "/books.html": {
    title: `Books | ${SITE_NAME}`,
    description: "Book reviews and reading notes by Khanh."
  },
  "/projects.html": {
    title: `Projects | ${SITE_NAME}`,
    description: "Projects by Khanh: software systems, tools, and experiments."
  },
  "/cv.html": {
    title: `CV | ${SITE_NAME}`,
    description: "CV and professional background of Khanh."
  },
  "/posts/quiet-systems.html": {
    title: `Building Quiet Systems | ${SITE_NAME}`,
    description: "Building Quiet Systems - an essay by Khanh."
  },
  "/posts/deep-work-notes.html": {
    title: `Deep Work Notes for Engineers | ${SITE_NAME}`,
    description: "Deep Work Notes for Engineers - an essay by Khanh."
  },
  "/reviews/atomic-habits-notes.html": {
    title: `Atomic Habits: What Actually Stuck | ${SITE_NAME}`,
    description: "Atomic Habits review notes by Khanh."
  }
};
