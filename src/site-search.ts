import { experienceEntries, writingEntries } from "./content";

type SearchEntry = {
  title: string;
  description: string;
  href: string;
  section: string;
  text: string;
  content: string;
};

const pageRoutes = [
  ["/", "Home", "Profile"],
  ["/writing.html", "Writing", "Writing"],
  ["/books.html", "Books", "Books"],
  ["/projects.html", "Projects", "Projects"],
  ["/cv.html", "CV", "Profile"],
  ["/posts/quiet-systems.html", "Building Quiet Systems", "Writing"],
  ["/posts/deep-work-notes.html", "Deep Work Notes for Engineers", "Writing"],
  ["/reviews/atomic-habits-notes.html", "Atomic Habits: What Actually Stuck", "Books"]
] as const;

export function initSiteSearch(): void {
  const trigger = document.querySelector<HTMLButtonElement>("[data-site-search-trigger]");
  if (!trigger || document.querySelector(".site-search-dialog")) {
    return;
  }

  const dialog = createDialog();
  document.body.append(dialog);
  const input = dialog.querySelector<HTMLInputElement>("[data-site-search-input]");
  const results = dialog.querySelector<HTMLElement>("[data-site-search-results]");
  if (!input || !results) {
    return;
  }

  const entries = createBundledEntries();
  let remoteIndex: Promise<void> | undefined;

  const render = (value: string): void => {
    const terms = value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      results.innerHTML = '<p class="site-search-empty">EXPLORE</p>' + pageRoutes.slice(1, 5).map(([href, title, section]) => renderResult(makeEntry(title, "", href, section))).join("");
      return;
    }

    const matches = entries
      .filter((entry) => entry.href !== "#" && terms.every((term) => entry.text.includes(term)))
      .filter((entry, index, all) => all.findIndex((other) => other.href === entry.href) === index)
      .slice(0, 8);
    results.innerHTML = matches.length
      ? matches.map((entry) => renderResult(entry, terms)).join("")
      : '<p class="site-search-empty">No results. Try a role, company, topic, or post title.</p>';
  };

  const open = (): void => {
    if (!dialog.open) {
      dialog.showModal();
    }
    input.focus();
    render(input.value);
    remoteIndex ??= addPageContent(entries).then(() => render(input.value));
  };

  trigger.addEventListener("click", open);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      const first = results.querySelector<HTMLAnchorElement>("a");
      if (event.key === "Enter") first?.click();
      else first?.focus();
    }
  });
  input.addEventListener("input", () => render(input.value));
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  });
}

function createDialog(): HTMLDialogElement {
  const dialog = document.createElement("dialog");
  dialog.className = "site-search-dialog";
  dialog.setAttribute("aria-labelledby", "site-search-title");
  dialog.innerHTML = `
    <form method="dialog" class="site-search-shell">
      <div class="site-search-heading">
        <h2 id="site-search-title">Search this site</h2>
        <button class="site-search-close" value="cancel" aria-label="Close search">Esc</button>
      </div>
      <label class="site-search-input" for="site-search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>
        <input id="site-search-field" data-site-search-input type="search" aria-label="Search this site" autocomplete="off" placeholder="What are you looking for?" />
      </label>
      <div class="site-search-results" data-site-search-results aria-live="polite"></div>
      <p class="site-search-footer">Writing, projects, and a little about me.</p>
    </form>`;
  return dialog;
}

function createBundledEntries(): SearchEntry[] {
  return [
    ...writingEntries.map((entry) => makeEntry(entry.title, entry.excerpt, entry.url, entry.kind === "review" ? "Books" : "Writing", `${entry.tag} ${entry.kind}`)),
    ...experienceEntries.map((entry) =>
      makeEntry(entry.role, `${entry.company} · ${entry.period}`, "/cv.html", "Profile", `${entry.location} ${entry.highlights.join(" ")}`)
    )
  ];
}

async function addPageContent(entries: SearchEntry[]): Promise<void> {
  const pages = await Promise.all(
    pageRoutes.map(async ([href, fallbackTitle, section]) => {
      try {
        const response = await fetch(href);
        if (!response.ok) {
          return;
        }
        const page = new DOMParser().parseFromString(await response.text(), "text/html");
        const content = page.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
        entries.push(makeEntry(page.title || fallbackTitle, content.slice(0, 180) || fallbackTitle, href, section, content));
      } catch {
        // Bundled entries remain available if a static page cannot be fetched.
      }
    })
  );
  await pages;
}

function makeEntry(title: string, description: string, href: string, section: string, extra = ""): SearchEntry {
  const content = `${description} ${extra}`.trim();
  return { title, description, href, section, content, text: `${title} ${content} ${section}`.toLowerCase() };
}

function renderResult(entry: SearchEntry, terms: string[] = []): string {
  const escape = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const highlight = (value: string): string => {
    // Match literal query text, merge overlaps, and escape every rendered segment.
    const ranges: [number, number][] = [];
    const lower = value.toLowerCase();
    for (const term of terms) {
      let start = lower.indexOf(term);
      while (start !== -1) {
        ranges.push([start, start + term.length]);
        start = lower.indexOf(term, start + term.length);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([...range]);
    }
    let end = 0;
    let html = "";
    for (const [start, stop] of merged) {
      html += escape(value.slice(end, start)) + `<mark>${escape(value.slice(start, stop))}</mark>`;
      end = stop;
    }
    return html + escape(value.slice(end));
  };
  let snippet = entry.description;
  if (terms.length) {
    const offsets = terms.map((term) => entry.content.toLowerCase().indexOf(term)).filter((offset) => offset >= 0);
    if (offsets.length) {
      const start = Math.max(0, Math.min(...offsets) - 45);
      const stop = Math.min(entry.content.length, start + 170);
      snippet = `${start ? "…" : ""}${entry.content.slice(start, stop)}${stop < entry.content.length ? "…" : ""}`;
    }
  }
  return `
    <a class="site-search-result" href="${escape(entry.href)}">
      <span class="site-search-section">${highlight(entry.section)}</span>
      <strong>${highlight(entry.title)}</strong>
      <span>${highlight(snippet)}</span>
    </a>`;
}
