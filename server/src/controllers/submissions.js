import Submission from '../models/Submission.js';
import ProjectDocument from '../models/ProjectDocument.js';
import { loadProject } from './projects.js';
import { HttpError } from '../middleware/error.js';
import { canEdit, isAssignedTeacher } from '../services/access.js';
import { submissionSchema, reviewSchema } from '../validators/schemas.js';
import Project from '../models/Project.js';
import { notify } from '../services/notify.js';

export async function submit(req, res) {
  const p = await loadProject(req);
  if (!canEdit(req.user, p) || req.user.role === 'admin') throw new HttpError(403, 'Only team members can submit');
  if (['approved', 'completed', 'archived'].includes(p.status)) throw new HttpError(400, `Cannot submit a project that is ${p.status}`);
  const d = submissionSchema.parse(req.body);
  const docs = await ProjectDocument.find({ _id: { $in: d.documentIds }, project: p._id });
  if (docs.length !== d.documentIds.length) throw new HttpError(400, 'Some documents do not belong to this project');
  const version = (await Submission.countDocuments({ project: p._id })) + 1;
  const s = await Submission.create({ project: p._id, submittedBy: req.user._id, version, note: d.note, documents: docs.map(x => x._id) });
  p.status = 'submitted'; await p.save();
  notify([p.teacher], 'submission', 'New submission', `${p.title} — version ${version}`, `/teacher/projects/${p._id}`);
  res.status(201).json({ success: true, submission: s });
}
export async function listForProject(req, res) {
  const p = await loadProject(req);
  res.json({ success: true, submissions: await Submission.find({ project: p._id }).sort('-version').populate('documents', 'originalName version size').populate('reviews.reviewer', 'name') });
}
export async function review(req, res) {
  const s = await Submission.findById(req.params.id);
  if (!s) throw new HttpError(404, 'Submission not found');
  req.params.id = String(s.project);
  const p = await loadProject(req);
  if (!isAssignedTeacher(req.user, p)) throw new HttpError(403, 'Only the assigned teacher can review this submission');
  const d = reviewSchema.parse(req.body);
  s.reviews.push({ reviewer: req.user._id, ...d });
  s.status = { approve: 'approved', request_revision: 'revision_requested', needs_review: 'under_review' }[d.decision];
  await s.save();
  p.status = { approve: 'approved', request_revision: 'needs_revision', needs_review: 'under_review' }[d.decision];
  await p.save();
  notify(p.team.map((m) => m.user), 'review', 'Teacher feedback', `${p.title}: ${d.decision.replace('_', ' ')}`, `/student/projects/${p._id}`);
  res.json({ success: true, submission: s, projectStatus: p.status });
}
export async function pendingForTeacher(req, res) {
  const ids = (await Project.find({ teacher: req.user._id }).select('_id')).map(x => x._id);
  const subs = await Submission.find({ project: { $in: ids }, status: { $in: ['submitted', 'under_review'] } }).sort('-createdAt').populate('project', 'title department').populate('submittedBy', 'name');
  res.json({ success: true, submissions: subs });
}
