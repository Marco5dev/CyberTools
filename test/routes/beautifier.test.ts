import request from 'supertest';
import app from '../../src/app';

describe('Beautifier Routes', () => {
  describe('GET /api/v1/beautifier', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api/v1/beautifier');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Code Beautifier API');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/v1/beautifier/format', () => {
    it('should format JavaScript code', async () => {
      const response = await request(app)
        .post('/api/v1/beautifier/format')
        .send({
          content: 'function test(){return true}',
          language: 'javascript',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toBe(
        'function test() {\n  return true;\n}\n',
      );
      expect(response.body.data.stats.indentationLevel).toBe(2);
    });

    it('should format JSON with custom options', async () => {
      const response = await request(app)
        .post('/api/v1/beautifier/format')
        .send({
          content: '{"name":"John","age":30}',
          language: 'json',
          options: {
            tabWidth: 4,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toContain('    "name"');
      expect(response.body.data.stats.indentationLevel).toBe(4);
    });

    it('should format CSS code', async () => {
      const response = await request(app)
        .post('/api/v1/beautifier/format')
        .send({
          content: '.class{color:red;margin:0;}',
          language: 'css',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toContain('{\n');
      expect(response.body.data.formatted).toContain('color: red;');
    });

    it('should handle invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/beautifier/format')
        .send({
          content: '{invalid:json',
          language: 'json',
        });

      expect(response.status).toBe(400);
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle unsupported language', async () => {
      const response = await request(app)
        .post('/api/v1/beautifier/format')
        .send({
          content: 'some code',
          language: 'unsupported',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Unsupported language');
    });
  });
});
