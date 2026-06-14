import type { WritingEntry } from "./content";
import { initArticleMarkdownActions } from "./article-markdown";
import { syncLongformMeta } from "./longform-meta";

type CommentTheme = "light" | "dark_dimmed";

interface LongformOptions {
  readonly entries: readonly WritingEntry[];
  readonly getCommentTheme: () => CommentTheme;
  readonly onCommentsReady: () => void;
}

interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

export function initLongform(options: LongformOptions): void {
  const article = document.querySelector<HTMLElement>("article.longform");
  if (!article) {
    return;
  }

  syncLongformMeta(article, options.entries);
  initTableOfContents(article);
  initArticleMarkdownActions(article);
  initArticleNavigation(article, options.entries);
  initComments(options);
}

export function syncLongformCommentsThemeWhenReady(getCommentTheme: () => CommentTheme, attempt = 0): void {
  syncLongformCommentsTheme(getCommentTheme);
  if (attempt >= 8 || document.querySelector("iframe.giscus-frame")) {
    return;
  }
  window.setTimeout(() => syncLongformCommentsThemeWhenReady(getCommentTheme, attempt + 1), 350);
}

function initTableOfContents(article: HTMLElement): void {
  if (article.closest(".longform-shell")) {
    return;
  }

  const tocItems = collectTocItems(article);
  if (tocItems.length === 0) {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "longform-shell";

  const toc = document.createElement("aside");
  toc.className = "article-toc";
  toc.setAttribute("aria-label", "Table of contents");
  toc.innerHTML = `
    <p class="article-toc-title">On this page</p>
    <nav>
      ${tocItems
        .map(
          (item) =>
            `<a class="article-toc-link article-toc-link-level-${item.level}" href="#${item.id}">${item.text}</a>`
        )
        .join("")}
    </nav>
  `;

  article.before(shell);
  shell.append(toc, article);
  initActiveTocLink(toc, article);
}

function collectTocItems(article: HTMLElement): TocItem[] {
  const headings = [...article.querySelectorAll<HTMLHeadingElement>("h2, h3")];
  const seenIds = new Map<string, number>();

  return headings.map((heading) => {
    const text = heading.textContent?.trim() ?? "";
    const id = heading.id || createHeadingId(text, seenIds);
    heading.id = id;

    return {
      id,
      text,
      level: heading.tagName === "H3" ? 3 : 2
    };
  });
}

function createHeadingId(text: string, seenIds: Map<string, number>): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const baseId = `section-${slug || "section"}`;
  const priorCount = seenIds.get(baseId) ?? 0;
  seenIds.set(baseId, priorCount + 1);
  return priorCount === 0 ? baseId : `${baseId}-${priorCount + 1}`;
}

function initActiveTocLink(toc: HTMLElement, article: HTMLElement): void {
  const links = [...toc.querySelectorAll<HTMLAnchorElement>(".article-toc-link")];
  const headings = [...article.querySelectorAll<HTMLHeadingElement>("h2, h3")];
  if (links.length === 0 || headings.length === 0) {
    return;
  }

  const setActive = (id: string): void => {
    links.forEach((link) => {
      const isActive = link.hash === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let frame: number | null = null;
  const readOffset = (): number => {
    const header = document.querySelector<HTMLElement>(".site-header");
    return (header?.getBoundingClientRect().bottom ?? 0) + 56;
  };
  const updateActive = (): void => {
    const offset = readOffset();
    let activeHeading = headings[0];
    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top <= offset) {
        activeHeading = heading;
      }
    });
    setActive(activeHeading.id);
    frame = null;
  };
  const scheduleUpdate = (): void => {
    if (frame === null) {
      frame = window.requestAnimationFrame(updateActive);
    }
  };

  updateActive();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
}

function initArticleNavigation(article: HTMLElement, entries: readonly WritingEntry[]): void {
  if (document.querySelector(".article-nav")) {
    return;
  }

  const publishedEntries = entries.filter((entry) => entry.url !== "#").sort(byNewest);
  const currentPath = normalizePath(window.location.pathname);
  const currentIndex = publishedEntries.findIndex((entry) => normalizePath(entry.url) === currentPath);
  if (currentIndex === -1) {
    return;
  }

  const newerEntry = publishedEntries[currentIndex - 1];
  const olderEntry = publishedEntries[currentIndex + 1];
  if (!newerEntry && !olderEntry) {
    return;
  }

  const nav = document.createElement("nav");
  nav.className = "article-nav";
  nav.setAttribute("aria-label", "Post navigation");
  nav.innerHTML = `
    ${newerEntry ? renderArticleNavLink(newerEntry, "prev") : '<span aria-hidden="true"></span>'}
    ${olderEntry ? renderArticleNavLink(olderEntry, "next") : '<span aria-hidden="true"></span>'}
  `;

  article.parentElement?.after(nav);
}

function renderArticleNavLink(entry: WritingEntry, direction: "prev" | "next"): string {
  const arrow = direction === "prev" ? "←" : "→";
  const label = direction === "prev" ? "Newer" : "Older";
  const arrowMarkup = `<span class="article-nav-arrow" aria-hidden="true">${arrow}</span>`;
  const textMarkup = `
    <span class="article-nav-kicker">${label}</span>
    <span class="article-nav-title">${entry.title}</span>
  `;

  return direction === "prev"
    ? `<a class="article-nav-link article-nav-link-prev" href="${entry.url}">${arrowMarkup}<span>${textMarkup}</span></a>`
    : `<a class="article-nav-link article-nav-link-next" href="${entry.url}"><span>${textMarkup}</span>${arrowMarkup}</a>`;
}

function initComments(options: LongformOptions): void {
  const target = document.querySelector<HTMLElement>("[data-comments]");
  if (!target || target.dataset.loaded === "true") {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  script.setAttribute("data-repo", "khankaholic/khankaholic.github.io");
  script.setAttribute("data-repo-id", "R_kgDORKH1ng");
  script.setAttribute("data-category", "General");
  script.setAttribute("data-category-id", "DIC_kwDORKH1ns4C2AlT");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", options.getCommentTheme());
  script.setAttribute("data-lang", "en");
  script.addEventListener("load", options.onCommentsReady);

  target.append(script);
  target.dataset.loaded = "true";
}

function syncLongformCommentsTheme(getCommentTheme: () => CommentTheme): void {
  const frame = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  if (!frame?.contentWindow) {
    return;
  }

  frame.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme: getCommentTheme()
        }
      }
    },
    "https://giscus.app"
  );
}

function byNewest(a: WritingEntry, b: WritingEntry): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function normalizePath(path: string): string {
  if (path === "/") {
    return "/";
  }
  return path.replace(/\/+$/, "");
}
