export interface MarkdownRequest {
  markdown: string;
  options?: {
    sanitize?: boolean;
  };
}

export interface MarkdownResponse {
  html: string;
  stats?: {
    characters: number;
    words: number;
    lines: number;
  };
}
