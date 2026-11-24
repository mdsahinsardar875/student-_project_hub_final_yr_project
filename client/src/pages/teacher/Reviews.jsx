import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function Reviews() {
  const { data, loading } = useFetch('/submissions/pending');
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Review & Feedback</h1><Card title="Pending submissions">{loading ? <Loading /> : !data.submissions.length ? <Empty>Nothing to review.</Empty> : <ul className="space-y-2 text-sm">{data.submissions.map((s) => <li key={s._id} className="flex items-center justify-between"><span>{s.project.title} · v{s.version} · {fmt(s.createdAt)} <Status s={s.status} /></span><Link className="btn-primary py-1" to={`/teacher/projects/${s.project._id}`}>Open</Link></li>)}</ul>}</Card></div>);
}
