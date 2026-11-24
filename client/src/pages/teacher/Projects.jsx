import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, ErrorBox, Status, Progress } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function TeacherProjects() {
  const [tab, setTab] = useState('mine'); const [err, setErr] = useState('');
  const { data, loading, reload } = useFetch(tab === 'mine' ? '/projects' : '/projects?unassigned=true', [tab]);
  const claim = async (id) => { try { await api.post(`/projects/${id}/claim`); setTab('mine'); reload(); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Project Management</h1><p className="text-slate-400">View, filter, review, and manage student projects.</p>
    <div className="flex gap-2"><button className={tab === 'mine' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('mine')}>My Projects</button><button className={tab === 'open' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('open')}>Unassigned (my department)</button></div>
    <ErrorBox>{err}</ErrorBox>
    <Card>{loading ? <Loading /> : !data?.projects.length ? <Empty>No projects to show.</Empty> :
      <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Project</th><th>Team</th><th>Deadline</th><th>Progress</th><th>Status</th><th /></tr></thead><tbody>
        {data.projects.map((p) => <tr key={p._id} className="border-t border-violet/10"><td className="py-3 font-medium">{p.title}</td><td>{p.owner?.name} +{p.team.length - 1}</td><td>{fmt(p.expectedSubmissionDate)}</td><td className="w-32"><Progress value={p.progress} /></td><td><Status s={p.status} /></td>
          <td className="text-right">{tab === 'mine' ? <Link className="btn-primary py-1" to={`/teacher/projects/${p._id}`}>Review</Link> : <button className="btn-primary py-1" onClick={() => claim(p._id)}>Take as guide</button>}</td></tr>)}</tbody></table>}</Card></div>);
}
