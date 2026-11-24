import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Trash2 } from 'lucide-react';
import api, { errMsg, downloadDoc } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ProjectTabs from '../../components/ProjectTabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Loading, ErrorBox, Progress, Status, Field, Empty } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function ProjectDetails() {
  const { id } = useParams();
  const P = useFetch(`/projects/${id}`), D = useFetch(`/projects/${id}/documents`), S = useFetch(`/projects/${id}/submissions`), E = useFetch(`/projects/${id}/evaluation`), U = useFetch(`/projects/${id}/progress`);
  const [err, setErr] = useState(''); const [ok, setOk] = useState(''); const [pg, setPg] = useState({ percent: '', note: '', milestoneId: '', milestoneStatus: 'completed' }); const [note, setNote] = useState(''); const [member, setMember] = useState('');
  const run = async (fn, msg) => { setErr(''); setOk(''); try { await fn(); setOk(msg); [P, D, S, E, U].forEach((x) => x.reload()); } catch (x) { setErr(errMsg(x)); } };
  if (P.loading) return <Loading />; if (P.error) return <ErrorBox>{P.error}</ErrorBox>;
  const p = P.data.project, docs = D.data?.documents || [], subs = S.data?.submissions || [], ev = E.data?.evaluation, locked = ['approved', 'completed', 'archived'].includes(p.status);
  const upload = (e) => { const fd = new FormData(); [...e.target.files].forEach((f) => fd.append('files', f)); run(() => api.post(`/projects/${id}/documents`, fd), 'Uploaded'); e.target.value = ''; };
  return (<div className="space-y-5">
    <ProjectTabs id={id} />
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">{p.title} <Status s={p.status} /></h1><p className="text-slate-400">{p.description}</p></div>
      <button disabled={locked || !docs.length} className="btn-primary" onClick={() => run(() => api.post(`/projects/${id}/submissions`, { note, documentIds: docs.map((d) => d._id) }), 'Submitted for review')}>Submit Project</button></div>
    <ErrorBox>{err}</ErrorBox>{ok && <p className="text-sm text-green-300">{ok}</p>}
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Project Information"><dl className="space-y-1 text-sm"><div>Department: {p.department}</div><div>Category: {p.category}</div><div>Type: {p.type}</div><div>Created: {fmt(p.createdAt)}</div><div>Deadline: {fmt(p.expectedSubmissionDate)}</div><div>Faculty guide: {p.teacher?.name || 'Not assigned'}</div></dl></Card>
      <Card title="Progress"><div className="mb-2 text-3xl font-bold">{p.progress}%</div><Progress value={p.progress} />
        <div className="mt-4 space-y-2"><input className="input" type="number" min="0" max="100" placeholder="New progress %" value={pg.percent} onChange={(e) => setPg({ ...pg, percent: e.target.value })} />
          <select className="input" value={pg.milestoneId} onChange={(e) => setPg({ ...pg, milestoneId: e.target.value })}><option value="">No milestone change</option>{p.milestones.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}</select>
          <input className="input" placeholder="Progress note" value={pg.note} onChange={(e) => setPg({ ...pg, note: e.target.value })} />
          <button className="btn-primary w-full" disabled={pg.percent === ''} onClick={() => run(() => api.post(`/projects/${id}/progress`, { percent: pg.percent, note: pg.note, ...(pg.milestoneId && { milestoneId: pg.milestoneId, milestoneStatus: pg.milestoneStatus }) }), 'Progress updated')}>Update Progress</button></div></Card>
      <Card title="Progress over time">{U.data?.updates.length ? <ResponsiveContainer width="100%" height={160}><LineChart data={[...U.data.updates].reverse().map((u) => ({ d: fmt(u.createdAt), p: u.percent }))}><XAxis dataKey="d" hide /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip /><Line dataKey="p" stroke="#A855F7" strokeWidth={2} /></LineChart></ResponsiveContainer> : <Empty>No updates yet.</Empty>}</Card>
      <Card title="Milestones">{p.milestones.length ? <ul className="space-y-2 text-sm">{p.milestones.map((m) => <li key={m._id} className="flex justify-between"><span>{m.title} <span className="text-slate-500">{fmt(m.dueDate)}</span></span><Status s={m.status} /></li>)}</ul> : <Empty>No milestones.</Empty>}</Card>
      <Card title={`Team Members (${p.team.length})`} className="lg:col-span-1">
        <ul className="space-y-2 text-sm">{p.team.map((m) => <li key={m.user._id} className="flex items-center justify-between"><span>{m.user.name}<span className="ml-2 badge">{m.role}</span></span>{String(m.user._id) !== String(p.owner._id) && <button onClick={() => run(() => api.delete(`/projects/${id}/team/${m.user._id}`), 'Member removed')}><Trash2 size={15} /></button>}</li>)}</ul>
        <div className="mt-3 flex gap-2"><input className="input" placeholder="Email / roll number" value={member} onChange={(e) => setMember(e.target.value)} /><button className="btn-primary" onClick={() => run(() => api.post(`/projects/${id}/team`, { identifier: member }), 'Member added')}>Add</button></div></Card>
      <Card title="Documents" className="lg:col-span-2">
        <input type="file" multiple onChange={upload} className="input mb-3" disabled={locked} />
        {docs.length ? <ul className="space-y-2 text-sm">{docs.map((d) => <li key={d._id} className="flex items-center justify-between rounded-xl border border-violet/20 px-3 py-2"><span>{d.originalName} <span className="badge">v{d.version}</span> <span className="text-slate-500">{(d.size / 1048576).toFixed(1)} MB · {fmt(d.createdAt)}</span></span><span className="flex gap-3"><button onClick={() => downloadDoc(d)}><Download size={16} /></button>{!locked && <button onClick={() => run(() => api.delete(`/documents/${d._id}`), 'Deleted')}><Trash2 size={16} /></button>}</span></li>)}</ul> : <Empty>No documents uploaded yet.</Empty>}
        <textarea className="input mt-3" placeholder="Optional note to the reviewer for your next submission" value={note} onChange={(e) => setNote(e.target.value)} /></Card>
      <Card title="Submission History & Feedback" className="lg:col-span-3">{subs.length ? <ul className="space-y-3 text-sm">{subs.map((s) => <li key={s._id} className="rounded-xl border border-violet/20 p-3"><div className="flex justify-between"><b>Submission v{s.version}</b><Status s={s.status} /></div><div className="text-slate-400">{fmt(s.createdAt)}{s.note && ` · ${s.note}`}</div>{s.reviews.map((r, i) => <div key={i} className="mt-2 rounded-lg bg-violet/10 p-2"><b>{r.reviewer?.name}</b> — {r.decision.replace('_', ' ')}{r.comment && <p className="mt-1">{r.comment}</p>}</div>)}</li>)}</ul> : <Empty>Nothing submitted yet.</Empty>}</Card>
      <Card title="Evaluation & Results" className="lg:col-span-3">{ev ? <div><div className="text-4xl font-bold">{ev.total} / {ev.maxTotal} <span className="badge text-lg">Grade {ev.grade}</span> <Status s={ev.result} /></div><ul className="mt-3 space-y-1 text-sm">{ev.criteria.map((c) => <li key={c.name} className="flex justify-between"><span>{c.name}</span><span>{c.obtained} / {c.max}</span></li>)}</ul>{ev.remarks && <p className="mt-3 rounded-lg bg-violet/10 p-3 text-sm">“{ev.remarks}”</p>}</div> : <Empty>{E.data?.pending ? 'Evaluation in progress — results will appear once published.' : 'No evaluation yet.'}</Empty>}</Card>
    </div></div>);
}
