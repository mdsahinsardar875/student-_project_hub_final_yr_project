import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Stat } from '../../components/UI';
export default function AuditCompliance() {
  const [f, setF] = useState({ module: '', from: '', to: '' }); const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const L = useFetch(`/admin/audit-logs?${qs}`), S = useFetch('/admin/audit-summary');
  const csv = async () => { const r = await api.get(`/admin/audit-logs?${qs}&format=csv`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = 'audit-log.csv'; a.click(); };
  const s = S.data;
  return (<div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Platform Audit & Activity Logs</h1><button className="btn-primary" onClick={csv}>Export CSV</button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Total audit records" value={s?.total} /><Stat label="Successful logins" value={s?.loginOk} /><Stat label="Failed logins" value={s?.loginFailed} /><Stat label="Admin actions" value={s?.privileged} /></div>
    <Card title="Audit Activity (last 14 days)">{!s?.trend.length ? <Empty>No activity recorded yet.</Empty> : <ResponsiveContainer width="100%" height={200}><AreaChart data={s.trend}><XAxis dataKey="day" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip /><Area dataKey="count" stroke="#A855F7" fill="#7C3AED" fillOpacity={0.4} /></AreaChart></ResponsiveContainer>}</Card>
    <Card title="Audit Records"><div className="mb-3 flex flex-wrap gap-2"><select className="input max-w-xs" value={f.module} onChange={(e) => setF({ ...f, module: e.target.value })}><option value="">All modules</option>{['auth', 'project', 'user', 'admin'].map((m) => <option key={m}>{m}</option>)}</select><input type="date" className="input max-w-xs" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /><input type="date" className="input max-w-xs" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
      {L.loading ? <Loading /> : !L.data.logs.length ? <Empty>No records match.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Time</th><th>User</th><th>Activity</th><th>Target</th></tr></thead><tbody>{L.data.logs.map((l) => <tr key={l._id} className="border-t border-violet/10"><td className="py-1">{new Date(l.createdAt).toLocaleString('en-IN')}</td><td>{l.actor?.name || 'system'}</td><td>{l.action}</td><td className="max-w-xs truncate">{l.target}</td></tr>)}</tbody></table>}</Card></div>);
}
