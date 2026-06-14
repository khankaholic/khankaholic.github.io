import type { WritingEntry } from "./content";

const trailingReadingTimePattern = /\s*·\s*\d+\s+min(?:\s+read)?\s*$/i;

export function syncLongformMeta(article: HTMLElement, entries: readonly WritingEntry[]): void {
  const entry = findCurrentEntry(entries);
  const eyebrow = article.querySelector<HTMLElement>(".eyebrow");
  if (!entry || !eyebrow) {
    return;
  }

  eyebrow.textContent = appendReadingTime(eyebrow.textContent ?? "", entry.readingTime);
}

function findCurrentEntry(entries: readonly WritingEntry[]): WritingEntry | undefined {
  const currentPath = normalizePath(window.location.pathname);
  return entries.find((entry) => entry.url !== "#" && normalizePath(entry.url) === currentPath);
}

function appendReadingTime(value: string, readingTime: string): string {
  const baseValue = value.replace(trailingReadingTimePattern, "").trim();
  return `${baseValue} · ${readingTime}`;
}

function normalizePath(path: string): string {
  if (path === "/") {
    return "/";
  }
  return path.replace(/\/+$/, "");
}
