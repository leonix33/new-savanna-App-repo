import { User } from '../models/User.js';
import { verifyAccessToken } from '../services/authService.js';
import { ApiError } from '../utils/apiError.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.get('authorization') || '';
    const [, token] = header.split(' ');
    if (!token) throw new ApiError(401, 'Authentication required');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw new ApiError(401, 'Authentication required');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

const roleRank = { viewer: 1, editor: 2, admin: 3 };

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (allowedRoles.includes(req.user.role)) return next();
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  };
}

export function requireMinimumRole(role) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (roleRank[req.user.role] >= roleRank[role]) return next();
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  };
}
