import "./styles.css";
import { experienceEntries, projectEntries, writingEntries } from "./content";
import { initLongform, syncLongformCommentsThemeWhenReady } from "./longform";
import { DEFAULT_META, PAGE_META, SITE_NAME } from "./site";
import { renderBooksIndex, renderHomeBooks, renderHomeWriting, renderWritingIndex } from "./writing-cards";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const themeStorageKey = "theme_preference";
const themeColorLight = "#fdfbf7";
const themeColorDark = "#151412";

let revealObserver: IntersectionObserver | null = null;
let currentThemePreference: ThemePreference = "light";
let systemThemeMediaQuery: MediaQueryList | null = null;

function initCurrentYear(): void {
  const target = document.querySelector<HTMLElement>("[data-year]");
  if (target) {
    target.textContent = String(new Date().getFullYear());
  }
}

function initSiteBrand(): void {
  document.querySelectorAll<HTMLElement>(".brand").forEach((brand) => {
    brand.textContent = SITE_NAME;
  });
}

function initPageMeta(): void {
  const currentPath = normalizePath(window.location.pathname);
  const meta = PAGE_META[currentPath] ?? DEFAULT_META;
  document.title = meta.title;

  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement("meta");
    descriptionTag.setAttribute("name", "description");
    document.head.append(descriptionTag);
  }
  descriptionTag.setAttribute("content", meta.description);
}

function initExternalLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]').forEach((link) => {
    try {
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    } catch (error) {
      if (error instanceof TypeError) {
        return;
      }
      throw error;
    }
  });
}

function normalizeThemePreference(value: string | null): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "light";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getCurrentResolvedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeMetaColor(theme: ResolvedTheme): void {
  let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement("meta");
    themeMeta.setAttribute("name", "theme-color");
    document.head.append(themeMeta);
  }
  themeMeta.setAttribute("content", theme === "dark" ? themeColorDark : themeColorLight);
}

function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  updateThemeMetaColor(theme);
}

function updateThemeControlState(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!toggle) {
    return;
  }

  const resolved = resolveTheme(currentThemePreference);
  const next = getNextThemePreference(currentThemePreference);

  toggle.dataset.themeState = currentThemePreference;
  toggle.setAttribute("aria-label", `Theme: ${currentThemePreference}. Click to switch to ${next}.`);
  toggle.setAttribute("title", `Theme: ${currentThemePreference} (${resolved}). Click for ${next}.`);
}

function getGiscusTheme(): "light" | "dark_dimmed" {
  return getCurrentResolvedTheme() === "dark" ? "dark_dimmed" : "light";
}

function syncGiscusThemeWhenReady(attempt = 0): void {
  syncLongformCommentsThemeWhenReady(getGiscusTheme, attempt);
}

function setThemePreference(preference: ThemePreference, shouldPersist = true): void {
  currentThemePreference = preference;
  const resolvedTheme = resolveTheme(preference);
  applyResolvedTheme(resolvedTheme);
  updateThemeControlState();
  syncGiscusThemeWhenReady();

  if (shouldPersist) {
    window.localStorage.setItem(themeStorageKey, preference);
  }
}

function getNextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === "light") {
    return "dark";
  }
  if (preference === "dark") {
    return "system";
  }
  return "light";
}

function initTheme(): void {
  const storedPreference = normalizeThemePreference(window.localStorage.getItem(themeStorageKey));
  systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  setThemePreference(storedPreference, false);

  const handleSystemThemeChange = (): void => {
    if (currentThemePreference === "system") {
      setThemePreference("system", false);
    }
  };

  if (typeof systemThemeMediaQuery.addEventListener === "function") {
    systemThemeMediaQuery.addEventListener("change", handleSystemThemeChange);
  } else {
    systemThemeMediaQuery.addListener(handleSystemThemeChange);
  }
}

function initThemeSwitcher(): void {
  const nav = document.querySelector<HTMLElement>("nav.primary-nav");
  if (!nav || nav.querySelector("[data-theme-switch]")) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "theme-switch";
  switcher.setAttribute("data-theme-switch", "true");
  switcher.setAttribute("aria-label", "Theme");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("data-theme-toggle", "true");
  button.setAttribute("aria-live", "polite");
  button.innerHTML = `
    <svg data-theme-icon="light" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="sun-core" cx="12" cy="12" r="4.15" />
      <g class="sun-rays">
        <line x1="12" y1="2" x2="12" y2="4.1" />
        <line x1="12" y1="19.9" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.1" y2="12" />
        <line x1="19.9" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.4" y2="6.4" />
        <line x1="17.6" y1="17.6" x2="19.1" y2="19.1" />
        <line x1="17.6" y1="6.4" x2="19.1" y2="4.9" />
        <line x1="4.9" y1="19.1" x2="6.4" y2="17.6" />
      </g>
    </svg>
    <svg data-theme-icon="dark" viewBox="0 0 24 24" aria-hidden="true">
      <path class="moon-shape" d="M20.7 14.7A8.7 8.7 0 1 1 9.3 3.3a7 7 0 1 0 11.4 11.4Z" />
      <path class="moon-star moon-star-a" d="m16.3 3.4.72 1.86 1.86.72-1.86.72-.72 1.86-.72-1.86-1.86-.72 1.86-.72.72-1.86Z" />
      <path class="moon-star moon-star-b" d="m19 8 .52 1.28 1.28.52-1.28.52-.52 1.28-.52-1.28-1.28-.52 1.28-.52.52-1.28Z" />
      <path class="moon-star moon-star-c" d="m14.2 7.8.42 1.06 1.06.42-1.06.42-.42 1.06-.42-1.06-1.06-.42 1.06-.42.42-1.06Z" />
      <path class="moon-star moon-star-d" d="m18.2 4.9.34.84.84.34-.84.34-.34.84-.34-.84-.84-.34.84-.34.34-.84Z" />
    </svg>
    <svg data-theme-icon="system" viewBox="0 0 24 24" aria-hidden="true">
      <rect class="system-screen" x="3.2" y="4.2" width="17.6" height="12.6" rx="1.8" />
      <rect class="system-display" x="5.8" y="6.6" width="12.4" height="7.8" rx="1.1" />
      <path class="system-scan" d="M6.7 9.4h10.6" />
      <circle class="system-dot system-dot-a" cx="8.2" cy="11.1" r="0.58" />
      <circle class="system-dot system-dot-b" cx="10.5" cy="11.1" r="0.58" />
      <circle class="system-dot system-dot-c" cx="12.8" cy="11.1" r="0.58" />
      <path class="system-stand" d="M9.5 20h5M12 16.8V20" />
    </svg>
  `;
  button.addEventListener("click", () => {
    setThemePreference(getNextThemePreference(currentThemePreference));
  });
  switcher.append(button);

  nav.append(switcher);
  updateThemeControlState();
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

function initWipNotice(): void {
  const siteWrap = document.querySelector<HTMLElement>(".site-wrap");
  if (!siteWrap || siteWrap.querySelector(".wip-notice")) {
    return;
  }

  const notice = document.createElement("aside");
  notice.className = "wip-notice";
  notice.setAttribute("role", "note");
  notice.innerHTML =
    "<strong>Work in progress:</strong> this website is currently being built, and most content is placeholder for now.";
  siteWrap.prepend(notice);
}


function initAvatarToggle(): void {
  const avatar = document.querySelector<HTMLElement>("[data-avatar]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-avatar-toggle]");
  const caption = document.querySelector<HTMLElement>("[data-avatar-caption]");
  if (!avatar || !toggle || !caption) {
    return;
  }

  const storageKey = "avatar_blur_enabled";
  const stored = window.localStorage.getItem(storageKey);
  let isBlurred = stored === null ? true : stored === "true";

  const render = (): void => {
    avatar.classList.toggle("is-blurred", isBlurred);
    toggle.setAttribute("aria-pressed", String(isBlurred));
    toggle.setAttribute("aria-label", isBlurred ? "Show avatar" : "Blur avatar");
    toggle.setAttribute("title", isBlurred ? "Show avatar" : "Blur avatar");
    toggle.dataset.state = isBlurred ? "blurred" : "visible";
    caption.textContent = isBlurred ? "Incognito mode: ON." : "Face unlocked. Be nice.";
  };

  toggle.addEventListener("click", () => {
    isBlurred = !isBlurred;
    window.localStorage.setItem(storageKey, String(isBlurred));
    toggle.classList.remove("is-pop");
    window.requestAnimationFrame(() => toggle.classList.add("is-pop"));
    window.setTimeout(() => toggle.classList.remove("is-pop"), 230);
    render();
  });

  render();
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
initTheme();
initThemeSwitcher();
initSiteBrand();
initPageMeta();
initExternalLinks();
initLongform({
  entries: writingEntries,
  getCommentTheme: getGiscusTheme,
  onCommentsReady: syncGiscusThemeWhenReady
});
initNavCurrentState();
initRevealObserver();
initScrollProgress();
initWipNotice();
initAvatarToggle();
renderHomeWriting(observePendingReveals);
renderHomeBooks(observePendingReveals);
renderWritingIndex(observePendingReveals);
renderBooksIndex(observePendingReveals);
renderHomeProjects();
renderProjectsIndex();
renderExperience();
