import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import api, { errMsg, downloadDoc } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import ProjectTabs from '../../components/ProjectTabs';
import { Card, Loading, ErrorBox, Status, Progress, Empty } from '../../components/UI';
import { fmt } from '../../utils/constants';
const DEFAULT_CRITERIA = [['Documentation', 20], ['Implementation', 30], ['UI / UX Design', 15], ['Functionality', 15], ['Presentation & Viva', 20]];
export default function ReviewProject() {
  const { id } = useParams();
  const P = useFetch(`/projects/${id}`), D = useFetch(`/projects/${id}/documents`), S = useFetch(`/projects/${id}/submissions`), E = useFetch(`/projects/${id}/evaluation`), U = useFetch(`/projects/${id}/progress`);
  const [err, setErr] = useState(''); const [ok, setOk] = useState(''); const [comment, setComment] = useState(''); const [decision, setDecision] = useState('approve');
  const [crit, setCrit] = useState(DEFAULT_CRITERIA.map(([name, max]) => ({ name, max, obtained: 0 }))); const [remarks, setRemarks] = useState('');
  useEffect(() => { const ev = E.data?.evaluation; if (ev) { setCrit(ev.criteria); setRemarks(ev.remarks || ''); } }, [E.data]);
  const run = async (fn, m) => { setErr(''); setOk(''); try { await fn(); setOk(m); [P, S, E].forEach((x) => x.reload()); } catch (x) { setErr(errMsg(x)); } };
  if (P.loading) return <Loading />; if (P.error) return <ErrorBox>{P.error}</ErrorBox>;
  const p = P.data.project, subs = S.data?.submissions || [], latest = subs[0], ev = E.data?.evaluation;
  const total = crit.reduce((a, c) => a + Number(c.obtained || 0), 0), max = crit.reduce((a, c) => a + Number(c.max || 0), 0);
  const body = (publish) => ({ criteria: crit.map((c) => ({ name: c.name, max: Number(c.max), obtained: Number(c.obtained) })), remarks, publish });
  return (<div className="space-y-5"><ProjectTabs id={id} /><h1 className="text-3xl font-bold">{p.title} <Status s={p.status} /></h1><p className="text-slate-400">{p.owner?.name} · {p.department} · Progress {p.progress}%</p><Progress value={p.progress} />
    <ErrorBox>{err}</ErrorBox>{ok && <p className="text-sm text-green-300">{ok}</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Documents">{D.data?.documents.length ? <ul className="space-y-2 text-sm">{D.data.documents.map((d) => <li key={d._id} className="flex justify-between"><span>{d.originalName} <span className="badge">v{d.version}</span></span><button onClick={() => downloadDoc(d)}><Download size={16} /></button></li>)}</ul> : <Empty>No documents.</Empty>}</Card>
      <Card title="Progress history">{U.data?.updates.length ? <ul className="space-y-1 text-sm">{U.data.updates.slice(0, 6).map((u) => <li key={u._id}>{fmt(u.createdAt)} · {u.author?.name} → {u.percent}% {u.note && `— ${u.note}`}</li>)}</ul> : <Empty>No updates.</Empty>}</Card>
      <Card title="Review submission">{!latest ? <Empty>No submission yet.</Empty> : <div className="space-y-3 text-sm"><div>Latest: v{latest.version} <Status s={latest.status} /> · {fmt(latest.createdAt)}</div>
        <div className="flex flex-wrap gap-3">{[['approve', 'Approve'], ['request_revision', 'Request revision'], ['needs_review', 'Needs further review']].map(([k, l]) => <label key={k}><input type="radio" checked={decision === k} onChange={() => setDecision(k)} /> {l}</label>)}</div>
        <textarea className="input h-24" placeholder="Add your feedback, comments, and suggestions here…" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn-primary w-full" onClick={() => run(() => api.post(`/submissions/${latest._id}/review`, { decision, comment }), 'Feedback submitted')}>Submit Feedback</button>
        {subs.flatMap((s) => s.reviews.map((r, i) => <div key={s._id + i} className="rounded-lg bg-violet/10 p-2">v{s.version}: {r.decision.replace('_', ' ')} — {r.comment}</div>))}</div>}</Card>
      <Card title="Evaluation & Marks"><table className="w-full text-sm"><thead className="text-left text-slate-400"><tr><th>Criteria</th><th>Max</th><th>Obtained</th></tr></thead><tbody>{crit.map((c, i) => <tr key={i}><td className="py-1">{c.name}</td><td>{c.max}</td><td><input className="input w-20 py-1" type="number" min="0" max={c.max} value={c.obtained} onChange={(e) => setCrit(crit.map((x, j) => j === i ? { ...x, obtained: e.target.value } : x))} /></td></tr>)}<tr className="border-t border-violet/20 font-bold"><td>Total</td><td>{max}</td><td>{total}</td></tr></tbody></table>
        <textarea className="input mt-3 h-20" placeholder="Add overall remarks, suggestions, or improvement points…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        {ev && <p className="mt-2 text-xs text-slate-400">Saved: {ev.total}/{ev.maxTotal}, grade {ev.grade}, {ev.published ? 'published' : 'not published'}</p>}
        <div className="mt-3 flex gap-2"><button className="btn-ghost flex-1" onClick={() => run(() => api.put(`/projects/${id}/evaluation`, body(false)), 'Evaluation saved')}>Save Evaluation</button><button className="btn-primary flex-1" onClick={() => run(() => api.put(`/projects/${id}/evaluation`, body(true)), 'Result published to student')}>Publish Result</button></div></Card>
    </div></div>);
}
