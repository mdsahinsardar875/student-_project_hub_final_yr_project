import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Project from '../models/Project.js';
import AuditLog from '../models/AuditLog.js';
import { UPLOAD_DIR } from '../middleware/upload.js';
import { HttpError } from '../middleware/error.js';
import { audit } from '../utils/audit.js';

export const BACKUP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../backups');
const dirSize = (d) => { let size = 0, files = 0; for (const f of fs.existsSync(d) ? fs.readdirSync(d) : []) { if (f.startsWith('.')) continue; const st = fs.statSync(path.join(d, f)); if (st.isFile()) { size += st.size; files++; } } return { size, files }; };

export async function systemStatus(req, res) {
  const t0 = Date.now(); let dbOk = false;
  try { await mongoose.connection.db.admin().ping(); dbOk = true; } catch {}
  const total = os.totalmem(), free = os.freemem(), up = dirSize(UPLOAD_DIR), bk = dirSize(BACKUP_DIR);
  const [users, projects] = await Promise.all([User.countDocuments(), Project.countDocuments()]).catch(() => [null, null]);
  res.json({ success: true, checkedAt: new Date(), services: { api: true, database: dbOk, fileStorage: fs.existsSync(UPLOAD_DIR), email: false },
    dbLatencyMs: Date.now() - t0, uptimeSec: Math.round(process.uptime()), node: process.version,
    memory: { usedPct: Math.round(((total - free) / total) * 100), processMB: Math.round(process.memoryUsage().rss / 1048576) },
    cpuLoad1m: Number(os.loadavg()[0].toFixed(2)), cpuCount: os.cpus().length,
    storage: { uploadsBytes: up.size, uploadFiles: up.files, backupsBytes: bk.size }, counts: { users, projects } });
}

// ---- backups (JSON snapshots of every collection, stored on the server) ----
const EJSON = () => mongoose.mongo.BSON.EJSON;
const safe = (n) => /^backup-[\w.:-]+\.json$/.test(n) && !n.includes('..');
export async function createBackup(req, res) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const cols = await mongoose.connection.db.listCollections().toArray(), data = {};
  for (const c of cols) data[c.name] = await mongoose.connection.db.collection(c.name).find({}).toArray();
  const name = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(path.join(BACKUP_DIR, name), EJSON().stringify({ createdAt: new Date(), collections: data }, { relaxed: false }));
  audit(req.user, 'admin.backup_create', name);
  res.status(201).json({ success: true, name });
}
export async function listBackups(req, res) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const items = fs.readdirSync(BACKUP_DIR).filter(safe).map((n) => { const st = fs.statSync(path.join(BACKUP_DIR, n)); return { name: n, size: st.size, createdAt: st.mtime }; }).sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, backups: items, totalBytes: items.reduce((a, b) => a + b.size, 0) });
}
export async function downloadBackup(req, res) {
  if (!safe(req.params.name) || !fs.existsSync(path.join(BACKUP_DIR, req.params.name))) throw new HttpError(404, 'Backup not found');
  audit(req.user, 'admin.backup_download', req.params.name);
  res.download(path.join(BACKUP_DIR, req.params.name));
}
export async function deleteBackup(req, res) {
  if (!safe(req.params.name) || !fs.existsSync(path.join(BACKUP_DIR, req.params.name))) throw new HttpError(404, 'Backup not found');
  fs.unlinkSync(path.join(BACKUP_DIR, req.params.name)); audit(req.user, 'admin.backup_delete', req.params.name);
  res.json({ success: true });
}

// ---- audit & compliance ----
function auditQuery(qs) {
  const q = {};
  if (qs.module) q.action = new RegExp('^' + qs.module.replace(/[^a-z_]/gi, '') + '\\.');
  if (qs.from || qs.to) q.createdAt = { ...(qs.from && { $gte: new Date(qs.from) }), ...(qs.to && { $lte: new Date(qs.to + 'T23:59:59') }) };
  return q;
}
export async function auditLogs(req, res) {
  const logs = await AuditLog.find(auditQuery(req.query)).sort('-createdAt').limit(500).populate('actor', 'name role');
  if (req.query.format === 'csv') {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    res.type('text/csv').attachment('audit-log.csv').send(['time,user,role,action,target', ...logs.map((l) => [l.createdAt.toISOString(), l.actor?.name, l.actor?.role, l.action, l.target].map(esc).join(','))].join('\n'));
    return;
  }
  res.json({ success: true, logs });
}
export async function auditSummary(req, res) {
  const since = new Date(Date.now() - 13 * 86400000); since.setHours(0, 0, 0, 0);
  const [total, loginOk, loginFailed, privileged, trend] = await Promise.all([
    AuditLog.countDocuments(), AuditLog.countDocuments({ action: 'auth.login' }), AuditLog.countDocuments({ action: 'auth.login_failed' }),
    AuditLog.countDocuments({ action: /^(admin|user)\./ }),
    AuditLog.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ success: true, total, loginOk, loginFailed, privileged, trend: trend.map((t) => ({ day: t._id, count: t.n })) });
}
