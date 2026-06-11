import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });

const signRefreshToken = (user, tokenId) =>
  jwt.sign({ sub: user.id, jti: tokenId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });

export async function issueTokens(user) {
  const tokenId = crypto.randomUUID();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, tokenId);
  await user.setRefreshToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive || !(await user.verifyPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  user.lastLoginAt = new Date();
  const tokens = await issueTokens(user);
  return { user: user.toSafeObject(), ...tokens };
}

export async function loginForLocalDev() {
  if (env.NODE_ENV === 'production') {
    throw new ApiError(404, 'Not found');
  }

  let user = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (!user) {
    user = new User({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      role: 'admin'
    });
    await user.setPassword(env.ADMIN_PASSWORD);
  } else {
    user.name = user.name || env.ADMIN_NAME;
    user.role = 'admin';
    user.isActive = true;
  }

  user.lastLoginAt = new Date();
  const tokens = await issueTokens(user);
  return { user: user.toSafeObject(), ...tokens };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(401, 'Refresh token is required');

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive || !(await user.verifyRefreshToken(refreshToken))) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokens = await issueTokens(user);
  return { user: user.toSafeObject(), ...tokens };
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid access token');
  }
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}
