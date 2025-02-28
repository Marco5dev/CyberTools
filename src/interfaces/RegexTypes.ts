export interface RegexMatch {
  match: string;
  index: number;
  groups?: { [key: string]: string };
}

export interface RegexRequest {
  text: string;
  pattern: string;
  flags?: string;
  global?: boolean;
}

export interface RegexResponse {
  matches: RegexMatch[];
  count: number;
  pattern: string;
  flags: string;
  isValid: boolean;
  text: string;
}
