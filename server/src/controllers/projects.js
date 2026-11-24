import Project from '../models/Project.js';
import User from '../models/User.js';
import ProgressUpdate from '../models/ProgressUpdate.js';
import { HttpError } from '../middleware/error.js';
import { canView, canEdit, isMember } from '../services/access.js';
import { projectSchema, projectUpdateSchema, memberSchema, progressSchema } from '../validators/schemas.js';
import { audit } from '../utils/audit.js';

const populate = (q) => q.populate('owner teacher', 'name email department').populate('team.user', 'name email rollNumber');
async function load(req) {
  const p = await populate(Project.findById(req.params.id));
  if (!p) throw new HttpError(404, 'Project not found');
  if (!canView(req.user, p)) throw new HttpError(403, 'You are not authorised to access this project');
  return p;
}
export { load as loadProject };

export async function create(req, res) {
  const { teamEmails = [], teacher, ...d } = projectSchema.parse(req.body);
  const doc = { ...d, owner: req.user._id, team: [{ user: req.user._id, role: 'Lead' }], status: 'in_progress' };
  if (teacher) {
    const t = await User.findOne({ _id: teacher, role: 'teacher' });
    if (!t) throw new HttpError(400, 'Selected teacher not found');
    doc.teacher = t._id;
  }
  for (const idf of teamEmails) {
    const u = await User.findOne({ role: 'student', $or: [{ email: idf.toLowerCase() }, { rollNumber: idf }] });
    if (!u) throw new HttpError(400, `No registered student matches "${idf}"`);
    if (!doc.team.some(m => String(m.user) === String(u._id))) doc.team.push({ user: u._id });
  }
  const p = await Project.create(doc);
  audit(req.user, 'project.create', String(p._id));
  res.status(201).json({ success: true, project: await populate(Project.findById(p._id)) });
}
export async function list(req, res) {
  const u = req.user, q = {};
  if (u.role === 'student') q.$or = [{ owner: u._id }, { 'team.user': u._id }];
  else if (u.role === 'teacher') {
    if (req.query.unassigned === 'true') { q.teacher = { $exists: false }; q.department = u.department; q.status = { $ne: 'archived' }; }
    else q.teacher = u._id;
  }
  if (req.query.status && !q.status) q.status = req.query.status;
  if (req.query.search) q.title = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(50, Number(req.query.limit) || 20);
  const [items, total] = await Promise.all([
    populate(Project.find(q).sort('-updatedAt').skip((page - 1) * limit).limit(limit)), Project.countDocuments(q)]);
  res.json({ success: true, projects: items, total, page, pages: Math.ceil(total / limit) });
}
export async function get(req, res) { res.json({ success: true, project: await load(req) }); }
export async function update(req, res) {
  const p = await load(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Only team members can edit this project');
  Object.assign(p, projectUpdateSchema.parse(req.body));
  await p.save();
  res.json({ success: true, project: p });
}
export async function archive(req, res) {
  const p = await load(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Not allowed');
  p.status = 'archived'; await p.save();
  res.json({ success: true, project: p });
}
export async function remove(req, res) {
  const p = await load(req);
  if (req.user.role !== 'admin' && String(p.owner._id) !== String(req.user._id)) throw new HttpError(403, 'Only the owner or an admin can delete');
  await p.deleteOne();
  audit(req.user, 'project.delete', String(p._id));
  res.json({ success: true });
}
export async function addMember(req, res) {
  const p = await load(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Not allowed');
  const d = memberSchema.parse(req.body);
  if (p.team.length >= 10) throw new HttpError(400, 'Team is full');
  const u = await User.findOne({ role: 'student', $or: [{ email: d.identifier.toLowerCase() }, { rollNumber: d.identifier }] });
  if (!u) throw new HttpError(404, 'No registered student with that email / roll number');
  if (p.team.some(m => String(m.user._id) === String(u._id))) throw new HttpError(409, 'Already a member');
  p.team.push({ user: u._id, role: d.role, responsibility: d.responsibility });
  await p.save();
  res.status(201).json({ success: true, project: await populate(Project.findById(p._id)) });
}
export async function updateMember(req, res) {
  const p = await load(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Not allowed');
  const m = p.team.find(m => String(m.user._id) === req.params.userId);
  if (!m) throw new HttpError(404, 'Member not found');
  if (req.body.role) m.role = req.body.role;
  if (req.body.responsibility !== undefined) m.responsibility = req.body.responsibility;
  await p.save();
  res.json({ success: true, project: p });
}
export async function removeMember(req, res) {
  const p = await load(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Not allowed');
  if (String(p.owner._id) === req.params.userId) throw new HttpError(400, 'The project owner cannot be removed');
  p.team = p.team.filter(m => String(m.user._id) !== req.params.userId);
  await p.save();
  res.json({ success: true, project: p });
}
export async function addProgress(req, res) {
  const p = await load(req);
  if (!isMember(req.user, p) && req.user.role !== 'admin') throw new HttpError(403, 'Only team members can post progress');
  const d = progressSchema.parse(req.body);
  if (d.milestoneId) {
    const ms = p.milestones.id(d.milestoneId);
    if (!ms) throw new HttpError(404, 'Milestone not found');
    if (d.milestoneStatus) ms.status = d.milestoneStatus;
  }
  p.progress = d.percent;
  if (p.status === 'draft') p.status = 'in_progress';
  await p.save();
  const u = await ProgressUpdate.create({ project: p._id, author: req.user._id, ...d });
  res.status(201).json({ success: true, update: u, project: p });
}
export async function listProgress(req, res) {
  const p = await load(req);
  res.json({ success: true, updates: await ProgressUpdate.find({ project: p._id }).sort('-createdAt').populate('author', 'name') });
}
export async function claim(req, res) {
  const proj = await Project.findById(req.params.id);
  if (!proj) throw new HttpError(404, 'Project not found');
  if (proj.teacher) throw new HttpError(409, 'Project already has a teacher');
  if (proj.department !== req.user.department) throw new HttpError(403, 'Project belongs to another department');
  proj.teacher = req.user._id; await proj.save();
  audit(req.user, 'project.claim', String(proj._id));
  res.json({ success: true, project: await populate(Project.findById(proj._id)) });
}
