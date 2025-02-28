import request from 'supertest';
import app from '../../src/app';

describe('UUID Routes', () => {
  describe('GET /uuid', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/uuid');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('UUID Tools API');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });

  describe('GET /uuid/v4', () => {
    it('should generate a valid UUID v4', async () => {
      const response = await request(app).get('/api/v1/uuid/v4');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('UUID v4 generated successfully');
      expect(response.body.data.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs for multiple calls', async () => {
      const response1 = await request(app).get('/api/v1/uuid/v4');
      const response2 = await request(app).get('/api/v1/uuid/v4');
      expect(response1.body.data.uuid).not.toBe(response2.body.data.uuid);
    });
  });

  describe('GET /uuid/v1', () => {
    it('should generate a valid UUID v1', async () => {
      const response = await request(app).get('/api/v1/uuid/v1');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('UUID v1 generated successfully');
      expect(response.body.data.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate chronologically ordered UUIDs', async () => {
      const response1 = await request(app).get('/api/v1/uuid/v1');
      const response2 = await request(app).get('/api/v1/uuid/v1');
      const time1 = parseInt(response1.body.data.uuid.slice(0, 8), 16);
      const time2 = parseInt(response2.body.data.uuid.slice(0, 8), 16);
      expect(time2).toBeGreaterThanOrEqual(time1);
    });
  });

  describe('POST /uuid/validate', () => {
    it('should validate a correct UUID v4', async () => {
      const testUUID = '123e4567-e89b-4d3c-b456-556642440000';
      const response = await request(app)
        .post('/api/v1/uuid/validate')
        .send({ uuid: testUUID });
      
      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.version).toBe(4);
    });

    it('should validate a correct UUID v1', async () => {
      const testUUID = '123e4567-e89b-1d3c-b456-556642440000';
      const response = await request(app)
        .post('/api/v1/uuid/validate')
        .send({ uuid: testUUID });
      
      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.version).toBe(1);
    });

    it('should reject an invalid UUID format', async () => {
      const response = await request(app)
        .post('/api/v1/uuid/validate')
        .send({ uuid: 'invalid-uuid' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.version).toBe(null);
    });

    it('should handle missing UUID in request', async () => {
      const response = await request(app)
        .post('/api/v1/uuid/validate')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.data.valid).toBe(false);
    });
  });
});
