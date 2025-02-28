import express from 'express';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { RegexRequest, RegexResponse, RegexMatch } from '../../../interfaces/RegexTypes';

const router = express.Router();

function isValidRegex(pattern: string, flags?: string): boolean {
  try {
    new RegExp(pattern, flags);
    return true;
  } catch {
    return false;
  }
}

function findAllMatches(text: string, pattern: string, flags: string = ''): RegexMatch[] {
  const regex = new RegExp(pattern, flags.includes('g') ? flags : 'g' + flags);
  const matches: RegexMatch[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      match: match[0],
      index: match.index,
      groups: match.groups,
    });
  }

  return matches;
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Regex Testing API',
    data: {
      endpoints: {
        'POST /test': 'Test a regex pattern against input text',
        'GET /flags': 'Get available regex flags and their descriptions',
      },
    },
  });
});

router.get<{}, MessageResponse>('/flags', (_req, res) => {
  res.json({
    message: 'Available regex flags',
    data: {
      flags: {
        'g': 'Global search',
        'i': 'Case-insensitive search',
        'm': 'Multiline search',
        's': 'Allows . to match newline characters',
        'u': 'Unicode; treat pattern as a sequence of unicode code points',
        'y': 'Sticky search',
      },
    },
  });
});

router.post<{}, MessageResponse & { data: RegexResponse }, RegexRequest>('/test', (req, res) => {
  try {
    const { text, pattern, flags = '', global = true } = req.body;

    if (!text || !pattern) {
      res.status(400).json({
        message: 'Text and pattern are required',
        data: {
          matches: [],
          count: 0,
          pattern: '',
          flags: '',
          isValid: false,
          text: '',
        },
      });
      return;
    }

    // Validate regex pattern
    if (!isValidRegex(pattern, flags)) {
      res.status(400).json({
        message: 'Invalid regex pattern',
        data: {
          matches: [],
          count: 0,
          pattern,
          flags,
          isValid: false,
          text,
        },
      });
      return;
    }

    // Ensure global flag if global is true
    const effectiveFlags = global ? (flags.includes('g') ? flags : 'g' + flags) : flags;
    const matches = findAllMatches(text, pattern, effectiveFlags);

    res.json({
      message: matches.length > 0 ? 'Matches found' : 'No matches found',
      data: {
        matches,
        count: matches.length,
        pattern,
        flags: effectiveFlags,
        isValid: true,
        text,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error testing regex',
      data: {
        matches: [],
        count: 0,
        pattern: req.body.pattern || '',
        flags: req.body.flags || '',
        isValid: false,
        text: req.body.text || '',
      },
    });
  }
});

export default router;
