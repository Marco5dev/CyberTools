import express from 'express';
import { MessageResponse } from '../../../interfaces/MessageResponse';

interface JsonFormatRequest {
  json: string | object;
  spaces?: number;
  minify?: boolean;
}

const router = express.Router();

function validateJSON(input: string): { valid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(input);
    return { valid: true, parsed };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

function formatJSON(input: any, spaces: number = 2, minify: boolean = false): string {
  try {
    return JSON.stringify(input, null, minify ? 0 : spaces);
  } catch (error) {
    throw new Error(`Formatting error: ${(error as Error).message}`);
  }
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'JSON Tools API',
    data: {
      endpoints: {
        'POST /format': 'Format and validate JSON with optional prettify/minify',
        'POST /validate': 'Validate JSON structure',
      },
    },
  });
});

router.post<{}, MessageResponse, JsonFormatRequest>('/format', (req, res) => {
  try {
    const { json, spaces = 2, minify = false } = req.body;

    if (!json) {
      res.status(400).json({
        message: 'JSON input is required',
        data: { valid: false },
      });
      return;
    }

    let inputJson = typeof json === 'string' ? json : JSON.stringify(json);
    const validationResult = validateJSON(inputJson);

    if (!validationResult.valid) {
      res.status(400).json({
        message: 'Invalid JSON input',
        data: { 
          valid: false,
          error: validationResult.error,
        },
      });
      return;
    }

    const formatted = formatJSON(validationResult.parsed, spaces, minify);

    res.json({
      message: 'JSON formatted successfully',
      data: {
        formatted,
        originalSize: inputJson.length,
        formattedSize: formatted.length,
        minified: minify,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error formatting JSON',
      data: { error: (error as Error).message },
    });
  }
});

router.post<{}, MessageResponse>('/validate', (req, res) => {
  try {
    const { json } = req.body;

    if (!json) {
      res.status(400).json({
        message: 'JSON input is required',
        data: { valid: false },
      });
      return;
    }

    const inputJson = typeof json === 'string' ? json : JSON.stringify(json);
    const result = validateJSON(inputJson);

    res.json({
      message: result.valid ? 'JSON is valid' : 'JSON is invalid',
      data: {
        valid: result.valid,
        error: result.error,
        parsed: result.valid ? result.parsed : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error validating JSON',
      data: { error: (error as Error).message },
    });
  }
});

export default router;
