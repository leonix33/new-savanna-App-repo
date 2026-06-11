import { z } from 'zod';
import {
  getRefreshCookieOptions,
  login,
  loginForLocalDev,
  logout,
  refresh
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const loginUser = asyncHandler(async (req, res) => {
  const result = await login(req.body.email, req.body.password);
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const loginLocalDevUser = asyncHandler(async (_req, res) => {
  const result = await loginForLocalDev();
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const result = await refresh(req.cookies.refreshToken);
  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) await logout(req.user.id);
  res.clearCookie('refreshToken', getRefreshCookieOptions());
  res.status(204).end();
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});
