import { createArticleMarkdown } from "./article-markdown-content";
import {
  assistantActions,
  openAssistant,
  type AssistantId
} from "./assistant-links";
import { assistantIcon, chevronIcon, copyIcon, externalArrow, markdownIcon } from "./article-action-icons";

interface MarkdownActionElements {
  readonly root: HTMLElement;
  readonly mainButton: HTMLButtonElement;
  readonly chevronButton: HTMLButtonElement;
  readonly menuCopyButton: HTMLButtonElement;
  readonly menuCopyLabel: HTMLElement;
  readonly menu: HTMLElement;
  readonly status: HTMLElement;
}

const markdownMimeType = "text/markdown;charset=utf-8";
const defaultCopyLabel = "Ask AI";
const defaultMenuCopyLabel = "Copy page";
let copyStatusSequence = 0;

type MarkdownAction = "copy" | "open" | AssistantId;

export function initArticleMarkdownActions(article: HTMLElement): void {
  if (article.querySelector(".article-actions")) {
    return;
  }

  const actions = createActions();
  placeActions(article, actions.root);
  actions.mainButton.addEventListener("click", () => {
    openAssistant("chatgpt");
    setStatus(actions, "Opened ChatGPT.");
  });
  actions.chevronButton.addEventListener("click", () => {
    setMenuOpen(actions, !actions.root.classList.contains("is-open"));
  });
  actions.menu.addEventListener("click", (event) => handleMenuClick(event, article, actions));
  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !actions.root.contains(event.target)) {
      setMenuOpen(actions, false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(actions, false);
      actions.chevronButton.focus();
    }
  });
}

function placeActions(article: HTMLElement, actions: HTMLElement): void {
  const heading = article.querySelector<HTMLHeadingElement>("h1");
  if (!heading) {
    article.prepend(actions);
    return;
  }

  const row = document.createElement("div");
  row.className = "article-heading-row";
  const titleBlock = document.createElement("div");
  titleBlock.className = "article-title-block";

  heading.before(row);
  titleBlock.append(heading);
  row.append(titleBlock, actions);
}

function createActions(): MarkdownActionElements {
  const root = document.createElement("div");
  root.className = "article-actions";
  root.innerHTML = `
    <button class="article-copy-main" type="button" aria-label="Ask ChatGPT about this page" title="Ask ChatGPT about this page">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" /></svg>
      <span class="article-copy-label">${defaultCopyLabel}</span>
    </button>
    <button class="article-copy-chevron-button" type="button" aria-label="AI and page options" aria-expanded="false" aria-haspopup="menu">
      ${chevronIcon()}
    </button>
    <div class="article-copy-menu" role="menu">
      ${renderMenuButton("copy", copyIcon(), "Copy page as Markdown for LLMs", defaultMenuCopyLabel)}
      ${renderMenuButton("open", markdownIcon(), "View this page as plain text", "View as Markdown", externalArrow())}
      ${assistantActions.map((action) => renderAssistantButton(action.id, action.label, action.description)).join("")}
    </div>
    <p class="article-copy-status" aria-live="polite"></p>
  `;

  const mainButton = root.querySelector<HTMLButtonElement>(".article-copy-main");
  const chevronButton = root.querySelector<HTMLButtonElement>(".article-copy-chevron-button");
  const menuCopyButton = root.querySelector<HTMLButtonElement>('[data-markdown-action="copy"]');
  const menuCopyLabel = root.querySelector<HTMLElement>(".article-copy-menu-label");
  const menu = root.querySelector<HTMLElement>(".article-copy-menu");
  const status = root.querySelector<HTMLElement>(".article-copy-status");
  if (
    !mainButton ||
    !chevronButton ||
    !menuCopyButton ||
    !menuCopyLabel ||
    !menu ||
    !status
  ) {
    throw new ArticleMarkdownInitError("Article markdown controls failed to render.");
  }

  return {
    root,
    mainButton,
    chevronButton,
    menuCopyButton,
    menuCopyLabel,
    menu,
    status
  };
}

function handleMenuClick(event: MouseEvent, article: HTMLElement, actions: MarkdownActionElements): void {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-markdown-action]") : null;
  if (!button) {
    return;
  }

  const markdown = createArticleMarkdown(article);
  const action = parseMarkdownAction(button.dataset.markdownAction);
  if (action === "copy") {
    copyMarkdown(markdown, actions);
  } else if (action === "open") {
    openMarkdown(markdown);
    setStatus(actions, "Opened Markdown.");
  } else if (action) {
    openAssistant(action);
    setStatus(actions, "Opened assistant.");
  }
  setMenuOpen(actions, false);
}

function setMenuOpen(actions: MarkdownActionElements, isOpen: boolean): void {
  actions.root.classList.toggle("is-open", isOpen);
  actions.chevronButton.setAttribute("aria-expanded", String(isOpen));
}

function copyMarkdown(markdown: string, actions: MarkdownActionElements): void {
  const token = beginCopyStatus(actions);
  navigator.clipboard
    .writeText(markdown)
    .then(() => completeCopyStatus(actions, token, "Copied!"))
    .catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : "Clipboard unavailable.";
      completeCopyStatus(actions, token, "Copy failed", detail);
    });
}

function openMarkdown(markdown: string): void {
  const blob = new Blob([markdown], { type: markdownMimeType });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function beginCopyStatus(actions: MarkdownActionElements): number {
  copyStatusSequence += 1;
  const token = copyStatusSequence;
  actions.root.dataset.copyStatusToken = String(token);
  actions.menuCopyButton.setAttribute("aria-busy", "true");
  actions.root.classList.remove("is-copied");
  setCopyLabel(actions, "Copying...", "Copying page as Markdown.");
  return token;
}

function completeCopyStatus(
  actions: MarkdownActionElements,
  token: number,
  label: string,
  announcement = label
): void {
  if (actions.root.dataset.copyStatusToken !== String(token)) {
    return;
  }

  actions.menuCopyButton.removeAttribute("aria-busy");
  actions.root.classList.toggle("is-copied", label === "Copied!");
  setCopyLabel(actions, label, announcement);
  window.setTimeout(() => resetCopyStatus(actions, token), 2_000);
}

function resetCopyStatus(actions: MarkdownActionElements, token: number): void {
  if (actions.root.dataset.copyStatusToken !== String(token)) {
    return;
  }

  actions.menuCopyLabel.textContent = defaultMenuCopyLabel;
  actions.menuCopyButton.removeAttribute("aria-busy");
  actions.status.textContent = "";
  actions.root.classList.remove("is-copied");
  delete actions.root.dataset.copyStatusToken;
}

function setCopyLabel(
  actions: MarkdownActionElements,
  menuLabel: string,
  announcement: string
): void {
  actions.menuCopyLabel.textContent = menuLabel;
  actions.status.textContent = announcement;
}

function setStatus(actions: MarkdownActionElements, message: string): void {
  actions.status.textContent = message;
  window.setTimeout(() => {
    if (actions.status.textContent === message) {
      actions.status.textContent = "";
    }
  }, 2_400);
}

function parseMarkdownAction(value: string | undefined): MarkdownAction | undefined {
  switch (value) {
    case "copy":
    case "open":
    case "claude":
    case "chatgpt":
      return value;
    default:
      return undefined;
  }
}

function renderAssistantButton(id: AssistantId, label: string, description: string): string {
  return renderMenuButton(id, assistantIcon(id), description, label, externalArrow());
}

function renderMenuButton(
  action: MarkdownAction,
  icon: string,
  description: string,
  title: string,
  titleSuffix = ""
): string {
  const labelClass = action === "copy" ? "article-copy-menu-title article-copy-menu-label" : "article-copy-menu-title";

  return `
      <button type="button" role="menuitem" data-markdown-action="${action}">
        <span class="article-copy-menu-icon" aria-hidden="true">${icon}</span>
        <span class="article-copy-menu-text">
          <span class="article-copy-menu-title-row">
            <span class="${labelClass}">${title}</span>${titleSuffix}
          </span>
          <span class="article-copy-menu-description">${description}</span>
        </span>
      </button>`;
}

class ArticleMarkdownInitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArticleMarkdownInitError";
  }
}
