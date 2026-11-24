import fs from 'fs';
import path from 'path';
import ProjectDocument from '../models/ProjectDocument.js';
import { loadProject } from './projects.js';
import { HttpError } from '../middleware/error.js';
import { canEdit } from '../services/access.js';
import Project from '../models/Project.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

export async function uploadDocs(req, res) {
  const p = await loadProject(req);
  if (!canEdit(req.user, p)) { (req.files || []).forEach(f => fs.unlink(f.path, () => {})); throw new HttpError(403, 'Only team members can upload'); }
  if (!req.files?.length) throw new HttpError(400, 'No files received');
  const out = [];
  for (const f of req.files) {
    const prev = await ProjectDocument.findOne({ project: p._id, originalName: f.originalname }).sort('-version'); // revision history by name
    out.push(await ProjectDocument.create({
      project: p._id, uploadedBy: req.user._id, originalName: f.originalname, storedName: f.filename,
      mimeType: f.mimetype, size: f.size, version: prev ? prev.version + 1 : 1, category: req.body.category || 'other' }));
  }
  res.status(201).json({ success: true, documents: out });
}
export async function listDocs(req, res) {
  const p = await loadProject(req);
  res.json({ success: true, documents: await ProjectDocument.find({ project: p._id }).sort('-createdAt').populate('uploadedBy', 'name') });
}
export async function download(req, res) {
  const doc = await ProjectDocument.findById(req.params.docId);
  if (!doc) throw new HttpError(404, 'Document not found');
  req.params.id = String(doc.project);
  await loadProject(req); // enforces view permission
  const file = path.join(UPLOAD_DIR, path.basename(doc.storedName));
  if (!fs.existsSync(file)) throw new HttpError(404, 'File missing on server');
  res.download(file, doc.originalName);
}
export async function removeDoc(req, res) {
  const doc = await ProjectDocument.findById(req.params.docId);
  if (!doc) throw new HttpError(404, 'Document not found');
  req.params.id = String(doc.project);
  const p = await loadProject(req);
  if (!canEdit(req.user, p)) throw new HttpError(403, 'Not allowed');
  fs.unlink(path.join(UPLOAD_DIR, path.basename(doc.storedName)), () => {});
  await doc.deleteOne();
  res.json({ success: true });
}

export async function listAll(req, res) {
  const u = req.user;
  const pq = u.role === 'student' ? { $or: [{ owner: u._id }, { 'team.user': u._id }] } : u.role === 'teacher' ? { teacher: u._id } : {};
  const projects = await Project.find(pq).select('title');
  const q = { project: { $in: projects.map((p) => p._id) } };
  if (req.query.project) q.project = req.query.project;
  if (req.query.category) q.category = req.query.category;
  if (req.query.search) q.originalName = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const docs = await ProjectDocument.find(q).sort('-createdAt').limit(300).populate('project', 'title').populate('uploadedBy', 'name');
  res.json({ success: true, projects, documents: docs, totalBytes: docs.reduce((a, d) => a + (d.size || 0), 0) });
}
