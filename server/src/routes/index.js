import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { auth, requireRole } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import { upload } from '../middleware/upload.js';
import * as A from '../controllers/auth.js';
import * as P from '../controllers/projects.js';
import * as D from '../controllers/documents.js';
import * as S from '../controllers/submissions.js';
import * as E from '../controllers/evaluations.js';
import * as AD from '../controllers/admin.js';
import * as X from '../controllers/extras.js';
import * as C from '../controllers/collab.js';
import * as SY from '../controllers/system.js';

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'test' ? 1000 : 10, standardHeaders: true, message: { success: false, message: 'Too many attempts, try again later' } });
const student = requireRole('student'), teacher = requireRole('teacher'), admin = requireRole('admin');

r.get('/health', (q, s) => s.json({ success: true, status: 'ok' }));
// auth
r.post('/auth/register', wrap(A.register));
r.post('/auth/login', loginLimiter, wrap(A.login));
r.post('/auth/forgot-password', loginLimiter, wrap(A.forgotPassword));
r.post('/auth/reset-password', loginLimiter, wrap(A.resetPassword));
r.post('/auth/logout', auth, A.logout);
r.get('/auth/me', auth, A.me);
r.patch('/auth/profile', auth, wrap(A.updateProfile));
r.post('/auth/change-password', auth, wrap(A.changePassword));
// lookups
r.get('/teachers', auth, wrap(AD.listTeachers));
// projects
r.post('/projects', auth, student, wrap(P.create));
r.get('/projects', auth, wrap(P.list));
r.get('/projects/:id', auth, wrap(P.get));
r.patch('/projects/:id', auth, wrap(P.update));
r.post('/projects/:id/archive', auth, wrap(P.archive));
r.delete('/projects/:id', auth, wrap(P.remove));
r.post('/projects/:id/claim', auth, teacher, wrap(P.claim));
// team
r.post('/projects/:id/team', auth, wrap(P.addMember));
r.patch('/projects/:id/team/:userId', auth, wrap(P.updateMember));
r.delete('/projects/:id/team/:userId', auth, wrap(P.removeMember));
// progress
r.post('/projects/:id/progress', auth, wrap(P.addProgress));
r.get('/projects/:id/progress', auth, wrap(P.listProgress));
// documents
r.post('/projects/:id/documents', auth, upload.array('files', 10), wrap(D.uploadDocs));
r.get('/projects/:id/documents', auth, wrap(D.listDocs));
r.get('/documents', auth, wrap(D.listAll));
r.get('/documents/:docId/download', auth, wrap(D.download));
r.delete('/documents/:docId', auth, wrap(D.removeDoc));
// submissions
r.post('/projects/:id/submissions', auth, student, wrap(S.submit));
r.get('/projects/:id/submissions', auth, wrap(S.listForProject));
r.get('/submissions/pending', auth, teacher, wrap(S.pendingForTeacher));
r.post('/submissions/:id/review', auth, teacher, wrap(S.review));
// evaluations
r.put('/projects/:id/evaluation', auth, teacher, wrap(E.upsert));
r.get('/projects/:id/evaluation', auth, wrap(E.getForProject));
r.get('/evaluations', auth, teacher, wrap(E.listForTeacher));
// admin
r.get('/admin/stats', auth, admin, wrap(AD.stats));
r.get('/admin/users', auth, admin, wrap(AD.listUsers));
r.patch('/admin/users/:id/active', auth, admin, wrap(AD.setActive));
r.post('/admin/users/:id/reset-password', auth, admin, wrap(AD.adminResetPassword));
r.post('/admin/projects/:id/assign-teacher', auth, admin, wrap(AD.assignTeacher));
r.get('/admin/audit-logs', auth, admin, wrap(SY.auditLogs));
r.get('/admin/audit-summary', auth, admin, wrap(SY.auditSummary));
r.get('/admin/system', auth, admin, wrap(SY.systemStatus));
r.get('/admin/backups', auth, admin, wrap(SY.listBackups));
r.post('/admin/backups', auth, admin, wrap(SY.createBackup));
r.get('/admin/backups/:name', auth, admin, wrap(SY.downloadBackup));
r.delete('/admin/backups/:name', auth, admin, wrap(SY.deleteBackup));
// announcements
r.get('/announcements', auth, wrap(X.listAnnouncements));
r.post('/announcements', auth, requireRole('teacher', 'admin'), wrap(X.createAnnouncement));
r.patch('/announcements/:id', auth, requireRole('teacher', 'admin'), wrap(X.updateAnnouncement));
r.delete('/announcements/:id', auth, requireRole('teacher', 'admin'), wrap(X.deleteAnnouncement));
// support tickets
r.post('/tickets', auth, wrap(X.createTicket));
r.get('/tickets', auth, wrap(X.listTickets));
r.post('/tickets/:id/replies', auth, wrap(X.replyTicket));
r.patch('/tickets/:id/status', auth, admin, wrap(X.setTicketStatus));
// calendar, search, teacher extras
r.get('/calendar', auth, wrap(X.calendar));
r.get('/search', auth, wrap(X.search));
r.get('/teacher/students', auth, teacher, wrap(X.myStudents));
r.get('/teacher/report', auth, teacher, wrap(X.teacherReport));
// admin evaluations oversight
r.get('/admin/evaluations', auth, admin, wrap(X.adminEvaluations));
r.patch('/admin/evaluations/:id/published', auth, admin, wrap(X.adminSetPublished));
// sessions
r.get('/auth/sessions', auth, wrap(A.listSessions));
r.delete('/auth/sessions/:id', auth, wrap(A.revokeSession));
r.post('/auth/sessions/logout-others', auth, wrap(A.logoutOthers));
// tasks, chat, notifications
r.get('/projects/:id/tasks', auth, wrap(C.listTasks));
r.post('/projects/:id/tasks', auth, wrap(C.createTask));
r.patch('/tasks/:taskId', auth, wrap(C.updateTask));
r.delete('/tasks/:taskId', auth, wrap(C.deleteTask));
r.get('/projects/:id/messages', auth, wrap(C.listMessages));
r.post('/projects/:id/messages', auth, wrap(C.postMessage));
r.get('/notifications', auth, wrap(C.listNotifications));
r.post('/notifications/read-all', auth, wrap(C.readAllNotifications));
r.patch('/notifications/:id/read', auth, wrap(C.readNotification));
export default r;
