import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const roles = ['admin', 'editor', 'viewer'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: 'viewer' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    refreshTokenHash: String
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setRefreshToken = async function setRefreshToken(token) {
  this.refreshTokenHash = await bcrypt.hash(token, 12);
};

userSchema.methods.verifyRefreshToken = function verifyRefreshToken(token) {
  if (!this.refreshTokenHash) return false;
  return bcrypt.compare(token, this.refreshTokenHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const User = mongoose.model('User', userSchema);
