import express from 'express';
import crypto from 'crypto';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { UUIDValidateRequest } from '../../../interfaces/RequestTypes';

const router = express.Router();

// UUID v4 implementation using crypto
function generateUUIDv4(): string {
  const bytes = crypto.randomBytes(16);
  
  // Set version (4) and variant (2) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  // Convert to hex string with proper formatting
  let uuid = '';
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      uuid += '-';
    }
    uuid += bytes[i].toString(16).padStart(2, '0');
  }
  
  return uuid;
}

// UUID v1-like implementation (timestamp based)
function generateUUIDv1(): string {
  const timeNow = new Date().getTime();
  const timeBytes = Buffer.alloc(8);
  timeBytes.writeBigInt64BE(BigInt(timeNow));
  
  const randomBytes = crypto.randomBytes(8);
  const bytes = Buffer.concat([timeBytes, randomBytes]);
  
  // Set version (1) and variant (2) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x10;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  let uuid = '';
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      uuid += '-';
    }
    uuid += bytes[i].toString(16).padStart(2, '0');
  }
  
  return uuid;
}

// Validate UUID format
function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Get UUID version
function getUUIDVersion(uuid: string): number | null {
  if (!validateUUID(uuid)) return null;
  return parseInt(uuid.charAt(14), 16);
}

// Add root endpoint handler before other routes
router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'UUID Tools API',
    data: {
      endpoints: {
        'GET /v4': 'Generate a random UUID (v4)',
        'GET /v1': 'Generate a timestamp-based UUID (v1)',
        'POST /validate': 'Validate a UUID and get its version',
      },
    },
  });
});

router.get<{}, MessageResponse>('/v4', (_req, res) => {
  try {
    const uuid = generateUUIDv4();
    res.json({
      message: 'UUID v4 generated successfully',
      data: { uuid },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating UUID v4',
      data: { error: (error as Error).message },
    });
  }
});

router.get<{}, MessageResponse>('/v1', (_req, res) => {
  try {
    const uuid = generateUUIDv1();
    res.json({
      message: 'UUID v1 generated successfully',
      data: { uuid },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating UUID v1',
      data: { error: (error as Error).message },
    });
  }
});

router.post<{}, MessageResponse, UUIDValidateRequest>('/validate', (req, res) => {
  try {
    const { uuid } = req.body;

    if (!uuid || typeof uuid !== 'string') {
      res.status(400).json({
        message: 'UUID is required and must be a string',
        data: { valid: false },
      });
      return;
    }

    const isValid = validateUUID(uuid);
    const version = isValid ? getUUIDVersion(uuid) : null;

    res.json({
      message: isValid ? 'UUID is valid' : 'UUID is invalid',
      data: {
        valid: isValid,
        version,
        uuid,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error validating UUID',
      data: { error: (error as Error).message },
    });
  }
});

export default router;
