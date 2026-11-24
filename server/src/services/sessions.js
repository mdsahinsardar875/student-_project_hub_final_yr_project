import crypto from 'crypto';
import Session from '../models/Session.js';
import { signToken } from '../middleware/auth.js';
export async function issueSession(req, user) {
  const jti = crypto.randomUUID();
  await Session.create({ user: user._id, jti, userAgent: String(req.headers['user-agent'] || '').slice(0, 200), ip: req.ip });
  return signToken(user, jti);
}
