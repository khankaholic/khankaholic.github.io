import { calculateArticleReadingTime } from "./reading-time";

const trailingReadingTimePattern = /\s*·\s*\d+\s+min(?:\s+read)?\s*$/i;

export function syncLongformMeta(article: HTMLElement): void {
  const eyebrow = article.querySelector<HTMLElement>(".eyebrow");
  if (!eyebrow) {
    return;
  }

  eyebrow.textContent = appendReadingTime(eyebrow.textContent ?? "", calculateArticleReadingTime(article));
}

function appendReadingTime(value: string, readingTime: string): string {
  const baseValue = value.replace(trailingReadingTimePattern, "").trim();
  return `${baseValue} · ${readingTime}`;
}
