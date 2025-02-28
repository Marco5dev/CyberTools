import express from 'express';
import * as prettier from 'prettier';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { BeautifierRequest, BeautifierResponse } from '../../../interfaces/BeautifierTypes';
import { handleBeautifierError, ApiError } from '../../../utils/errorHandler';

const router = express.Router();

function calculateStats(original: string, formatted: string): BeautifierResponse['stats'] {
  return {
    originalSize: original.length,
    formattedSize: formatted.length,
    indentationLevel: (formatted.match(/^\s+/gm) || []).reduce(
      (max, indent) => Math.max(max, indent.length),
      0,
    ),
  };
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Code Beautifier API',
    data: {
      endpoints: {
        'POST /format': 'Format code (JavaScript, JSON, or CSS)',
      },
    },
  });
});

router.post<{}, MessageResponse & { data: BeautifierResponse }, BeautifierRequest>(
  '/format',
  async (req, res) => {
    try {
      const { content, language, options = {} } = req.body;

      if (!content) {
        throw new ApiError(400, 'Content is required');
      }

      if (!language) {
        throw new ApiError(400, 'Language is required');
      }

      if (!['javascript', 'json', 'css'].includes(language)) {
        throw new ApiError(400, 'Unsupported language', { supportedLanguages: ['javascript', 'json', 'css'] });
      }

      const prettierOptions: prettier.Options = {
        parser: language === 'json' ? 'json' : language === 'css' ? 'css' : 'babel',
        semi: options.semi ?? true,
        tabWidth: options.tabWidth ?? 2,
        singleQuote: options.singleQuote ?? true,
        trailingComma: options.trailingComma ?? 'es5',
      };

      let formatted: string;
      if (language === 'json') {
        // Parse and stringify JSON to handle escaped strings
        const parsedContent = JSON.parse(content);
        formatted = JSON.stringify(parsedContent, null, prettierOptions.tabWidth);
      } else {
        formatted = await prettier.format(content, prettierOptions);
      }

      const stats = calculateStats(content, formatted);

      res.json({
        message: 'Code formatted successfully',
        data: {
          formatted,
          stats,
        },
      });
    } catch (error) {
      try {
        handleBeautifierError(error);
      } catch (handledError) {
        const apiError = handledError as ApiError;
        res.status(apiError.statusCode).json({
          message: apiError.message,
          data: {
            formatted: '',
            stats: { originalSize: 0, formattedSize: 0, indentationLevel: 0 },
            error: apiError.details,
          },
        });
      }
    }
  },
);

export default router;
