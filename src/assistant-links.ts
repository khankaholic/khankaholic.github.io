export type AssistantId = "claude" | "chatgpt";

export interface AssistantAction {
  readonly id: AssistantId;
  readonly label: string;
  readonly description: string;
}

export const assistantActions: readonly AssistantAction[] = [
  {
    id: "claude",
    label: "Open in Claude",
    description: "Ask questions about this page"
  },
  {
    id: "chatgpt",
    label: "Open in ChatGPT",
    description: "Ask questions about this page"
  }
] as const;

const publishedOrigin = "https://khankaholic.github.io";

export function createAssistantPrompt(pageUrl: string): string {
  return `Read from ${pageUrl} so I can ask questions about it.`;
}

export function createAssistantUrl(assistantId: AssistantId, pageUrl: string): string {
  const prompt = encodeURIComponent(createAssistantPrompt(pageUrl));

  switch (assistantId) {
    case "claude":
      return `https://claude.ai/new?q=${prompt}`;
    case "chatgpt":
      return `https://chatgpt.com/?q=${prompt}`;
  }
}

export function openAssistant(assistantId: AssistantId): void {
  const pageUrl = currentPageReferenceUrl();
  window.open(createAssistantUrl(assistantId, pageUrl), "_blank", "noopener,noreferrer");
}

export function currentPageReferenceUrl(): string {
  const { hostname, origin, pathname } = window.location;
  const sourceOrigin = hostname === "localhost" || hostname === "127.0.0.1" ? publishedOrigin : origin;
  return new URL(pathname, sourceOrigin).href;
}
