import express from 'express';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { Base64Request, Base64Response, URLRequest, URLResponse } from '../../../interfaces/EncodingTypes';

const router = express.Router();

function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

function decodeBase64(input: string): string {
  try {
    return Buffer.from(input, 'base64').toString('utf-8');
  } catch (error) {
    throw new Error('Invalid Base64 string');
  }
}

function encodeURL(input: string, mode: 'component' | 'full' = 'full'): string {
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

function decodeURL(input: string, mode: 'component' | 'full' = 'full'): string {
  try {
    return mode === 'component' ? decodeURIComponent(input) : decodeURI(input);
  } catch (error) {
    throw new Error('Invalid URL encoded string');
  }
}

// Add validation functions
function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

function isValidURL(str: string): boolean {
  try {
    // Basic URL validation for both full URLs and components
    return !str.includes('\n') && !str.includes('\r') && str.length > 0;
  } catch {
    return false;
  }
}

// Add validation for operation type
function isValidOperation(operation: string): operation is 'encode' | 'decode' {
  return ['encode', 'decode'].includes(operation);
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Encoding Tools API',
    data: {
      endpoints: {
        'POST /base64': 'Encode or decode Base64 strings',
        'POST /url': 'Encode or decode URLs (supports full URL and component encoding)',
      },
    },
  });
});

router.post<{}, MessageResponse & { data: Base64Response | { error: string } }, Base64Request>('/base64', (req, res) => {
  try {
    const { input, operation, inputType = 'text' } = req.body;

    // Input validation
    if (!input || typeof input !== 'string') {
      res.status(400).json({
        message: 'Input must be a non-empty string',
        data: {
          error: 'Invalid input format',
          result: '',
          inputSize: 0,
          outputSize: 0,
          operation: 'encode',
          inputType: 'text',
        },
      });
      return;
    }

    // Operation validation
    if (!operation || !isValidOperation(operation)) {
      res.status(400).json({
        message: 'Invalid operation. Use "encode" or "decode"',
        data: {
          error: 'Invalid operation type',
          result: '',
          inputSize: input.length,
          outputSize: 0,
          operation: operation || 'encode',
          inputType,
        },
      });
      return;
    }

    // Base64 validation for decode operation
    if (operation === 'decode' && !isValidBase64(input)) {
      res.status(400).json({
        message: 'Invalid base64 string provided',
        data: {
          error: 'Input is not a valid base64 string',
          result: '',
          inputSize: input.length,
          outputSize: 0,
          operation,
          inputType,
        },
      });
      return;
    }

    // Process the request
    const result = operation === 'encode' ? encodeBase64(input) : decodeBase64(input);

    res.json({
      message: `Base64 ${operation} successful`,
      data: {
        result,
        inputSize: input.length,
        outputSize: result.length,
        operation,
        inputType,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error during base64 operation',
      data: {
        error: (error as Error).message,
        result: '',
        inputSize: req.body.input?.length || 0,
        outputSize: 0,
        operation: req.body.operation || 'encode',
        inputType: req.body.inputType || 'text',
      },
    });
  }
});

router.post<{}, MessageResponse & { data: URLResponse | { error: string } }, URLRequest>('/url', (req, res) => {
  try {
    const { url, operation, mode = 'full' } = req.body;

    // Input validation
    if (!url || typeof url !== 'string') {
      res.status(400).json({
        message: 'URL must be a non-empty string',
        data: {
          error: 'Invalid URL format',
          result: '',
          inputSize: 0,
          outputSize: 0,
          operation: 'encode',
          mode: 'full',
        },
      });
      return;
    }

    // Operation validation
    if (!operation || !isValidOperation(operation)) {
      res.status(400).json({
        message: 'Invalid operation. Use "encode" or "decode"',
        data: {
          error: 'Invalid operation type',
          result: '',
          inputSize: url.length,
          outputSize: 0,
          operation: operation || 'encode',
          mode,
        },
      });
      return;
    }

    // URL validation
    if (!isValidURL(url)) {
      res.status(400).json({
        message: 'Invalid URL string provided',
        data: {
          error: 'URL contains invalid characters',
          result: '',
          inputSize: url.length,
          outputSize: 0,
          operation,
          mode,
        },
      });
      return;
    }

    // Process the request
    const result = operation === 'encode' ? encodeURL(url, mode) : decodeURL(url, mode);

    res.json({
      message: `URL ${operation} successful`,
      data: {
        result,
        inputSize: url.length,
        outputSize: result.length,
        operation,
        mode,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error processing URL operation',
      data: {
        error: (error as Error).message,
        result: '',
        inputSize: req.body.url?.length || 0,
        outputSize: 0,
        operation: req.body.operation || 'encode',
        mode: req.body.mode || 'full',
      },
    });
  }
});

export default router;
