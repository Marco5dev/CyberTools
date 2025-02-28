import express from 'express';
import { MessageResponse } from '../../interfaces/MessageResponse';
import uuidRoutes from './routes/uuid';
import jsonRoutes from './routes/json';
import encodingRoutes from './routes/encoding';
import timeRoutes from './routes/time';
import regexRoutes from './routes/regex';
import ipRoutes from './routes/ip';
import markdownRouter from './routes/markdown';
import minifierRouter from './routes/minifier';
import beautifierRouter from './routes/beautifier';

const router = express.Router();

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'API - 👋 Welcome to DevTools API v1',
    data: {
      availableAPIs: {
        json: {
          base: '/api/v1/json',
          description: 'JSON formatting and validation tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /format': 'Format and validate JSON with optional prettify/minify',
            'POST /validate': 'Validate JSON structure',
          },
        },
        encoding: {
          base: '/api/v1/encoding',
          description: 'Text encoding and decoding tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /base64': 'Encode or decode Base64 strings',
            'POST /url': 'Encode or decode URLs (supports full URL and component encoding)',
          },
        },
        uuid: {
          base: '/api/v1/uuid',
          description: 'UUID generation and validation tools',
          endpoints: {
            'GET /': 'API documentation',
            'GET /v4': 'Generate a random UUID (v4)',
            'GET /v1': 'Generate a timestamp-based UUID (v1)',
            'POST /validate': 'Validate a UUID and get its version',
          },
        },
        time: {
          base: '/api/v1/time',
          description: 'Time conversion and formatting tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /convert': 'Convert between timestamps and dates',
            'GET /now': 'Get current time in multiple formats',
            'GET /timezones': 'List all available timezones',
          },
        },
        regex: {
          base: '/api/v1/regex',
          description: 'Regular expression testing tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /test': 'Test a regex pattern against input text',
            'GET /flags': 'Get available regex flags and their descriptions',
          },
        },
        ip: {
          base: '/api/v1/ip',
          description: 'IP address information and validation tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /lookup': 'Lookup IP address information',
            'GET /myip': 'Get information about your IP address',
          },
        },
        markdown: {
          base: '/api/v1/markdown',
          description: 'Markdown conversion tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /convert': 'Convert Markdown to HTML',
          },
        },
        minifier: {
          base: '/api/v1/minifier',
          description: 'Code minification tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /minify': 'Minify JavaScript or CSS code',
          },
        },
        beautifier: {
          base: '/api/v1/beautifier',
          description: 'Code formatting tools',
          endpoints: {
            'GET /': 'API documentation',
            'POST /format': 'Format code (JavaScript, JSON, or CSS)',
          },
        },
      },
    },
  });
});

// JSON Tools Routes
router.use('/json', jsonRoutes);

// Encoding Tools Routes
router.use('/encoding', encodingRoutes);

// UUID Tools Routes
router.use('/uuid', uuidRoutes);

// Time Tools Routes
router.use('/time', timeRoutes);

// Regex Testing Routes
router.use('/regex', regexRoutes);

// IP Info Routes
router.use('/ip', ipRoutes);

// Markdown Routes
router.use('/markdown', markdownRouter);

// Minifier Routes
router.use('/minifier', minifierRouter);

// Beautifier Routes
router.use('/beautifier', beautifierRouter);

export default router;
