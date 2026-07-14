import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('health endpoint', () => {
  it('returns rich service health', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.ok).toBeDefined();
    expect(response.body.service).toBe('savannah-bbq-growth-engine');
    expect(response.body.mongoConfigured).toBe(true);
    expect(response.body.openaiDemoMode).toBeDefined();
    expect(response.body.facebookReadOnlyReady).toBeDefined();
    expect(response.body.time).toBeTruthy();
  });
});
