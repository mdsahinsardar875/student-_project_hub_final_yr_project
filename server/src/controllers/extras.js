import { z } from 'zod';
import Announcement from '../models/Announcement.js';
import Ticket from '../models/Ticket.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import { HttpError } from '../middleware/error.js';
import { notify } from '../services/notify.js';

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const annSchema = z.object({ title: z.string().min(3).max(150), category: z.string().default('General'), audience: z.enum(['all', 'students', 'teachers']).default('all'), message: z.string().min(3).max(4000), status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('published'), publishAt: z.coerce.date().optional() });

// ---- announcements ----
export async function listAnnouncements(req, res) {
  const u = req.user, now = new Date();
  let q;
  if (u.role === 'admin') q = {};
  else if (req.query.mine === 'true' && u.role === 'teacher') q = { author: u._id };
  else q = { audience: { $in: ['all', u.role + 's'] }, $or: [{ status: 'published' }, { status: 'scheduled', publishAt: { $lte: now } }] };
  res.json({ success: true, announcements: await Announcement.find(q).sort('-createdAt').limit(100).populate('author', 'name role') });
}
export async function createAnnouncement(req, res) {
  const d = annSchema.parse(req.body);
  if (d.status === 'scheduled' && !d.publishAt) throw new HttpError(400, 'Choose a date to schedule');
  const a = await Announcement.create({ ...d, author: req.user._id });
  if (d.status === 'published') { const roles = d.audience === 'all' ? ['student', 'teacher'] : [d.audience.slice(0, -1)]; notify((await User.find({ role: { $in: roles }, active: true }).select('_id')).map((u) => u._id), 'announcement', d.title, d.category, '/announcements'); }
  res.status(201).json({ success: true, announcement: a });
}
export async function updateAnnouncement(req, res) {
  const a = await Announcement.findById(req.params.id);
  if (!a) throw new HttpError(404, 'Not found');
  if (req.user.role !== 'admin' && String(a.author) !== String(req.user._id)) throw new HttpError(403, 'Not your announcement');
  Object.assign(a, annSchema.partial().parse(req.body)); await a.save();
  res.json({ success: true, announcement: a });
}
export async function deleteAnnouncement(req, res) {
  const a = await Announcement.findById(req.params.id);
  if (!a) throw new HttpError(404, 'Not found');
  if (req.user.role !== 'admin' && String(a.author) !== String(req.user._id)) throw new HttpError(403, 'Not your announcement');
  await a.deleteOne(); res.json({ success: true });
}

// ---- support tickets ----
export async function createTicket(req, res) {
  const d = z.object({ subject: z.string().min(3).max(150), category: z.string().default('Other'), priority: z.enum(['low', 'medium', 'high']).default('medium'), description: z.string().min(5).max(4000) }).parse(req.body);
  res.status(201).json({ success: true, ticket: await Ticket.create({ ...d, createdBy: req.user._id }) });
}
export async function listTickets(req, res) {
  const q = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
  if (req.query.status) q.status = req.query.status;
  res.json({ success: true, tickets: await Ticket.find(q).sort('-updatedAt').populate('createdBy', 'name role').populate('replies.by', 'name role') });
}
export async function replyTicket(req, res) {
  const t = await Ticket.findById(req.params.id);
  if (!t) throw new HttpError(404, 'Ticket not found');
  if (req.user.role !== 'admin' && String(t.createdBy) !== String(req.user._id)) throw new HttpError(403, 'Not your ticket');
  const text = z.string().min(1).max(2000).parse(req.body.text);
  t.replies.push({ by: req.user._id, text });
  if (req.user.role === 'admin' && t.status === 'open') t.status = 'in_progress';
  await t.save();
  if (req.user.role === 'admin') notify([t.createdBy], 'ticket', 'Support reply', t.subject, '/student/support');
  res.json({ success: true, ticket: t });
}
export async function setTicketStatus(req, res) {
  const t = await Ticket.findById(req.params.id);
  if (!t) throw new HttpError(404, 'Ticket not found');
  t.status = z.enum(['open', 'in_progress', 'resolved', 'closed']).parse(req.body.status);
  await t.save(); res.json({ success: true, ticket: t });
}

// ---- profile helpers, calendar, search, people, reports ----
export async function calendar(req, res) {
  const u = req.user, q = u.role === 'student' ? { $or: [{ owner: u._id }, { 'team.user': u._id }] } : u.role === 'teacher' ? { teacher: u._id } : {};
  const events = [];
  for (const p of await Project.find(q)) {
    if (p.expectedSubmissionDate) events.push({ date: p.expectedSubmissionDate, title: `${p.title}: final submission`, type: 'deadline', projectId: p._id });
    p.milestones.forEach((m) => m.dueDate && events.push({ date: m.dueDate, title: `${p.title}: ${m.title}`, type: 'milestone', status: m.status, projectId: p._id }));
  }
  (await Announcement.find({ status: 'scheduled', publishAt: { $exists: true } }).limit(0));
  res.json({ success: true, events: events.sort((a, b) => a.date - b.date) });
}
export async function search(req, res) {
  const text = String(req.query.q || '').trim();
  if (text.length < 2) return res.json({ success: true, results: [] });
  const r = new RegExp(esc(text), 'i'), u = req.user, results = [];
  const pq = u.role === 'student' ? { $or: [{ owner: u._id }, { 'team.user': u._id }] } : u.role === 'teacher' ? { teacher: u._id } : {};
  for (const p of await Project.find({ ...pq, $and: [{ $or: [{ title: r }, { description: r }, { category: r }] }] }).limit(20)) results.push({ type: 'project', id: p._id, title: p.title, sub: p.status });
  for (const a of await Announcement.find({ title: r, ...(u.role === 'admin' ? {} : { status: 'published' }) }).limit(10)) results.push({ type: 'announcement', id: a._id, title: a.title, sub: a.category });
  if (u.role === 'admin') for (const x of await User.find({ $or: [{ name: r }, { email: r }, { rollNumber: r }] }).limit(20)) results.push({ type: 'user', id: x._id, title: x.name, sub: `${x.role} · ${x.email}` });
  res.json({ success: true, results });
}
export async function myStudents(req, res) {
  const projects = await Project.find({ teacher: req.user._id }).populate('team.user', 'name email rollNumber department');
  const map = new Map();
  for (const p of projects) for (const m of p.team) { const k = String(m.user._id); if (!map.has(k)) map.set(k, { ...m.user.toObject(), id: k, projects: [] }); map.get(k).projects.push({ id: p._id, title: p.title, role: m.role, progress: p.progress, status: p.status }); }
  res.json({ success: true, students: [...map.values()] });
}
export async function teacherReport(req, res) {
  const ps = await Project.find({ teacher: req.user._id }), ids = ps.map((p) => p._id);
  const [subs, evs] = await Promise.all([Submission.countDocuments({ project: { $in: ids } }), Evaluation.find({ project: { $in: ids } })]);
  const byStatus = {}; ps.forEach((p) => (byStatus[p.status] = (byStatus[p.status] || 0) + 1));
  const avg = evs.length ? Math.round(evs.reduce((a, e) => a + (e.total / e.maxTotal) * 100, 0) / evs.length) : null;
  const done = ps.filter((p) => ['approved', 'completed'].includes(p.status)).length;
  res.json({ success: true, totalProjects: ps.length, totalSubmissions: subs, evaluated: evs.length, published: evs.filter((e) => e.published).length, completionRate: ps.length ? Math.round((done / ps.length) * 100) : 0, averageScorePct: avg, byStatus, grades: evs.reduce((a, e) => ((a[e.grade] = (a[e.grade] || 0) + 1), a), {}) });
}
export async function adminEvaluations(req, res) {
  res.json({ success: true, evaluations: await Evaluation.find().sort('-updatedAt').populate('project', 'title department').populate('evaluator', 'name') });
}
export async function adminSetPublished(req, res) {
  const e = await Evaluation.findById(req.params.id);
  if (!e) throw new HttpError(404, 'Evaluation not found');
  e.published = !!req.body.published; e.publishedAt = e.published ? new Date() : undefined; await e.save();
  res.json({ success: true, evaluation: e });
}
