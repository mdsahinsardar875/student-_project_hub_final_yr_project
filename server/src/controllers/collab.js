import { z } from 'zod';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Session from '../models/Session.js';
import { loadProject } from './projects.js';
import { HttpError } from '../middleware/error.js';
import { canEdit } from '../services/access.js';
import { notify } from '../services/notify.js';

const taskSchema = z.object({ title: z.string().min(2).max(150), assignee: z.string().optional(), deadline: z.coerce.date().optional(), status: z.enum(['todo', 'in_progress', 'done']).optional() });
const inTeam = (p, id) => p.team.some((m) => String(m.user._id) === String(id));
const guard = (req, p) => { if (!canEdit(req.user, p) || req.user.role === 'admin') throw new HttpError(403, 'Only team members can change tasks'); };

export async function listTasks(req, res) {
  const p = await loadProject(req);
  res.json({ success: true, team: p.team.map((m) => ({ id: m.user._id, name: m.user.name })), tasks: await Task.find({ project: p._id }).sort('createdAt').populate('assignee', 'name') });
}
export async function createTask(req, res) {
  const p = await loadProject(req); guard(req, p);
  const d = taskSchema.parse(req.body);
  if (d.assignee && !inTeam(p, d.assignee)) throw new HttpError(400, 'Assignee must be a team member');
  const t = await Task.create({ ...d, project: p._id, createdBy: req.user._id });
  if (d.assignee && String(d.assignee) !== String(req.user._id)) notify([d.assignee], 'task', 'New task assigned', `${t.title} (${p.title})`, `/student/projects/${p._id}/tasks`);
  res.status(201).json({ success: true, task: t });
}
export async function updateTask(req, res) {
  const t = await Task.findById(req.params.taskId);
  if (!t) throw new HttpError(404, 'Task not found');
  req.params.id = String(t.project);
  const p = await loadProject(req); guard(req, p);
  const d = taskSchema.partial().parse(req.body);
  if (d.assignee && !inTeam(p, d.assignee)) throw new HttpError(400, 'Assignee must be a team member');
  Object.assign(t, d); await t.save();
  res.json({ success: true, task: t });
}
export async function deleteTask(req, res) {
  const t = await Task.findById(req.params.taskId);
  if (!t) throw new HttpError(404, 'Task not found');
  req.params.id = String(t.project);
  const p = await loadProject(req); guard(req, p);
  await t.deleteOne(); res.json({ success: true });
}
export async function listMessages(req, res) {
  const p = await loadProject(req);
  const q = { project: p._id }; if (req.query.since) q.createdAt = { $gt: new Date(req.query.since) };
  res.json({ success: true, messages: await Message.find(q).sort('createdAt').limit(300).populate('sender', 'name role') });
}
export async function postMessage(req, res) {
  const p = await loadProject(req);
  if (req.user.role === 'admin') throw new HttpError(403, 'Admins can read but not post');
  const text = z.string().min(1).max(2000).parse(req.body.text);
  const m = await Message.create({ project: p._id, sender: req.user._id, text });
  res.status(201).json({ success: true, message: await m.populate('sender', 'name role') });
}
// notifications
export async function listNotifications(req, res) {
  const q = { user: req.user._id }; if (req.query.unread === 'true') q.read = false; if (req.query.type) q.type = req.query.type;
  const [items, unread, total] = await Promise.all([Notification.find(q).sort('-createdAt').limit(100), Notification.countDocuments({ user: req.user._id, read: false }), Notification.countDocuments({ user: req.user._id })]);
  res.json({ success: true, notifications: items, unread, total });
}
export async function readAllNotifications(req, res) { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ success: true }); }
export async function readNotification(req, res) { await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true }); res.json({ success: true }); }
