import { buildHealthBase } from '../services/healthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  res.json(await buildHealthBase());
});

export const getSetupStatus = asyncHandler(async (req, res) => {
  const base = await buildHealthBase();
  res.json({
    ...base,
    isAdmin: req.user?.role === 'admin'
  });
});
