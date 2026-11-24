import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Stat, ErrorBox } from '../../components/UI';
export default function Backups() {
  const { data, loading, reload } = useFetch('/admin/backups'); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const mb = (b) => (b / 1048576).toFixed(2);
  const create = async () => { setBusy(true); setErr(''); try { await api.post('/admin/backups'); reload(); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  const dl = async (n) => { const r = await api.get(`/admin/backups/${n}`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = n; a.click(); };
  const del = async (n) => { if (confirm(`Delete ${n}?`)) { await api.delete(`/admin/backups/${n}`); reload(); } };
  const b = data?.backups || [];
  return (<div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Backup & Database Management</h1><button disabled={busy} className="btn-primary" onClick={create}>{busy ? 'Creating…' : '+ Create Backup'}</button></div><ErrorBox>{err}</ErrorBox>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Total backups" value={b.length} /><Stat label="Last backup" value={b[0] ? new Date(b[0].createdAt).toLocaleDateString('en-IN') : 'Never'} /><Stat label="Backup size (MB)" value={mb(data?.totalBytes || 0)} /></div>
    <Card title="Backup History">{loading ? <Loading /> : !b.length ? <Empty>No backups yet.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Name</th><th>Size</th><th>Created</th><th /></tr></thead><tbody>{b.map((x) => <tr key={x.name} className="border-t border-violet/10"><td className="py-2">{x.name}</td><td>{mb(x.size)} MB</td><td>{new Date(x.createdAt).toLocaleString('en-IN')}</td><td className="flex gap-3 py-2"><button onClick={() => dl(x.name)}><Download size={16} /></button><button onClick={() => del(x.name)}><Trash2 size={16} /></button></td></tr>)}</tbody></table>}</Card>
    <Card title="Restoring"><p className="text-sm text-slate-300">Backups are full JSON snapshots of every collection (including password hashes — keep them private). For safety, restore is done from the command line with the API stopped:</p><pre className="mt-2 rounded-lg bg-bg p-3 text-xs">node scripts/restoreBackup.js server/backups/&lt;file&gt;.json --confirm</pre></Card></div>);
}
