import request from 'supertest';
import app from '../../src/app';

describe('JSON Routes', () => {
  describe('GET /api/v1/json', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/json');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('JSON Tools API');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/v1/json/format', () => {
    it('should format valid JSON', async () => {
      const response = await request(app)
        .post('/api/v1/json/format')
        .send({
          json: '{"name":"John","age":30}',
          spaces: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toBe(
        '{\n  "name": "John",\n  "age": 30\n}',
      );
    });

    it('should minify JSON when requested', async () => {
      const response = await request(app)
        .post('/api/v1/json/format')
        .send({
          json: '{ "name": "John", "age": 30 }',
          minify: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toBe('{"name":"John","age":30}');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/v1/json/format')
        .send({
          json: '{ invalid json }',
        });

      expect(response.status).toBe(400);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle missing input', async () => {
      const response = await request(app)
        .post('/api/v1/json/format')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('JSON input is required');
    });
  });

  describe('POST /api/v1/json/validate', () => {
    it('should validate correct JSON', async () => {
      const response = await request(app)
        .post('/api/v1/json/validate')
        .send({
          json: '{"test": true}',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.parsed).toEqual({ test: true });
    });

    it('should reject invalid JSON', async () => {
      const response = await request(app)
        .post('/api/v1/json/validate')
        .send({
          json: '{invalid}',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle missing input', async () => {
      const response = await request(app)
        .post('/api/v1/json/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('JSON input is required');
    });
  });
});
