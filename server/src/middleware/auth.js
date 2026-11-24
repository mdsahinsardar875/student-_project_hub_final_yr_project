import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
export const signToken = (user, jti) => jwt.sign({ id: user._id, role: user.role, jti }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
export async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    const { id, jti } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.active) throw new Error('inactive');
    const session = await Session.findOne({ jti, user: id, revoked: false });
    if (!session) throw new Error('revoked');
    if (Date.now() - session.lastActive > 60000) { session.lastActive = new Date(); session.save().catch(() => {}); }
    req.user = user; req.session = session;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
}
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'Access denied for your role' });
