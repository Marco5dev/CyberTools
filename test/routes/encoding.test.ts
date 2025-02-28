import request from 'supertest';
import app from '../../src/app';

describe('Encoding Routes', () => {
  describe('GET /api/v1/encoding', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/encoding');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Encoding Tools API');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/v1/encoding/base64', () => {
    it('should encode text to base64', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          input: 'Hello, World!',
          operation: 'encode',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('SGVsbG8sIFdvcmxkIQ==');
      expect(response.body.data.inputSize).toBe(13);
      expect(response.body.data.outputSize).toBe(20);
      expect(response.body.data.operation).toBe('encode');
    });

    it('should decode base64 to text', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          input: 'SGVsbG8sIFdvcmxkIQ==',
          operation: 'decode',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('Hello, World!');
      expect(response.body.data.operation).toBe('decode');
    });

    it('should handle invalid base64 input', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          input: 'invalid-base64!',
          operation: 'decode',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toHaveProperty('error');
      expect(response.body.data.result).toBe('');
      expect(response.body.message).toBe('Invalid base64 string provided');
    });

    it('should handle missing input', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          operation: 'encode',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Input must be a non-empty string');
      expect(response.body.data).toHaveProperty('error', 'Invalid input format');
    });

    it('should handle invalid operation', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          input: 'test',
          operation: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid operation. Use "encode" or "decode"');
      expect(response.body.data.error).toBe('Invalid operation type');
      expect(response.body.data.result).toBe('');
    });

    it('should handle missing operation', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/base64')
        .send({
          input: 'test',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid operation. Use "encode" or "decode"');
      expect(response.body.data.error).toBe('Invalid operation type');
    });
  });

  describe('POST /api/v1/encoding/url', () => {
    it('should encode full URL', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'https://example.com/path with spaces',
          operation: 'encode',
          mode: 'full',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('https://example.com/path%20with%20spaces');
      expect(response.body.data.mode).toBe('full');
      expect(response.body.data).toHaveProperty('inputSize');
      expect(response.body.data).toHaveProperty('outputSize');
    });

    it('should encode URL component', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'path/with spaces&special=chars?',
          operation: 'encode',
          mode: 'component',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('path%2Fwith%20spaces%26special%3Dchars%3F');
      expect(response.body.data.mode).toBe('component');
    });

    it('should decode URL', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'https://example.com/path%20with%20spaces',
          operation: 'decode',
          mode: 'full',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('https://example.com/path with spaces');
    });

    it('should handle invalid URL input', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: '\ninvalid\rurl',
          operation: 'decode',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toHaveProperty('error', 'URL contains invalid characters');
      expect(response.body.message).toBe('Invalid URL string provided');
    });

    it('should handle improper encoded URL for decoding', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'not%properly%encoded',
          operation: 'decode',
          mode: 'component',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toHaveProperty('error', 'Invalid URL encoded string');
    });

    it('should handle missing URL', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          operation: 'encode',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle missing URL and operation', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('URL must be a non-empty string');
      expect(response.body.data.error).toBe('Invalid URL format');
    });

    it('should handle invalid URL operation', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'https://example.com',
          operation: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid operation. Use "encode" or "decode"');
      expect(response.body.data.error).toBe('Invalid operation type');
    });

    it('should preserve special characters in full URL mode', async () => {
      const response = await request(app)
        .post('/api/v1/encoding/url')
        .send({
          url: 'https://api.example.com/path?key=value&other=123',
          operation: 'encode',
          mode: 'full',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toContain('?key=value&other=123');
    });
  });
});
