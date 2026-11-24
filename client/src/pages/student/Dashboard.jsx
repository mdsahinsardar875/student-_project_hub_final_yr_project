import { Link } from 'react-router-dom';
import { FolderKanban, Upload, CheckCircle2, TrendingUp } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Card, Stat, Loading, Empty, Progress, Status } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
export default function Dashboard() {
  const { user } = useAuth(); const { data, loading } = useFetch('/projects');
  const ps = data?.projects || [];
  const active = ps.filter((p) => !['completed', 'archived'].includes(p.status));
  const avg = ps.length ? Math.round(ps.reduce((a, p) => a + p.progress, 0) / ps.length) : 0;
  return (<div className="space-y-6"><div><h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1><p className="text-slate-400">Manage your projects, track progress, submit documents, and view feedback.</p></div>
    {loading ? <Loading /> : <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Projects" value={active.length} icon={FolderKanban} /><Stat label="Needs Revision" value={ps.filter((p) => p.status === 'needs_revision').length} icon={Upload} />
        <Stat label="Completed" value={ps.filter((p) => p.status === 'completed').length} icon={CheckCircle2} /><Stat label="Overall Progress" value={`${avg}%`} icon={TrendingUp} /></div>
      <Card title="Current Projects" action={<Link to="/student/create" className="btn-primary">+ Create New Project</Link>}>
        {ps.length === 0 ? <Empty>No projects yet. Create your first project to get started.</Empty> :
          <div className="grid gap-3 md:grid-cols-2">{ps.slice(0, 4).map((p) => <Link key={p._id} to={`/student/projects/${p._id}`} className="rounded-xl border border-violet/20 p-4 hover:bg-violet/10"><div className="mb-2 flex justify-between"><b>{p.title}</b><Status s={p.status} /></div><Progress value={p.progress} /><div className="mt-1 text-xs text-slate-400">{p.progress}% complete</div></Link>)}</div>}
      </Card></>}</div>);
}
