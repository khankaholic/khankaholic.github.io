import { writingEntries, type WritingEntry, type WritingKind } from "./content";
import { getCachedArticleReadingTime, loadArticleReadingTime } from "./reading-time";

type WritingFilter = "all" | WritingKind;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function renderHomeWriting(onRendered: () => void): void {
  const container = document.querySelector<HTMLElement>("#home-writing");
  if (!container) {
    return;
  }

  const latest = sortedByNewest(writingEntries.filter((entry) => entry.kind === "post" && !isDraft(entry))).slice(0, 3);
  renderCards(container, latest, onRendered);
}

export function renderHomeBooks(onRendered: () => void): void {
  const container = document.querySelector<HTMLElement>("#home-books");
  if (!container) {
    return;
  }

  const latest = sortedByNewest(writingEntries.filter((entry) => entry.kind === "review" && !isDraft(entry))).slice(0, 2);
  renderCards(container, latest, onRendered);
}

export function renderWritingIndex(onRendered: () => void): void {
  const container = document.querySelector<HTMLElement>("#writing-list");
  const filterControls = document.querySelectorAll<HTMLButtonElement>("[data-writing-filter]");
  if (!container) {
    return;
  }

  const render = (filter: WritingFilter): void => {
    const selected =
      filter === "all"
        ? sortedByNewest(writingEntries)
        : sortedByNewest(writingEntries.filter((entry) => entry.kind === filter));

    renderCards(container, selected, onRendered);
  };

  filterControls.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = normalizeWritingFilter(button.dataset.writingFilter);
      filterControls.forEach((control) => {
        control.classList.remove("is-active");
        control.setAttribute("aria-selected", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      render(filter);
    });
  });

  render(filterControls.length === 0 ? "post" : "all");
}

export function renderBooksIndex(onRendered: () => void): void {
  const container = document.querySelector<HTMLElement>("#books-list");
  if (!container) {
    return;
  }

  const reviews = sortedByNewest(writingEntries.filter((entry) => entry.kind === "review"));
  renderCards(container, reviews, onRendered);
}

function renderCards(container: HTMLElement, entries: readonly WritingEntry[], onRendered: () => void): void {
  container.innerHTML = entries.map(createWritingCard).join("");
  onRendered();
  void hydrateReadingTimes(container, entries);
}

function createWritingCard(entry: WritingEntry): string {
  const kindLabel = entry.kind === "review" ? "Book Review" : "Post";
  const linkLabel = entry.kind === "review" ? "Read review" : "Read post";
  const draft = isDraft(entry);
  const content = `
      <h3>${entry.title}</h3>
      <p>${entry.excerpt}</p>
  `;
  // Skip the tag when it only repeats the kind label (e.g. "Book Review").
  const tag = entry.tag.toLowerCase() === kindLabel.toLowerCase() ? "" : `<span>${entry.tag}</span>`;

  // The title link stretches over the whole card, so the call-to-action is visual only
  // and keyboard users get one tab stop per card.
  return `
    <article class="card reveal${draft ? "" : " card-linked"}">
      <p class="eyebrow">${kindLabel}<span data-reading-time-url="${entry.url}">${initialReadingTime(entry)}</span></p>
      ${draft ? content : `<a class="card-main-link" href="${entry.url}">${content}</a>`}
      <div class="meta-row">
        <span>${formatDate(entry.date)}</span>
        ${tag}
      </div>
      ${draft ? '<span class="inline-note">Draft in progress</span>' : `<span class="card-cta" aria-hidden="true">${linkLabel}</span>`}
    </article>
  `;
}

async function hydrateReadingTimes(container: HTMLElement, entries: readonly WritingEntry[]): Promise<void> {
  await Promise.allSettled(entries.map((entry) => hydrateReadingTime(container, entry)));
}

async function hydrateReadingTime(container: HTMLElement, entry: WritingEntry): Promise<void> {
  if (isDraft(entry)) {
    return;
  }

  const readingTime = await loadArticleReadingTime(entry.url);
  if (!readingTime) {
    return;
  }

  container.querySelectorAll<HTMLElement>("[data-reading-time-url]").forEach((target) => {
    if (target.dataset.readingTimeUrl === entry.url) {
      target.textContent = ` · ${readingTime}`;
    }
  });
}

function initialReadingTime(entry: WritingEntry): string {
  const readingTime = entry.url === "#" ? entry.readingTime : getCachedArticleReadingTime(entry.url) ?? entry.readingTime;
  return readingTime ? ` · ${readingTime}` : "";
}

function isDraft(entry: WritingEntry): boolean {
  return entry.url === "#";
}

function normalizeWritingFilter(value: string | undefined): WritingFilter {
  if (value === "post" || value === "review") {
    return value;
  }
  return "all";
}

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function sortedByNewest(entries: readonly WritingEntry[]): WritingEntry[] {
  return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
