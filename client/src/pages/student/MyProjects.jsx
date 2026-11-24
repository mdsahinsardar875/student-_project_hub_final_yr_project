import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Progress, Status, ErrorBox } from '../../components/UI';
import { fmt } from '../../utils/constants';
const TABS = [['', 'All Projects'], ['in_progress', 'In Progress'], ['completed', 'Completed'], ['archived', 'Archived']];
export default function MyProjects() {
  const [tab, setTab] = useState(''); const [search, setSearch] = useState('');
  const { data, loading, error } = useFetch(`/projects?${new URLSearchParams({ ...(tab && { status: tab }), ...(search && { search }) })}`);
  return (<div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">My Projects</h1><p className="text-slate-400">View, manage, and track all your academic projects in one place.</p></div><Link to="/student/create" className="btn-primary">+ Create New Project</Link></div>
    <div className="flex flex-wrap gap-2">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={tab === k ? 'btn-primary' : 'btn-ghost'}>{l}</button>)}<input className="input ml-auto max-w-xs" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    <ErrorBox>{error}</ErrorBox>{loading ? <Loading /> : !data?.projects.length ? <Empty>No projects found.</Empty> :
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.projects.map((p) => <Card key={p._id}><div className="mb-1 flex justify-between"><h3 className="font-semibold">{p.title}</h3><Status s={p.status} /></div><p className="line-clamp-2 text-sm text-slate-400">{p.description}</p><div className="my-3"><Progress value={p.progress} /></div><div className="flex justify-between text-xs text-slate-400"><span>Team {p.team.length}</span><span>Due {fmt(p.expectedSubmissionDate)}</span></div><Link to={`/student/projects/${p._id}`} className="btn-primary mt-4 w-full">View Details</Link></Card>)}</div>}</div>);
}
