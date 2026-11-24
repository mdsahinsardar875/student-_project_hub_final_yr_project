import { FolderKanban, ClipboardList, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { Card, Stat, Loading, Empty, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function TeacherDashboard() {
  const P = useFetch('/projects'), S = useFetch('/submissions/pending'), E = useFetch('/evaluations');
  if (P.loading) return <Loading />;
  const ps = P.data?.projects || [];
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Teacher Dashboard</h1>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Total Projects" value={ps.length} icon={FolderKanban} /><Stat label="Pending Reviews" value={S.data?.submissions.length ?? 0} icon={ClipboardList} /><Stat label="Evaluations" value={E.data?.evaluations.length ?? 0} icon={Star} /></div>
    <Card title="Recent Submissions awaiting review">{!S.data?.submissions.length ? <Empty>No pending submissions.</Empty> : <ul className="space-y-2 text-sm">{S.data.submissions.map((s) => <li key={s._id} className="flex items-center justify-between"><span>{s.project?.title} · v{s.version} · {s.submittedBy?.name} · {fmt(s.createdAt)}</span><Link className="btn-primary py-1" to={`/teacher/projects/${s.project._id}`}>Review</Link></li>)}</ul>}</Card></div>);
}
