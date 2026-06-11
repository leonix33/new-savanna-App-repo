import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validate } from '../src/middleware/validate.js';

describe('validate middleware', () => {
  it('does not assign to Express query when schema only validates body', async () => {
    const app = express();
    app.use(express.json());
    app.post(
      '/login',
      validate(
        z.object({
          body: z.object({
            email: z.string().email(),
            password: z.string().min(1)
          })
        })
      ),
      (req, res) => res.json({ email: req.body.email })
    );

    const response = await request(app)
      .post('/login')
      .send({ email: 'admin@example.com', password: 'ChangeMe123!' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('admin@example.com');
  });

  it('exposes parsed query values for routes that validate query params', async () => {
    const app = express();
    app.get(
      '/items',
      validate(
        z.object({
          query: z.object({
            limit: z.coerce.number().min(1).default(25)
          })
        })
      ),
      (req, res) => res.json({ limit: req.query.limit })
    );

    const response = await request(app).get('/items?limit=10');

    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(10);
  });
});
