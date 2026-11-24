import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Card, Loading, Empty, ErrorBox, Field, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
const blank = { title: '', category: 'General', audience: 'all', message: '', status: 'published', publishAt: '' };
export default function Announcements() {
  const { user } = useAuth(); const canWrite = user.role !== 'student';
  const { data, loading, reload } = useFetch(`/announcements${user.role === 'teacher' ? '?mine=true' : ''}`); const feed = useFetch(user.role === 'teacher' ? '/announcements' : null);
  const [f, setF] = useState(blank); const [editing, setEditing] = useState(null); const [err, setErr] = useState('');
  const save = async (status) => { setErr(''); try { const body = { ...f, status, publishAt: f.publishAt || undefined }; editing ? await api.patch(`/announcements/${editing}`, body) : await api.post('/announcements', body); setF(blank); setEditing(null); reload(); } catch (x) { setErr(errMsg(x)); } };
  const del = async (id) => { if (confirm('Delete this announcement?')) { await api.delete(`/announcements/${id}`); reload(); } };
  const list = user.role === 'teacher' ? data?.announcements : data?.announcements;
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Announcements</h1>
    {canWrite && <Card title={editing ? 'Edit Announcement' : 'Create Announcement'}><ErrorBox>{err}</ErrorBox><div className="grid gap-3 md:grid-cols-3">
      <Field label="Title *"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['General', 'Deadline', 'Evaluation', 'Event', 'Maintenance'].map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Audience"><select className="input" value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}><option value="all">Everyone</option><option value="students">Students</option><option value="teachers">Teachers</option></select></Field>
      <div className="md:col-span-3"><Field label="Message *"><textarea className="input h-24" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field></div>
      <Field label="Schedule for later (optional)"><input type="datetime-local" className="input" value={f.publishAt} onChange={(e) => setF({ ...f, publishAt: e.target.value })} /></Field></div>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => save(f.publishAt ? 'scheduled' : 'published')}>{f.publishAt ? 'Schedule' : 'Publish'}</button><button className="btn-ghost" onClick={() => save('draft')}>Save as Draft</button><button className="btn-ghost" onClick={() => { setF(blank); setEditing(null); }}>Clear</button></div></Card>}
    <Card title={canWrite ? 'Announcements List' : 'Latest announcements'}>{loading ? <Loading /> : !list?.length ? <Empty>No announcements.</Empty> :
      <ul className="space-y-3">{list.map((a) => <li key={a._id} className="rounded-xl border border-violet/20 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b>{a.title}</b><span className="flex items-center gap-2"><span className="badge">{a.category}</span>{canWrite && <Status s={a.status} />}</span></div><p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{a.message}</p><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{a.author?.name} · {fmt(a.createdAt)} · for {a.audience}</span>{canWrite && <span className="flex gap-2"><button className="btn-ghost py-1" onClick={() => { setEditing(a._id); setF({ title: a.title, category: a.category, audience: a.audience, message: a.message, status: a.status, publishAt: '' }); window.scrollTo(0, 0); }}>Edit</button><button className="btn-ghost py-1" onClick={() => api.patch(`/announcements/${a._id}`, { status: 'archived' }).catch(() => {}).then(reload)}>Archive</button><button className="btn-ghost py-1" onClick={() => del(a._id)}>Delete</button></span>}</div></li>)}</ul>}</Card></div>);
}
