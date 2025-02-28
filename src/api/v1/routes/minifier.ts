import express from 'express';
import * as terser from 'terser';
import CleanCSS from 'clean-css';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { MinifierRequest, MinifierResponse } from '../../../interfaces/MinifierTypes';
import { handleMinifierError, ApiError } from '../../../utils/errorHandler';

const router = express.Router();

function calculateStats(original: string, minified: string): MinifierResponse['stats'] {
  return {
    originalSize: original.length,
    minifiedSize: minified.length,
    compressionRatio: Number(((1 - minified.length / original.length) * 100).toFixed(2)),
  };
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Minifier API',
    data: {
      endpoints: {
        'POST /minify': 'Minify HTML or CSS content',
      },
    },
  });
});

router.post<{}, MessageResponse & { data: MinifierResponse }, MinifierRequest>(
  '/minify',
  async (req, res) => {
    try {
      const { content, language } = req.body;

      if (!content) {
        throw new ApiError(400, 'Content is required');
      }

      if (!language) {
        throw new ApiError(400, 'Language is required');
      }

      if (!['javascript', 'css'].includes(language)) {
        throw new ApiError(400, 'Unsupported language', { supportedLanguages: ['javascript', 'css'] });
      }

      let minified: string;

      if (language === 'javascript') {
        const result = await terser.minify(content, {
          compress: true,
          mangle: true,
        });

        if (!result.code) {
          throw new ApiError(500, 'Failed to minify JavaScript');
        }

        minified = result.code;
      } else {
        const cleanCSS = new CleanCSS({ level: 2 });
        const result = cleanCSS.minify(content);

        if (result.errors.length > 0) {
          throw new ApiError(400, 'CSS minification failed', { details: result.errors });
        }

        minified = result.styles;
      }

      const stats = calculateStats(content, minified);

      res.json({
        message: 'Code minified successfully',
        data: {
          minified,
          stats,
        },
      });
    } catch (error) {
      try {
        handleMinifierError(error);
      } catch (handledError) {
        const apiError = handledError as ApiError;
        res.status(apiError.statusCode).json({
          message: apiError.message,
          data: {
            minified: '',
            stats: { originalSize: 0, minifiedSize: 0, compressionRatio: 0 },
            error: apiError.details,
          } as MinifierResponse,
        });
      }
    }
  },
);

export default router;
