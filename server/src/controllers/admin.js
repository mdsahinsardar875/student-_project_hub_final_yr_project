import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Evaluation from '../models/Evaluation.js';
import AuditLog from '../models/AuditLog.js';
import { HttpError } from '../middleware/error.js';
import { audit } from '../utils/audit.js';

export async function stats(req, res) {
  const [users, projects, evaluations, byRole, byStatus] = await Promise.all([
    User.countDocuments(), Project.countDocuments(), Evaluation.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  res.json({ success: true, users, projects, evaluations, byRole, byStatus });
}
export async function listUsers(req, res) {
  const q = {};
  if (req.query.role) q.role = req.query.role;
  if (req.query.search) { const r = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); q.$or = [{ name: r }, { email: r }]; }
  res.json({ success: true, users: (await User.find(q).sort('-createdAt').limit(200)).map(u => u.toSafe()) });
}
export async function setActive(req, res) {
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, 'User not found');
  if (String(u._id) === String(req.user._id)) throw new HttpError(400, 'You cannot deactivate yourself');
  u.active = !!req.body.active; await u.save();
  audit(req.user, u.active ? 'user.activate' : 'user.deactivate', String(u._id));
  res.json({ success: true, user: u.toSafe() });
}
export async function adminResetPassword(req, res) {
  const { password } = req.body;
  if (!password || password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, 'User not found');
  u.passwordHash = await bcrypt.hash(password, 12); await u.save();
  audit(req.user, 'user.reset_password', String(u._id));
  res.json({ success: true });
}
export async function assignTeacher(req, res) {
  const t = await User.findOne({ _id: req.body.teacherId, role: 'teacher' });
  const p = await Project.findById(req.params.id);
  if (!t || !p) throw new HttpError(404, 'Teacher or project not found');
  p.teacher = t._id; await p.save();
  audit(req.user, 'project.assign_teacher', String(p._id), { teacher: String(t._id) });
  res.json({ success: true, project: p });
}
export async function auditLogs(req, res) {
  res.json({ success: true, logs: await AuditLog.find().sort('-createdAt').limit(200).populate('actor', 'name role') });
}
export async function listTeachers(req, res) {
  const q = { role: 'teacher', active: true };
  if (req.query.department) q.department = req.query.department;
  res.json({ success: true, teachers: (await User.find(q)).map(u => u.toSafe()) });
}
