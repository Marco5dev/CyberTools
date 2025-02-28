export interface BeautifierRequest {
  content: string;
  language: 'javascript' | 'json' | 'css';
  options?: {
    semi?: boolean;
    tabWidth?: number;
    singleQuote?: boolean;
    trailingComma?: 'none' | 'es5' | 'all';
  };
}

export interface BeautifierResponse {
  formatted: string;
  stats: {
    originalSize: number;
    formattedSize: number;
    indentationLevel: number;
  };
}
