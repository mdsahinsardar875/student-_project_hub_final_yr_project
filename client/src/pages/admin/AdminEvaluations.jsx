import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { Card, Loading, Empty, Status } from '../../components/UI';
export default function AdminEvaluations() {
  const { data, loading, reload } = useFetch('/admin/evaluations');
  const toggle = async (e) => { await api.patch(`/admin/evaluations/${e._id}/published`, { published: !e.published }); reload(); };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Evaluations Management</h1><Card title="Evaluation Records">{loading ? <Loading /> : !data.evaluations.length ? <Empty>No evaluations yet.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Project</th><th>Evaluated by</th><th>Marks</th><th>Grade</th><th>Result</th><th>Published</th><th /></tr></thead><tbody>{data.evaluations.map((e) => <tr key={e._id} className="border-t border-violet/10"><td className="py-2">{e.project?.title}</td><td>{e.evaluator?.name}</td><td>{e.total}/{e.maxTotal}</td><td>{e.grade}</td><td><Status s={e.result} /></td><td>{e.published ? 'Yes' : 'No'}</td><td><button className="btn-ghost py-1" onClick={() => toggle(e)}>{e.published ? 'Unpublish' : 'Publish'}</button></td></tr>)}</tbody></table>}</Card></div>);
}
