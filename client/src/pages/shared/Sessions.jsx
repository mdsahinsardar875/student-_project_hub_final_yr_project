import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { Card, Loading, Empty } from '../../components/UI';
export default function Sessions() {
  const { data, loading, reload } = useFetch('/auth/sessions');
  const revoke = async (id) => { await api.delete(`/auth/sessions/${id}`); reload(); };
  const others = async () => { await api.post('/auth/sessions/logout-others'); reload(); };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Active Sessions</h1><p className="text-slate-400">Devices currently signed in to your account. Sessions also end automatically when the login token expires.</p>
    <Card title="Sessions" action={<button className="btn-primary py-1" onClick={others}>Log out all other devices</button>}>{loading ? <Loading /> : !data.sessions.length ? <Empty>No active sessions.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Device / Browser</th><th>IP</th><th>Last active</th><th /></tr></thead><tbody>{data.sessions.map((s) => <tr key={s.id} className="border-t border-violet/10"><td className="py-2">{s.userAgent || 'Unknown'} {s.current && <span className="badge ml-2">This device</span>}</td><td>{s.ip}</td><td>{new Date(s.lastActive).toLocaleString('en-IN')}</td><td>{!s.current && <button className="btn-ghost py-1" onClick={() => revoke(s.id)}>Revoke</button>}</td></tr>)}</tbody></table>}</Card></div>);
}
