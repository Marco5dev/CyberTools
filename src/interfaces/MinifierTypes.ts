export interface MinifierRequest {
  content: string;
  language: 'javascript' | 'css';
}

export interface MinifierResponse {
  minified: string;
  stats: {
    originalSize: number;
    minifiedSize: number;
    compressionRatio: number;
  };
}
