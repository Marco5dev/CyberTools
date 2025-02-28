export interface IPRequest {
  ip: string;
}

export interface IPResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  isValid: boolean;
  provider: 'ipinfo' | 'ip-api';
}
