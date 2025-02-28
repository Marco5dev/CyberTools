import express from 'express';
import { marked, MarkedOptions, Renderer } from 'marked';
// import { escape } from 'html-escaper'; // Add this import for HTML escaping
import { MessageResponse } from '../../../interfaces/MessageResponse';
import {
  MarkdownRequest,
  MarkdownResponse,
} from '../../../interfaces/MarkdownTypes';

const router = express.Router();

function getTextStats(text: string) {
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    lines: text.split('\n').length,
  };
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Markdown Conversion API',
    data: {
      endpoints: {
        'POST /convert': 'Convert Markdown to HTML',
      },
    },
  });
});

router.post<{}, MessageResponse & { data: MarkdownResponse }, MarkdownRequest>(
  '/convert',
  async (req, res) => {
    try {
      const { markdown, options = {} } = req.body;

      if (!markdown) {
        res.status(400).json({
          message: 'Markdown content is required',
          data: {
            html: '',
            stats: {
              characters: 0,
              words: 0,
              lines: 0,
            },
          },
        });
        return;
      }

      // Configure marked options with basic feature support
      const markdownOptions: MarkedOptions = {
        gfm: true, // GitHub Flavored Markdown
        breaks: false, // Don't add <br> on single line breaks
        pedantic: false, // Don't be too strict
      };

      // Create and configure renderer with all needed settings
      const renderer = Object.assign(new Renderer(), {
        // Handle code blocks with proper type signature
        code(token: { text: string; lang?: string }) {
          const lang = token.lang ? ` class="language-${token.lang}"` : '';
          return `<pre><code${lang}>${token.text}</code></pre>`;
        },
        // Handle inline code
        codespan(token: { text: string }) {
          return `<code>${token.text}</code>`;
        },
        // Add HTML sanitization if requested
        ...(options.sanitize
          ? {
            html: ({ text }: { text: string }) =>
              text.replace(/<[^>]*>/g, ''),
          }
          : {}),
      });

      markdownOptions.renderer = renderer;
      marked.setOptions(markdownOptions);

      // Convert markdown to HTML - ensure it's a string
      const html = marked.parse(markdown).toString();

      // Calculate stats
      const stats = getTextStats(markdown);

      res.json({
        message: 'Markdown converted successfully',
        data: {
          html,
          stats,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: (error as Error).message,
        data: {
          html: '',
          stats: {
            characters: 0,
            words: 0,
            lines: 0,
          },
        },
      });
    }
  },
);

export default router;
