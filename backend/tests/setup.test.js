import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('setup status endpoint', () => {
  it('requires authentication', async () => {
    const response = await request(createApp()).get('/api/setup/status');
    expect(response.status).toBe(401);
  });
});
