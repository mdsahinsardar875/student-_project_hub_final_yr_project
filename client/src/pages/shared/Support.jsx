import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Card, Loading, Empty, ErrorBox, Field, Stat, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function Support() {
  const { user } = useAuth(); const [tab, setTab] = useState(''); const { data, loading, reload } = useFetch(`/tickets${tab ? `?status=${tab}` : ''}`);
  const [f, setF] = useState({ subject: '', category: 'Account', priority: 'medium', description: '' }); const [err, setErr] = useState(''); const [reply, setReply] = useState({});
  const create = async (e) => { e.preventDefault(); setErr(''); try { await api.post('/tickets', f); setF({ ...f, subject: '', description: '' }); reload(); } catch (x) { setErr(errMsg(x)); } };
  const send = async (id) => { if (!reply[id]) return; await api.post(`/tickets/${id}/replies`, { text: reply[id] }); setReply({ ...reply, [id]: '' }); reload(); };
  const status = async (id, s) => { await api.patch(`/tickets/${id}/status`, { status: s }); reload(); };
  const t = data?.tickets || [];
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">{user.role === 'admin' ? 'Help, Support & Issue Management' : 'Support Tickets'}</h1>
    <div className="grid gap-4 sm:grid-cols-4"><Stat label="Total" value={t.length} /><Stat label="Open" value={t.filter((x) => x.status === 'open').length} /><Stat label="In progress" value={t.filter((x) => x.status === 'in_progress').length} /><Stat label="Resolved" value={t.filter((x) => x.status === 'resolved').length} /></div>
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Create Support Ticket"><form onSubmit={create} className="space-y-3"><ErrorBox>{err}</ErrorBox>
        <Field label="Subject *"><input className="input" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['Account', 'Project', 'Evaluation', 'Technical', 'Other'].map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Priority"><select className="input" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{['low', 'medium', 'high'].map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Description *"><textarea className="input h-24" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field><button className="btn-primary w-full">Send Support Request</button></form></Card>
      <Card title="Tickets" className="lg:col-span-2"><div className="mb-3 flex flex-wrap gap-2">{[['', 'All'], ['open', 'Open'], ['in_progress', 'In progress'], ['resolved', 'Resolved'], ['closed', 'Closed']].map(([k, l]) => <button key={k} className={tab === k ? 'btn-primary py-1' : 'btn-ghost py-1'} onClick={() => setTab(k)}>{l}</button>)}</div>
        {loading ? <Loading /> : !t.length ? <Empty>No support tickets found.</Empty> : <ul className="space-y-3">{t.map((x) => <li key={x._id} className="rounded-xl border border-violet/20 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><b>{x.subject}</b><span className="flex gap-2"><span className="badge">{x.priority}</span><Status s={x.status} /></span></div><div className="text-xs text-slate-500">{x.category} · {fmt(x.createdAt)}{user.role === 'admin' && ` · ${x.createdBy?.name}`}</div><p className="mt-1">{x.description}</p>
          {x.replies.map((r, i) => <div key={i} className="mt-2 rounded-lg bg-violet/10 p-2"><b>{r.by?.name} ({r.by?.role})</b>: {r.text}</div>)}
          <div className="mt-2 flex gap-2"><input className="input py-1" placeholder="Write a reply…" value={reply[x._id] || ''} onChange={(e) => setReply({ ...reply, [x._id]: e.target.value })} /><button className="btn-ghost py-1" onClick={() => send(x._id)}>Reply</button>{user.role === 'admin' && <select className="input w-36 py-1" value={x.status} onChange={(e) => status(x._id, e.target.value)}>{['open', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s}>{s}</option>)}</select>}</div></li>)}</ul>}</Card></div></div>);
}
