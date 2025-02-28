/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import axios from 'axios';
import { MessageResponse } from '../../../interfaces/MessageResponse';
import { IPRequest, IPResponse } from '../../../interfaces/IPTypes';

const router = express.Router();

const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '';
const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

async function getIPInfo(ip: string): Promise<IPResponse> {
  try {
    // Try ipinfo.io first
    if (IPINFO_TOKEN) {
      const response = await axios.get(
        `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`,
      );
      return {
        ...response.data,
        isValid: true,
        provider: 'ipinfo',
      };
    }

    // Fallback to ip-api.com (free, no token needed)
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;

    return {
      ip: data.query,
      hostname: data.reverse || undefined,
      city: data.city,
      region: data.regionName,
      country: data.country,
      loc: `${data.lat},${data.lon}`,
      org: data.org || data.isp,
      timezone: data.timezone,
      isValid: true,
      provider: 'ip-api',
    };
  } catch (error) {
    throw new Error(`Failed to fetch IP info: ${(error as Error).message}`);
  }
}

function isValidIP(ip: string): boolean {
  return IP_REGEX.test(ip);
}

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'IP Info Lookup API',
    data: {
      endpoints: {
        'POST /lookup': 'Lookup IP address information',
        'GET /myip': 'Get information about your IP address',
      },
    },
  });
});

router.get<{}, MessageResponse & { data: IPResponse }>(
  '/myip',
  async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const ip = clientIp.replace('::ffff:', ''); // Handle IPv4 mapped to IPv6
      const result = await getIPInfo(ip);

      res.json({
        message: 'IP information retrieved successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: (error as Error).message,
        data: {
          ip: req.ip || '0.0.0.0',
          isValid: false,
          provider: 'ipinfo' as const,
          city: undefined,
          region: undefined,
          country: undefined,
          loc: undefined,
          org: undefined,
          timezone: undefined,
        },
      });
    }
  },
);

router.post<{}, MessageResponse & { data: IPResponse }, IPRequest>(
  '/lookup',
  async (req, res) => {
    try {
      const { ip } = req.body;

      if (!ip) {
        res.status(400).json({
          message: 'IP address is required',
          data: {
            ip: '',
            isValid: false,
            provider: 'ipinfo' as const,
            city: undefined,
            region: undefined,
            country: undefined,
            loc: undefined,
            org: undefined,
            timezone: undefined,
          },
        });
        return;
      }

      if (!isValidIP(ip)) {
        res.status(400).json({
          message: 'Invalid IP address format',
          data: {
            ip,
            isValid: false,
            provider: 'ipinfo' as const,
            city: undefined,
            region: undefined,
            country: undefined,
            loc: undefined,
            org: undefined,
            timezone: undefined,
          },
        });
        return;
      }

      const result = await getIPInfo(ip);
      res.json({
        message: 'IP information retrieved successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: (error as Error).message,
        data: {
          ip: req.body.ip || '',
          isValid: false,
          provider: 'ipinfo' as const,
          city: undefined,
          region: undefined,
          country: undefined,
          loc: undefined,
          org: undefined,
          timezone: undefined,
        },
      });
    }
  },
);

export default router;
