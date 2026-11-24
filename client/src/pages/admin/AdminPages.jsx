import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, Star } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Card, Stat, Loading, Empty, ErrorBox, Status } from '../../components/UI';
import { fmt } from '../../utils/constants';
export function AdminDashboard() {
  const { data, loading } = useFetch('/admin/stats');
  if (loading) return <Loading />;
  const n = (arr, k) => arr.find((x) => x._id === k)?.n ?? 0;
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Total Users" value={data.users} icon={Users} /><Stat label="Total Projects" value={data.projects} icon={FolderKanban} /><Stat label="Total Evaluations" value={data.evaluations} icon={Star} /></div>
    <div className="grid gap-4 md:grid-cols-2"><Card title="User distribution">{['student', 'teacher', 'admin'].map((r) => <div key={r} className="flex justify-between text-sm capitalize"><span>{r}s</span><b>{n(data.byRole, r)}</b></div>)}</Card>
      <Card title="Project status">{data.byStatus.length ? data.byStatus.map((s) => <div key={s._id} className="flex justify-between text-sm capitalize"><span>{s._id.replace('_', ' ')}</span><b>{s.n}</b></div>) : <Empty>No projects yet.</Empty>}</Card></div></div>);
}
export function AdminUsers() {
  const [role, setRole] = useState(''); const [search, setSearch] = useState(''); const [err, setErr] = useState('');
  const { data, loading, reload } = useFetch(`/admin/users?${new URLSearchParams({ ...(role && { role }), ...(search && { search }) })}`);
  const toggle = async (u) => { try { await api.patch(`/admin/users/${u.id}/active`, { active: !u.active }); reload(); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Users Management</h1>
    <div className="flex flex-wrap gap-2">{[['', 'All'], ['student', 'Students'], ['teacher', 'Teachers'], ['admin', 'Admins']].map(([k, l]) => <button key={k} className={role === k ? 'btn-primary' : 'btn-ghost'} onClick={() => setRole(k)}>{l}</button>)}<input className="input ml-auto max-w-xs" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    <ErrorBox>{err}</ErrorBox><Card>{loading ? <Loading /> : !data.users.length ? <Empty>No users.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th /></tr></thead><tbody>{data.users.map((u) => <tr key={u.id} className="border-t border-violet/10"><td className="py-2">{u.name}</td><td>{u.email}</td><td className="capitalize">{u.role}</td><td>{u.department || '–'}</td><td><Status s={u.active ? 'active' : 'inactive'} /></td><td><button className="btn-ghost py-1" onClick={() => toggle(u)}>{u.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table>}</Card></div>);
}
export function AdminProjects() {
  const { data, loading, reload } = useFetch('/projects'); const T = useFetch('/teachers'); const [err, setErr] = useState('');
  const assign = async (id, teacherId) => { try { await api.post(`/admin/projects/${id}/assign-teacher`, { teacherId }); reload(); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Projects Management</h1><ErrorBox>{err}</ErrorBox><Card>{loading ? <Loading /> : !data.projects.length ? <Empty>No projects.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Title</th><th>Owner</th><th>Department</th><th>Status</th><th>Teacher</th><th /></tr></thead><tbody>{data.projects.map((p) => <tr key={p._id} className="border-t border-violet/10"><td className="py-2">{p.title}</td><td>{p.owner?.name}</td><td>{p.department}</td><td><Status s={p.status} /></td><td><select className="input py-1" value={p.teacher?._id || ''} onChange={(e) => e.target.value && assign(p._id, e.target.value)}><option value="">Unassigned</option>{T.data?.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></td><td><Link className="btn-ghost py-1" to={`/admin/projects/${p._id}/report`}>Summary</Link></td></tr>)}</tbody></table>}</Card></div>);
}
export function AdminAudit() {
  const { data, loading } = useFetch('/admin/audit-logs');
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Activity Logs</h1><Card>{loading ? <Loading /> : !data.logs.length ? <Empty>No activity recorded yet.</Empty> : <ul className="space-y-1 text-sm">{data.logs.map((l) => <li key={l._id}>{fmt(l.createdAt)} · {l.actor?.name || 'system'} · {l.action}</li>)}</ul>}</Card></div>);
}
