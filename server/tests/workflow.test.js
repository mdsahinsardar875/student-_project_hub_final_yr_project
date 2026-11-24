import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import User from '../src/models/User.js';

let mongod, app, S = {}, T = {}, A = {}, projectId, docId, subId;
const auth = (t) => ({ Authorization: `Bearer ${t}` });
beforeAll(async () => {
  process.env.NODE_ENV = 'test'; process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
  await User.create({ name: 'Admin', email: 'admin@test.dev', role: 'admin', passwordHash: await bcrypt.hash('Admin12345', 4) });
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });

describe('core workflow', () => {
  it('registers a student and a teacher', async () => {
    let r = await request(app).post('/api/auth/register').send({ role: 'student', name: 'Test Student', email: 's@test.dev', password: 'Passw0rd!', department: 'CSE', rollNumber: 'R1' });
    expect(r.status).toBe(201); S.token = r.body.token;
    r = await request(app).post('/api/auth/register').send({ role: 'teacher', name: 'Test Teacher', email: 't@test.dev', password: 'Passw0rd!', department: 'CSE' });
    expect(r.status).toBe(201); T.token = r.body.token; T.id = r.body.user.id;
  });
  it('rejects admin self-registration and invalid login', async () => {
    expect((await request(app).post('/api/auth/register').send({ role: 'admin', name: 'x', email: 'a@x.dev', password: 'Passw0rd!', department: 'CSE' })).status).toBe(400);
    expect((await request(app).post('/api/auth/login').send({ email: 's@test.dev', password: 'wrong' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'Admin12345' })).status).toBe(200);
  });
  it('student creates project with teacher assigned; teacher cannot create', async () => {
    const body = { title: 'Smart Campus Portal', description: 'A portal for campus services.', department: 'CSE', category: 'Web', teacher: T.id, milestones: [{ title: 'Design' }] };
    expect((await request(app).post('/api/projects').set(auth(T.token)).send(body)).status).toBe(403);
    const r = await request(app).post('/api/projects').set(auth(S.token)).send(body);
    expect(r.status).toBe(201); projectId = r.body.project._id;
  });
  it('uploads, lists and downloads a document', async () => {
    let r = await request(app).post(`/api/projects/${projectId}/documents`).set(auth(S.token)).attach('files', Buffer.from('hello'), 'report.pdf');
    expect(r.status).toBe(201); docId = r.body.documents[0]._id;
    r = await request(app).get(`/api/documents/${docId}/download`).set(auth(T.token));
    expect(r.status).toBe(200);
    r = await request(app).post(`/api/projects/${projectId}/documents`).set(auth(S.token)).attach('files', Buffer.from('x'), 'evil.exe');
    expect(r.status).toBe(400);
  });
  it('posts progress and submits', async () => {
    expect((await request(app).post(`/api/projects/${projectId}/progress`).set(auth(S.token)).send({ percent: 40, note: 'half' })).status).toBe(201);
    const r = await request(app).post(`/api/projects/${projectId}/submissions`).set(auth(S.token)).send({ documentIds: [docId] });
    expect(r.status).toBe(201); subId = r.body.submission._id;
  });
  it('teacher requests revision, then approves', async () => {
    let r = await request(app).post(`/api/submissions/${subId}/review`).set(auth(T.token)).send({ decision: 'request_revision', comment: 'Improve testing' });
    expect(r.body.projectStatus).toBe('needs_revision');
    r = await request(app).post(`/api/submissions/${subId}/review`).set(auth(T.token)).send({ decision: 'approve' });
    expect(r.body.projectStatus).toBe('approved');
  });
  it('blocks unrelated users from the project', async () => {
    const o = await request(app).post('/api/auth/register').send({ role: 'student', name: 'Other', email: 'o@test.dev', password: 'Passw0rd!', department: 'CSE', rollNumber: 'R2' });
    expect((await request(app).get(`/api/projects/${projectId}`).set(auth(o.body.token))).status).toBe(403);
  });
  it('evaluation hidden until published, then visible to student', async () => {
    const criteria = [{ name: 'Documentation', max: 20, obtained: 18 }, { name: 'Implementation', max: 30, obtained: 26 }];
    let r = await request(app).put(`/api/projects/${projectId}/evaluation`).set(auth(T.token)).send({ criteria, remarks: 'Good' });
    expect(r.status).toBe(201); expect(r.body.evaluation.grade).toBe('A');
    r = await request(app).get(`/api/projects/${projectId}/evaluation`).set(auth(S.token));
    expect(r.body.evaluation).toBeNull();
    await request(app).put(`/api/projects/${projectId}/evaluation`).set(auth(T.token)).send({ criteria, publish: true });
    r = await request(app).get(`/api/projects/${projectId}/evaluation`).set(auth(S.token));
    expect(r.body.evaluation.total).toBe(44);
  });
  it('admin routes are admin-only', async () => {
    expect((await request(app).get('/api/admin/users').set(auth(S.token))).status).toBe(403);
    const l = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'Admin12345' });
    expect((await request(app).get('/api/admin/users').set(auth(l.body.token))).status).toBe(200);
  });
});

describe('announcements, tickets, search', () => {
  it('teacher posts announcement; student sees it; student cannot post', async () => {
    expect((await request(app).post('/api/announcements').set(auth(S.token)).send({ title: 'Hi there', message: 'abc' })).status).toBe(403);
    expect((await request(app).post('/api/announcements').set(auth(T.token)).send({ title: 'Viva dates', message: 'Next week', audience: 'students' })).status).toBe(201);
    const r = await request(app).get('/api/announcements').set(auth(S.token));
    expect(r.body.announcements.some((a) => a.title === 'Viva dates')).toBe(true);
  });
  it('student opens ticket, admin replies and resolves', async () => {
    let r = await request(app).post('/api/tickets').set(auth(S.token)).send({ subject: 'Cannot upload', description: 'Error on upload' });
    expect(r.status).toBe(201); const id = r.body.ticket._id;
    const l = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'Admin12345' });
    expect((await request(app).post(`/api/tickets/${id}/replies`).set(auth(l.body.token)).send({ text: 'Looking' })).status).toBe(200);
    expect((await request(app).patch(`/api/tickets/${id}/status`).set(auth(S.token)).send({ status: 'resolved' })).status).toBe(403);
    expect((await request(app).patch(`/api/tickets/${id}/status`).set(auth(l.body.token)).send({ status: 'resolved' })).body.ticket.status).toBe('resolved');
  });
  it('search, calendar and teacher students work', async () => {
    expect((await request(app).get('/api/search?q=Smart').set(auth(S.token))).body.results.length).toBeGreaterThan(0);
    expect((await request(app).get('/api/calendar').set(auth(S.token))).status).toBe(200);
    expect((await request(app).get('/api/teacher/students').set(auth(T.token))).body.students.length).toBeGreaterThan(0);
    expect((await request(app).get('/api/teacher/report').set(auth(T.token))).body.totalProjects).toBe(1);
  });
});

describe('notifications, tasks, chat, sessions, backups', () => {
  it('teacher gets a notification when a student submits', async () => {
    const r = await request(app).get('/api/notifications').set(auth(T.token));
    expect(r.body.notifications.some((n) => n.type === 'submission')).toBe(true);
    expect((await request(app).post('/api/notifications/read-all').set(auth(T.token))).status).toBe(200);
  });
  it('tasks: student creates and moves; teacher cannot edit', async () => {
    let r = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(S.token)).send({ title: 'Write report' });
    expect(r.status).toBe(201); const id = r.body.task._id;
    expect((await request(app).patch(`/api/tasks/${id}`).set(auth(S.token)).send({ status: 'done' })).body.task.status).toBe('done');
    expect((await request(app).patch(`/api/tasks/${id}`).set(auth(T.token)).send({ status: 'todo' })).status).toBe(403);
  });
  it('chat: members and teacher can post, outsiders cannot', async () => {
    expect((await request(app).post(`/api/projects/${projectId}/messages`).set(auth(S.token)).send({ text: 'hello' })).status).toBe(201);
    expect((await request(app).post(`/api/projects/${projectId}/messages`).set(auth(T.token)).send({ text: 'hi' })).status).toBe(201);
    const o = await request(app).post('/api/auth/register').send({ role: 'student', name: 'Out', email: 'out@test.dev', password: 'Passw0rd!', department: 'CSE', rollNumber: 'R9' });
    expect((await request(app).get(`/api/projects/${projectId}/messages`).set(auth(o.body.token))).status).toBe(403);
  });
  it('revoked session stops working', async () => {
    const a = await request(app).post('/api/auth/login').send({ email: 's@test.dev', password: 'Passw0rd!' });
    const b = await request(app).post('/api/auth/login').send({ email: 's@test.dev', password: 'Passw0rd!' });
    const list = await request(app).get('/api/auth/sessions').set(auth(a.body.token));
    const other = list.body.sessions.find((x) => !x.current);
    expect((await request(app).delete(`/api/auth/sessions/${other.id}`).set(auth(a.body.token))).status).toBe(200);
    await request(app).post('/api/auth/sessions/logout-others').set(auth(a.body.token));
    expect((await request(app).get('/api/auth/me').set(auth(b.body.token))).status).toBe(401);
  });
  it('admin: system status, backup, audit; students blocked', async () => {
    const l = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'Admin12345' }); const A = l.body.token;
    expect((await request(app).get('/api/admin/system').set(auth(A))).body.services.database).toBe(true);
    const b = await request(app).post('/api/admin/backups').set(auth(A)); expect(b.status).toBe(201);
    expect((await request(app).get('/api/admin/backups').set(auth(A))).body.backups.length).toBeGreaterThan(0);
    await request(app).delete(`/api/admin/backups/${b.body.name}`).set(auth(A));
    expect((await request(app).get('/api/admin/audit-summary').set(auth(A))).body.loginOk).toBeGreaterThan(0);
    expect((await request(app).get('/api/admin/system').set(auth(S.token))).status).toBe(403);
  });
});
