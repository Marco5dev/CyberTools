import express from 'express';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { TimestampRequest, TimestampResponse } from '../../../interfaces/TimeTypes';

const router = express.Router();

// Define comprehensive timezone list
const STANDARD_TIMEZONES = [
  'UTC',
  ...Intl.supportedValuesOf('timeZone'),
  // Add major UTC offsets
  ...Array.from({ length: 26 }, (_, i) => {
    const offset = i - 12;
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(offset).toString().padStart(2, '0');
    return `UTC${sign}${hours}:00`;
  }),
].filter((value, index, self) => self.indexOf(value) === index).sort(); // Remove duplicates and sort

function isValidTimestamp(timestamp: number): boolean {
  const date = new Date(timestamp);
  return date.getTime() > 0 && !isNaN(date.getTime());
}

function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function isValidTimezone(tz: string): boolean {
  try {
    // Test if timezone is valid using Intl
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    // Check if it's a valid UTC offset format
    return /^UTC[+-]\d{2}:\d{2}$/.test(tz);
  }
}

function convertUTCOffsetToMinutes(tz: string): number {
  if (tz === 'UTC') return 0;
  const match = tz.match(/^UTC([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  return (sign === '+' ? 1 : -1) * (parseInt(hours, 10) * 60 + parseInt(minutes, 10));
}

function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function formatDate(timestamp: number, timezone: string = 'UTC'): TimestampResponse {
  try {
    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    const date = new Date(timestamp);
    let formattedDate: string;

    if (timezone.startsWith('UTC')) {
      // Handle UTC offsets manually
      const offsetMinutes = convertUTCOffsetToMinutes(timezone);
      const utcTime = date.getTime() + (offsetMinutes * 60000);
      const offsetDate = new Date(utcTime);
      formattedDate = offsetDate.toISOString().replace('T', ' ').replace('Z', ` (${timezone})`);
    } else {
      // Use Intl for named timezones
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      });
      formattedDate = formatter.format(date);
    }

    return {
      result: formattedDate,
      timestamp: timestamp,
      iso8601: date.toISOString(),
      utc: date.toUTCString(),
      inputType: 'timestamp',
      timezone: timezone,
    };
  } catch (error) {
    throw new Error(`Invalid timestamp or timezone: ${(error as Error).message}`);
  }
}

// Update timezone listing endpoint
router.get<{}, MessageResponse>('/timezones', (_req, res) => {
  res.json({
    message: 'Available timezones',
    data: {
      current: getSystemTimezone(),
      all: STANDARD_TIMEZONES,
      count: STANDARD_TIMEZONES.length,
    },
  });
});

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'Time Conversion Tools API',
    data: {
      endpoints: {
        'POST /convert': 'Convert between timestamps and dates',
        'GET /now': 'Get current time in multiple formats',
        'GET /timezones': 'List all available timezones',
      },
    },
  });
});

router.get<{}, MessageResponse & { data: TimestampResponse }>('/now', (req, res) => {
  const timezone = (req.query.timezone as string) || getSystemTimezone();
  const now = Date.now();
  
  try {
    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    const result = formatDate(now, timezone);
    res.json({
      message: 'Current time retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
      data: {
        result: '',
        timestamp: 0,
        iso8601: '',
        utc: '',
        inputType: 'timestamp' as const,
        timezone: 'UTC',
      },
    });
  }
});

router.post<{}, MessageResponse & { data: TimestampResponse }, TimestampRequest>('/convert', (req, res) => {
  try {
    const { input, operation, timezone = 'UTC' } = req.body;

    if (!input) {
      res.status(400).json({
        message: 'Input is required',
        data: {
          result: '',
          timestamp: 0,
          iso8601: '',
          utc: '',
          inputType: 'timestamp' as const,
          timezone: 'UTC',
        },
      });
      return;
    }

    let timestamp: number;
    
    if (operation === 'toDate') {
      timestamp = typeof input === 'string' ? parseInt(input, 10) : input as number;
      if (!isValidTimestamp(timestamp)) {
        throw new Error('Invalid timestamp');
      }
    } else {
      if (typeof input !== 'string') {
        throw new Error('Invalid date string');
      }
      if (!isValidDateString(input)) {
        throw new Error('Invalid date format');
      }
      timestamp = new Date(input).getTime();
    }

    const result = formatDate(timestamp, timezone);
    res.json({
      message: 'Time conversion successful',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Time conversion failed',
      data: {
        result: '',
        timestamp: 0,
        iso8601: '',
        utc: '',
        inputType: 'timestamp' as const,
        timezone: 'UTC',
      },
    });
  }
});

export default router;
