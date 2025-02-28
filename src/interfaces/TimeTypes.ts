export interface TimestampRequest {
  input: string | number;
  operation: 'toDate' | 'toTimestamp';
  format?: string;  // optional date format for output
  timezone?: string; // optional timezone
}

export interface TimestampResponse {
  result: string;
  timestamp: number;
  iso8601: string;
  utc: string;
  inputType: 'timestamp' | 'date';
  timezone: string;
}
