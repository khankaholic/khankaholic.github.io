import "./styles.css";
import { experienceEntries, projectEntries, writingEntries, type WritingEntry } from "./content";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

let revealObserver: IntersectionObserver | null = null;

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function byNewest(a: WritingEntry, b: WritingEntry): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function sortedByNewest(entries: WritingEntry[]): WritingEntry[] {
  return [...entries].sort(byNewest);
}

function initCurrentYear(): void {
  const target = document.querySelector<HTMLElement>("[data-year]");
  if (target) {
    target.textContent = String(new Date().getFullYear());
  }
}

function initNavCurrentState(): void {
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = document.querySelectorAll<HTMLAnchorElement>("[data-nav]");

  navLinks.forEach((link) => {
    const targetPath = normalizePath(new URL(link.href, window.location.origin).pathname);
    const isCurrent = currentPath === targetPath;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function normalizePath(path: string): string {
  if (path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
}

function initRevealObserver(): void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = document.querySelectorAll<HTMLElement>(".reveal");

  if (prefersReducedMotion) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -5% 0px"
    }
  );

  observePendingReveals();
}

function observePendingReveals(): void {
  if (!revealObserver) {
    return;
  }

  document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((target) => {
    revealObserver?.observe(target);
  });
}

function initScrollProgress(): void {
  const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
  if (!bar) {
    return;
  }

  const updateProgress = (): void => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable <= 0 ? 0 : window.scrollY / scrollable;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

function createWritingCard(entry: WritingEntry): string {
  const kindLabel = entry.kind === "review" ? "Book Review" : "Post";
  const linkLabel = entry.kind === "review" ? "Read review" : "Read post";
  const isDraft = entry.url === "#";

  return `
    <article class="card reveal">
      <p class="eyebrow">${kindLabel} · ${entry.readingTime}</p>
      <h3>${entry.title}</h3>
      <p>${entry.excerpt}</p>
      <div class="meta-row">
        <span>${formatDate(entry.date)}</span>
        <span>${entry.tag}</span>
      </div>
      ${isDraft ? '<span class="inline-note">Draft in progress</span>' : `<a href="${entry.url}">${linkLabel}</a>`}
    </article>
  `;
}

function renderHomeWriting(): void {
  const container = document.querySelector<HTMLElement>("#home-writing");
  if (!container) {
    return;
  }

  const latest = sortedByNewest(writingEntries.filter((entry) => entry.kind === "post")).slice(0, 3);
  container.innerHTML = latest.map(createWritingCard).join("");
  observePendingReveals();
}

function renderHomeBooks(): void {
  const container = document.querySelector<HTMLElement>("#home-books");
  if (!container) {
    return;
  }

  const latest = sortedByNewest(writingEntries.filter((entry) => entry.kind === "review")).slice(0, 2);
  container.innerHTML = latest.map(createWritingCard).join("");
  observePendingReveals();
}

function renderWritingIndex(): void {
  const container = document.querySelector<HTMLElement>("#writing-list");
  const filterControls = document.querySelectorAll<HTMLButtonElement>("[data-writing-filter]");
  if (!container) {
    return;
  }

  if (filterControls.length === 0) {
    const posts = sortedByNewest(writingEntries.filter((entry) => entry.kind === "post"));
    container.innerHTML = posts.map(createWritingCard).join("");
    observePendingReveals();
    return;
  }

  const render = (filter: "all" | "post" | "review"): void => {
    const selected =
      filter === "all"
        ? sortedByNewest(writingEntries)
        : sortedByNewest(writingEntries.filter((entry) => entry.kind === filter));

    container.innerHTML = selected.map(createWritingCard).join("");
    observePendingReveals();
  };

  filterControls.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.writingFilter as "all" | "post" | "review";
      filterControls.forEach((control) => {
        control.classList.remove("is-active");
        control.setAttribute("aria-selected", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      render(filter);
    });
  });

  render("all");
}

function renderBooksIndex(): void {
  const container = document.querySelector<HTMLElement>("#books-list");
  if (!container) {
    return;
  }

  const reviews = sortedByNewest(writingEntries.filter((entry) => entry.kind === "review"));
  container.innerHTML = reviews.map(createWritingCard).join("");
  observePendingReveals();
}

function renderHomeProjects(): void {
  const container = document.querySelector<HTMLElement>("#home-projects");
  if (!container) {
    return;
  }

  container.innerHTML = projectEntries
    .slice(0, 2)
    .map(
      (project) => `
      <article class="card reveal">
        <p class="eyebrow">${project.year}</p>
        <h3>${project.name}</h3>
        <p>${project.summary}</p>
        <p class="tag-list">${project.stack.join(" · ")}</p>
        <a href="${project.link}">View project</a>
      </article>
    `
    )
    .join("");

  observePendingReveals();
}

function renderProjectsIndex(): void {
  const container = document.querySelector<HTMLElement>("#projects-list");
  if (!container) {
    return;
  }

  container.innerHTML = projectEntries
    .map(
      (project) => `
      <article class="card reveal">
        <p class="eyebrow">${project.year}</p>
        <h3>${project.name}</h3>
        <p>${project.summary}</p>
        <p class="tag-list">${project.stack.join(" · ")}</p>
        <a href="${project.link}">Open project</a>
      </article>
    `
    )
    .join("");

  observePendingReveals();
}

function renderExperience(): void {
  const container = document.querySelector<HTMLElement>("#experience-list");
  if (!container) {
    return;
  }

  container.innerHTML = experienceEntries
    .map(
      (entry) => `
      <article class="timeline-item reveal">
        <header>
          <h3>${entry.role}</h3>
          <p class="meta-row"><span>${entry.company}</span><span>${entry.period}</span></p>
          <p class="muted">${entry.location}</p>
        </header>
        <ul>
          ${entry.highlights.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `
    )
    .join("");

  observePendingReveals();
}

initCurrentYear();
initNavCurrentState();
initRevealObserver();
initScrollProgress();
renderHomeWriting();
renderHomeBooks();
renderWritingIndex();
renderBooksIndex();
renderHomeProjects();
renderProjectsIndex();
renderExperience();
