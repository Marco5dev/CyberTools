export interface Base64Request {
  input: string;
  inputType?: 'text' | 'file';
  operation: 'encode' | 'decode';
}

export interface Base64Response {
  result: string;
  inputSize: number;
  outputSize: number;
  operation: 'encode' | 'decode';
  inputType: 'text' | 'file';
}

export interface URLRequest {
  url: string;
  operation: 'encode' | 'decode';
  mode?: 'component' | 'full';  // component uses encodeURIComponent, full uses encodeURI
}

export interface URLResponse {
  result: string;
  inputSize: number;
  outputSize: number;
  operation: 'encode' | 'decode';
  mode: 'component' | 'full';
}
