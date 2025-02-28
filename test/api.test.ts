/* eslint-disable @typescript-eslint/no-unused-vars */
import request from 'supertest';
import app from '../src/app';

describe('GET /api/v1', () => {
  it('responds with API documentation', async () => {
    const response = await request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // Check base response structure
    expect(response.body.message).toBe('API - 👋 Welcome to DevTools API v1');
    expect(response.body.data).toHaveProperty('availableAPIs');

    // Check all required API sections exist
    const apis = response.body.data.availableAPIs;
    expect(apis).toHaveProperty('json');
    expect(apis).toHaveProperty('encoding');
    expect(apis).toHaveProperty('uuid');
    expect(apis).toHaveProperty('time');
    expect(apis).toHaveProperty('regex');
    expect(apis).toHaveProperty('ip');
    expect(apis).toHaveProperty('markdown');
    expect(apis).toHaveProperty('minifier');
    expect(apis).toHaveProperty('beautifier');

    // Check structure of each API section
    Object.values(apis).forEach((api: any) => {
      expect(api).toHaveProperty('base');
      expect(api).toHaveProperty('description');
      expect(api).toHaveProperty('endpoints');
      expect(api.base).toMatch(/^\/api\/v1\/[a-z]+$/);
      expect(typeof api.description).toBe('string');
      expect(Object.keys(api.endpoints).length).toBeGreaterThan(0);
    });

    // Test specific endpoint examples
    expect(apis.json.endpoints['POST /format']).toBeDefined();
    expect(apis.uuid.endpoints['GET /v4']).toBeDefined();
    expect(apis.time.endpoints['GET /timezones']).toBeDefined();
  });

  it('provides valid base paths for all APIs', async () => {
    const response = await request(app)
      .get('/api/v1')
      .expect(200);

    const apis = response.body.data.availableAPIs;
    
    // Check each API base path is accessible
    for (const [key, api] of Object.entries(apis)) {
      const basePath = (api as any).base;
      const docResponse = await request(app)
        .get(basePath)
        .expect(200);

      expect(docResponse.body.message).toContain('API');
      expect(docResponse.body.data).toHaveProperty('endpoints');
    }
  });

  it('includes descriptions for all endpoints', async () => {
    const response = await request(app)
      .get('/api/v1')
      .expect(200);

    const apis = response.body.data.availableAPIs;
    
    Object.values(apis).forEach((api: any) => {
      Object.values(api.endpoints).forEach((description: any) => {
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });
  });
});