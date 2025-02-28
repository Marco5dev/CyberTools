import request from 'supertest';
import app from '../../src/app';

describe('Time Routes', () => {
  describe('GET /api/v1/time', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/time');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Time Conversion Tools API');
      expect(response.body.data.endpoints).toHaveProperty('POST /convert');
    });
  });

  describe('GET /api/v1/time/now', () => {
    it('should return current time in UTC', async () => {
      const response = await request(app).get('/api/v1/time/now');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('iso8601');
      expect(response.body.data).toHaveProperty('utc');
    });

    it('should accept timezone parameter', async () => {
      const response = await request(app)
        .get('/api/v1/time/now?timezone=America/New_York');
      expect(response.status).toBe(200);
      expect(response.body.data.timezone).toBe('America/New_York');
    });

    it('should handle invalid timezone', async () => {
      const response = await request(app)
        .get('/api/v1/time/now?timezone=Invalid/Zone');
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid timezone');
    });
  });

  describe('GET /api/v1/time/timezones', () => {
    it('should return list of available timezones', async () => {
      const response = await request(app).get('/api/v1/time/timezones');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('current');
      expect(Array.isArray(response.body.data.all)).toBe(true);
      expect(response.body.data.all.length).toBeGreaterThan(0);
    });

    it('should include UTC offsets', async () => {
      const response = await request(app).get('/api/v1/time/timezones');
      expect(response.body.data.all).toContain('UTC+00:00');
      expect(response.body.data.all).toContain('UTC-05:00');
    });
  });

  describe('POST /api/v1/time/convert', () => {
    it('should convert timestamp to date', async () => {
      const timestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          input: timestamp,
          operation: 'toDate',
          timezone: 'UTC',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.timestamp).toBe(timestamp);
      expect(response.body.data.iso8601).toContain('2021-01-01');
    });

    it('should convert date string to timestamp', async () => {
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          input: '2021-01-01T00:00:00Z',
          operation: 'toTimestamp',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.timestamp).toBe(1609459200000);
    });

    it('should handle timezone conversion', async () => {
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          input: 1609459200000,
          operation: 'toDate',
          timezone: 'UTC+01:00',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toContain('UTC+01:00');
    });

    it('should handle invalid timestamp', async () => {
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          input: 'invalid',
          operation: 'toDate',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Time conversion failed');
    });

    it('should handle invalid date string', async () => {
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          input: 'invalid-date',
          operation: 'toTimestamp',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Time conversion failed');
    });

    it('should handle missing input', async () => {
      const response = await request(app)
        .post('/api/v1/time/convert')
        .send({
          operation: 'toDate',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Input is required');
    });
  });
});
