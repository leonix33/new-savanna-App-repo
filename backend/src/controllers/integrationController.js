import { z } from 'zod';
import { publishFacebookTextPost } from '../services/facebookService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const facebookTestPostSchema = z.object({
  body: z.object({
    message: z
      .string()
      .min(1)
      .default('Savannah BBQ test post from the Growth Engine integration check.')
  }).default({})
});

export const testFacebookPost = asyncHandler(async (req, res) => {
  const result = await publishFacebookTextPost(req.body.message);
  res.json(result);
});
