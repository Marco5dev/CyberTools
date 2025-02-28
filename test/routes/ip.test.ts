import request from 'supertest';
import app from '../../src/app';

describe('IP Routes', () => {
  describe('GET /api/v1/ip', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/ip');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('IP Info Lookup API');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/v1/ip/myip', () => {
    it('should return information about client IP', async () => {
      const response = await request(app).get('/api/v1/ip/myip');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('ip');
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('provider');
    });
  });

  describe('POST /api/v1/ip/lookup', () => {
    it('should lookup valid IP address information', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({ ip: '8.8.8.8' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('ip');
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data).toHaveProperty('country');
    });

    it('should reject invalid IP format', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({ ip: 'invalid-ip' });

      expect(response.status).toBe(400);
      expect(response.body.data.isValid).toBe(false);
    });

    it('should handle missing IP in request', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('IP address is required');
    });

    it('should validate private IP addresses', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({ ip: '192.168.1.1' });

      expect(response.status).toBe(200);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should validate IP address at boundaries', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({ ip: '255.255.255.255' });

      expect(response.status).toBe(200);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should reject IP with invalid octets', async () => {
      const response = await request(app)
        .post('/api/v1/ip/lookup')
        .send({ ip: '256.1.2.3' });

      expect(response.status).toBe(400);
      expect(response.body.data.isValid).toBe(false);
    });
  });
});
