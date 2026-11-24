import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Progress } from '../../components/UI';
const Svc = ({ name, ok, note }) => <div className="glass flex items-center gap-3 p-4">{ok ? <CheckCircle2 className="text-green-400" /> : <XCircle className="text-red-400" />}<div><div className="font-medium">{name}</div><div className="text-xs text-slate-400">{ok ? 'Operational' : note || 'Down'}</div></div></div>;
export default function SystemStatus() {
  const { data: d, loading, reload } = useFetch('/admin/system');
  useEffect(() => { const t = setInterval(reload, 15000); return () => clearInterval(t); }, [reload]);
  if (loading && !d) return <Loading />;
  const all = d.services.api && d.services.database && d.services.fileStorage, mb = (b) => (b / 1048576).toFixed(1), h = Math.floor(d.uptimeSec / 3600), m = Math.floor((d.uptimeSec % 3600) / 60);
  return (<div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-3xl font-bold">System Status & Service Health</h1><button className="btn-ghost" onClick={reload}>Refresh</button></div>
    <Card><div className={`text-2xl font-bold ${all ? 'text-green-400' : 'text-red-400'}`}>{all ? 'All core systems operational' : 'Some services need attention'}</div><div className="text-xs text-slate-400">Checked {new Date(d.checkedAt).toLocaleTimeString('en-IN')} · auto-refreshes every 15 s</div></Card>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Svc name="API Services" ok={d.services.api} /><Svc name="Database" ok={d.services.database} /><Svc name="File Storage" ok={d.services.fileStorage} /><Svc name="Email Service" ok={d.services.email} note="Not configured" /></div>
    <div className="grid gap-5 md:grid-cols-2"><Card title="System Health"><div className="space-y-3 text-sm"><div><div className="flex justify-between"><span>Memory (system)</span><span>{d.memory.usedPct}%</span></div><Progress value={d.memory.usedPct} /></div><div>CPU load (1 min): {d.cpuLoad1m} on {d.cpuCount} cores</div><div>API process memory: {d.memory.processMB} MB</div><div>Database latency: {d.dbLatencyMs} ms</div><div>Uptime: {h}h {m}m · Node {d.node}</div></div></Card>
      <Card title="Storage & Data"><div className="space-y-1 text-sm"><div>Uploaded files: {d.storage.uploadFiles} ({mb(d.storage.uploadsBytes)} MB)</div><div>Backups: {mb(d.storage.backupsBytes)} MB</div><div>Users: {d.counts.users} · Projects: {d.counts.projects}</div></div></Card></div></div>);
}
