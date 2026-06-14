export function createArticleMarkdown(article: HTMLElement): string {
  const lines = [...article.children].flatMap((child) => elementToMarkdown(child));
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

function elementToMarkdown(element: Element): string[] {
  if (element.classList.contains("article-actions")) {
    return [];
  }
  if (element.classList.contains("article-heading-row")) {
    return [...element.querySelectorAll(":scope h1")].flatMap((heading) => elementToMarkdown(heading));
  }

  const text = inlineMarkdown(element).trim();
  switch (element.tagName) {
    case "H1":
      return [`# ${text}`, ""];
    case "H2":
      return [`## ${text}`, ""];
    case "H3":
      return [`### ${text}`, ""];
    case "P":
      return text ? [text, ""] : [];
    case "UL":
      return [...element.children].map((child) => `- ${inlineMarkdown(child).trim()}`).concat("");
    case "OL":
      return [...element.children].map((child, index) => `${index + 1}. ${inlineMarkdown(child).trim()}`).concat("");
    case "BLOCKQUOTE":
      return inlineMarkdown(element)
        .split("\n")
        .map((line) => `> ${line}`)
        .concat("");
    default:
      return text ? [text, ""] : [];
  }
}

function inlineMarkdown(element: Element): string {
  return normalizeInlineMarkdown([...element.childNodes].map((node) => nodeToMarkdown(node)).join(""));
}

function normalizeInlineMarkdown(value: string): string {
  return value.replace(/\s+/g, " ");
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (!(node instanceof Element)) {
    return "";
  }

  const text = inlineMarkdown(node);
  switch (node.tagName) {
    case "A":
      return node instanceof HTMLAnchorElement ? `[${text}](${node.href})` : text;
    case "STRONG":
    case "B":
      return `**${text}**`;
    case "EM":
    case "I":
      return `_${text}_`;
    case "CODE":
      return `\`${text}\``;
    case "BR":
      return "\n";
    default:
      return text;
  }
}
