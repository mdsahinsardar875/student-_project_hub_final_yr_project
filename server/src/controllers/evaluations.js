import Evaluation from '../models/Evaluation.js';
import Project from '../models/Project.js';
import { loadProject } from './projects.js';
import { HttpError } from '../middleware/error.js';
import { isAssignedTeacher, isMember } from '../services/access.js';
import { evaluationSchema } from '../validators/schemas.js';
import { gradeFor } from '../utils/grade.js';
import { notify } from '../services/notify.js';

export async function upsert(req, res) {
  const p = await loadProject(req);
  if (!isAssignedTeacher(req.user, p)) throw new HttpError(403, 'Only the assigned teacher can evaluate this project');
  const d = evaluationSchema.parse(req.body);
  const total = d.criteria.reduce((a, c) => a + c.obtained, 0), maxTotal = d.criteria.reduce((a, c) => a + c.max, 0);
  if (!maxTotal) throw new HttpError(400, 'Total max marks must be above zero');
  const pct = (total / maxTotal) * 100, grade = gradeFor(pct);
  let ev = await Evaluation.findOne({ project: p._id });
  if (!ev) ev = new Evaluation({ project: p._id, evaluator: req.user._id });
  if (ev.total != null) ev.history.push({ at: new Date(), by: req.user._id, total: ev.total, grade: ev.grade });
  Object.assign(ev, { criteria: d.criteria, remarks: d.remarks, total, maxTotal, grade, result: pct >= 50 ? 'pass' : 'fail', evaluator: req.user._id });
  if (d.publish && !ev.published) { ev.published = true; ev.publishedAt = new Date(); p.status = 'completed'; await p.save(); notify(p.team.map((m) => m.user), 'evaluation', 'Evaluation published', `${p.title}: ${total}/${maxTotal} (${grade})`, `/student/projects/${p._id}`); }
  await ev.save();
  res.status(201).json({ success: true, evaluation: ev });
}
export async function getForProject(req, res) {
  const p = await loadProject(req);
  const ev = await Evaluation.findOne({ project: p._id }).populate('evaluator', 'name');
  if (!ev) return res.json({ success: true, evaluation: null });
  // Students only ever see published results.
  if (!ev.published && isMember(req.user, p) && req.user.role === 'student') return res.json({ success: true, evaluation: null, pending: true });
  res.json({ success: true, evaluation: ev });
}
export async function listForTeacher(req, res) {
  const ids = (await Project.find({ teacher: req.user._id }).select('_id')).map(x => x._id);
  res.json({ success: true, evaluations: await Evaluation.find({ project: { $in: ids } }).populate('project', 'title').sort('-updatedAt') });
}
