import { useParams } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../../hooks/useFetch';
import ProjectTabs from '../../components/ProjectTabs';
import { Card, Loading, ErrorBox, Progress, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function ProjectReport() {
  const { id } = useParams();
  const P = useFetch(`/projects/${id}`), D = useFetch(`/projects/${id}/documents`), S = useFetch(`/projects/${id}/submissions`), E = useFetch(`/projects/${id}/evaluation`), U = useFetch(`/projects/${id}/progress`);
  if (P.loading || D.loading) return <Loading />; if (P.error) return <ErrorBox>{P.error}</ErrorBox>;
  const p = P.data.project, ev = E.data?.evaluation, docs = D.data?.documents || [], subs = S.data?.submissions || [], done = ['approved', 'completed'].includes(p.status);
  const steps = [['Project development', p.progress >= 100 || done], ['Documentation submitted', docs.length > 0 && subs.length > 0], ['Final evaluation', !!ev?.published], ['Approval & finalisation', done]];
  const trend = [...(U.data?.updates || [])].reverse().map((u) => ({ date: fmt(u.createdAt), percent: u.percent }));
  return (<div className="space-y-5"><div className="no-print"><ProjectTabs id={id} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">{p.title} — Final Project Summary <Status s={p.status} /></h1><button className="btn-primary no-print" onClick={() => window.print()}>Print / Save as PDF</button></div>
    <div className="grid gap-5 md:grid-cols-3">
      <Card title="Project Overview"><dl className="space-y-1 text-sm"><div>Department: {p.department}</div><div>Category: {p.category}</div><div>Faculty guide: {p.teacher?.name || 'Not assigned'}</div><div>Created: {fmt(p.createdAt)}</div><div>Deadline: {fmt(p.expectedSubmissionDate)}</div><div>Documents: {docs.length} · Submissions: {subs.length}</div></dl></Card>
      <Card title="Completion Checklist"><ul className="space-y-2 text-sm">{steps.map(([l, ok]) => <li key={l} className="flex items-center gap-2">{ok ? <Check size={16} className="text-green-400" /> : <Circle size={16} className="text-slate-500" />}{l}</li>)}</ul><div className="mt-3"><Progress value={Math.round((steps.filter((s) => s[1]).length / steps.length) * 100)} /></div></Card>
      <Card title="Evaluation Summary">{ev ? <div><div className="text-3xl font-bold">{ev.total} / {ev.maxTotal}</div><div className="mt-1">Grade <b>{ev.grade}</b> · {ev.result}{!ev.published && ' (not yet published)'}</div></div> : <p className="text-sm text-slate-400">No published evaluation yet.</p>}</Card>
      <Card title="Team Contribution" className="md:col-span-2"><table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Member</th><th>Role</th><th>Responsibility</th></tr></thead><tbody>{p.team.map((m) => <tr key={m.user._id} className="border-t border-violet/10"><td className="py-1">{m.user.name}</td><td>{m.role}</td><td>{m.responsibility || '–'}</td></tr>)}</tbody></table></Card>
      <Card title="Milestones"><ul className="space-y-1 text-sm">{p.milestones.map((m) => <li key={m._id} className="flex justify-between"><span>{m.title}</span><Status s={m.status} /></li>)}</ul></Card>
      <Card title="Progress over time" className="md:col-span-3">{trend.length ? <ResponsiveContainer width="100%" height={220}><LineChart data={trend}><XAxis dataKey="date" stroke="#94a3b8" /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="percent" stroke="#A855F7" strokeWidth={2} /></LineChart></ResponsiveContainer> : <p className="text-sm text-slate-400">No progress updates yet.</p>}</Card></div>
    {p.status === 'completed' && ev?.published && <Card title="Certificate of Completion"><div className="py-6 text-center"><div className="text-sm uppercase tracking-widest text-slate-400">Student Project Hub</div><div className="my-3 text-2xl font-bold">Project “{p.title}”</div><p>completed by {p.team.map((m) => m.user.name).join(', ')}</p><p className="mt-2">Final score {ev.total}/{ev.maxTotal} · Grade {ev.grade}</p><p className="mt-1 text-sm text-slate-400">Evaluated by {ev.evaluator?.name} on {fmt(ev.publishedAt)}</p></div></Card>}</div>);
}
