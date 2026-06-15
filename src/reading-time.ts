const wordsPerMinute = 225;

const articleReadingTimeCache = new Map<string, string>();

export function calculateReadingTime(text: string): string {
  const words = text.trim().match(/\S+/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min`;
}

export function calculateArticleReadingTime(article: HTMLElement): string {
  return calculateReadingTime(article.textContent ?? "");
}

export function getCachedArticleReadingTime(url: string): string | undefined {
  return articleReadingTimeCache.get(url);
}

export async function loadArticleReadingTime(url: string): Promise<string | undefined> {
  const cached = articleReadingTimeCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  if (!response.ok) {
    return undefined;
  }

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  const article = document.querySelector<HTMLElement>("article.longform");
  if (!article) {
    return undefined;
  }

  const readingTime = calculateArticleReadingTime(article);
  articleReadingTimeCache.set(url, readingTime);
  return readingTime;
}
