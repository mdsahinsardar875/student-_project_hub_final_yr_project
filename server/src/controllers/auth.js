import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { issueSession } from '../services/sessions.js';
import Session from '../models/Session.js';
import { HttpError } from '../middleware/error.js';
import { registerSchema, loginSchema, resetSchema } from '../validators/schemas.js';
import { audit } from '../utils/audit.js';

export async function register(req, res) {
  const d = registerSchema.parse(req.body); // role limited to student|teacher: admins are never self-registered
  if (await User.findOne({ email: d.email.toLowerCase() })) throw new HttpError(409, 'Email already registered');
  const user = await User.create({ ...d, passwordHash: await bcrypt.hash(d.password, 12) });
  res.status(201).json({ success: true, token: await issueSession(req, user), user: user.toSafe() });
}
export async function login(req, res) {
  const d = loginSchema.parse(req.body);
  const user = await User.findOne({ email: d.email.toLowerCase() }).select('+passwordHash');
  const ok = user && user.active && await bcrypt.compare(d.password, user.passwordHash);
  if (!ok || (d.role && d.role !== user.role)) { audit(user, 'auth.login_failed', d.email); throw new HttpError(401, 'Invalid credentials'); }
  audit(user, 'auth.login', String(user._id));
  res.json({ success: true, token: await issueSession(req, user), user: user.toSafe() });
}
export const me = (req, res) => res.json({ success: true, user: req.user.toSafe() });
export const logout = async (req, res) => { await Session.updateOne({ _id: req.session._id }, { revoked: true }); audit(req.user, 'auth.logout'); res.json({ success: true, message: 'Logged out. Discard the token on the client.' }); };
export async function updateProfile(req, res) {
  const { name, phone, department } = req.body;
  Object.assign(req.user, Object.fromEntries(Object.entries({ name, phone, department }).filter(([, v]) => typeof v === 'string' && v.trim())));
  await req.user.save();
  res.json({ success: true, user: req.user.toSafe() });
}
export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  let devToken;
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    // No mail server is configured. In development the token is returned so the flow can be tested.
    if (process.env.NODE_ENV !== 'production') devToken = token;
  }
  res.json({ success: true, message: 'If the email exists, a reset link has been issued.', ...(devToken && { devToken }) });
}
export async function resetPassword(req, res) {
  const { token, password } = resetSchema.parse(req.body);
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetTokenHash: hash, resetExpires: { $gt: new Date() } }).select('+resetTokenHash +resetExpires');
  if (!user) throw new HttpError(400, 'Reset token invalid or expired');
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined; user.resetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
}
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const u = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(currentPassword || '', u.passwordHash))) throw new HttpError(400, 'Current password incorrect');
  resetSchema.shape.password.parse(newPassword);
  u.passwordHash = await bcrypt.hash(newPassword, 12);
  await u.save();
  await Session.updateMany({ user: u._id, jti: { $ne: req.session.jti } }, { revoked: true });
  res.json({ success: true });
}

export async function listSessions(req, res) {
  const rows = await Session.find({ user: req.user._id, revoked: false }).sort('-lastActive');
  res.json({ success: true, sessions: rows.map((x) => ({ id: x._id, userAgent: x.userAgent, ip: x.ip, lastActive: x.lastActive, createdAt: x.createdAt, current: x.jti === req.session.jti })) });
}
export async function revokeSession(req, res) {
  const r = await Session.updateOne({ _id: req.params.id, user: req.user._id }, { revoked: true });
  if (!r.matchedCount) throw new HttpError(404, 'Session not found');
  res.json({ success: true });
}
export async function logoutOthers(req, res) {
  await Session.updateMany({ user: req.user._id, jti: { $ne: req.session.jti } }, { revoked: true });
  res.json({ success: true });
}
