import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import ProjectTabs from '../../components/ProjectTabs';
import { Card, Loading, Empty, ErrorBox, Progress, Stat } from '../../components/UI';
import { fmt } from '../../utils/constants';
const COLS = [['todo', 'To do'], ['in_progress', 'In progress'], ['done', 'Done']];
export default function TaskBoard() {
  const { id } = useParams(); const { user } = useAuth(); const canEdit = user.role === 'student';
  const T = useFetch(`/projects/${id}/tasks`), P = useFetch(`/projects/${id}`);
  const [f, setF] = useState({ title: '', assignee: '', deadline: '' }); const [err, setErr] = useState('');
  const run = async (fn) => { setErr(''); try { await fn(); T.reload(); } catch (x) { setErr(errMsg(x)); } };
  if (T.loading) return <Loading />;
  const tasks = T.data?.tasks || [], done = tasks.filter((t) => t.status === 'done').length, pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const move = (t, dir) => { const order = COLS.map((c) => c[0]); const n = order[order.indexOf(t.status) + dir]; if (n) run(() => api.patch(`/tasks/${t._id}`, { status: n })); };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">{P.data?.project.title}</h1><ProjectTabs id={id} /><ErrorBox>{err}</ErrorBox>
    <div className="grid gap-4 sm:grid-cols-4"><Stat label="Total tasks" value={tasks.length} /><Stat label="To do" value={tasks.filter((t) => t.status === 'todo').length} /><Stat label="In progress" value={tasks.filter((t) => t.status === 'in_progress').length} /><Stat label="Done" value={done} /></div>
    <Card title={`Task completion ${pct}%`}><Progress value={pct} /></Card>
    {canEdit && <Card title="Add Task"><div className="grid gap-2 md:grid-cols-4"><input className="input" placeholder="Task title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><select className="input" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })}><option value="">Unassigned</option>{T.data.team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select><input type="date" className="input" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /><button className="btn-primary" disabled={f.title.length < 2} onClick={() => run(async () => { await api.post(`/projects/${id}/tasks`, { title: f.title, assignee: f.assignee || undefined, deadline: f.deadline || undefined }); setF({ title: '', assignee: '', deadline: '' }); })}>Create Task</button></div></Card>}
    <div className="grid gap-4 md:grid-cols-3">{COLS.map(([k, label]) => <Card key={k} title={label}>{!tasks.filter((t) => t.status === k).length ? <Empty>No tasks.</Empty> : <ul className="space-y-2">{tasks.filter((t) => t.status === k).map((t) => <li key={t._id} className="rounded-xl border border-violet/20 p-3 text-sm"><div className="font-medium">{t.title}</div><div className="text-xs text-slate-400">{t.assignee?.name || 'Unassigned'} · {fmt(t.deadline)}</div>{canEdit && <div className="mt-2 flex items-center gap-2">{k !== 'todo' && <button className="btn-ghost py-0.5" onClick={() => move(t, -1)}>←</button>}{k !== 'done' && <button className="btn-ghost py-0.5" onClick={() => move(t, 1)}>→</button>}<button className="ml-auto" onClick={() => run(() => api.delete(`/tasks/${t._id}`))}><Trash2 size={15} /></button></div>}</li>)}</ul>}</Card>)}</div></div>);
}
