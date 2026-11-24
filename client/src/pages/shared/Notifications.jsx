import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Card, Loading, Empty, Stat } from '../../components/UI';
export const roleLink = (l, role) => !l ? null : /^\/(student|teacher|admin)\//.test(l) ? l : `/${role}${l}`;
export default function Notifications() {
  const { user } = useAuth(); const nav = useNavigate(); const [tab, setTab] = useState('all');
  const { data, loading, reload } = useFetch(`/notifications${tab === 'unread' ? '?unread=true' : ''}`);
  const open = async (n) => { if (!n.read) await api.patch(`/notifications/${n._id}/read`); const l = roleLink(n.link, user.role); l ? nav(l) : reload(); };
  const all = async () => { await api.post('/notifications/read-all'); reload(); };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Notifications & Activity Center</h1>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="All notifications" value={data?.total} icon={Bell} /><Stat label="Unread" value={data?.unread} /><Stat label="Read" value={data ? data.total - data.unread : undefined} /></div>
    <Card title="Notifications" action={<button className="btn-primary py-1" onClick={all}>Mark all as read</button>}><div className="mb-3 flex gap-2">{['all', 'unread'].map((t) => <button key={t} className={tab === t ? 'btn-primary py-1' : 'btn-ghost py-1'} onClick={() => setTab(t)}>{t === 'all' ? 'All' : 'Unread'}</button>)}</div>
      {loading ? <Loading /> : !data.notifications.length ? <Empty>You're all caught up.</Empty> : <ul className="space-y-2">{data.notifications.map((n) => <li key={n._id}><button onClick={() => open(n)} className={`flex w-full items-start justify-between rounded-xl border px-4 py-3 text-left text-sm hover:bg-violet/10 ${n.read ? 'border-violet/10 text-slate-400' : 'border-lav/50'}`}><span><b className="block">{n.title}</b>{n.message}</span><span className="ml-3 whitespace-nowrap text-xs text-slate-500">{new Date(n.createdAt).toLocaleString('en-IN')}</span></button></li>)}</ul>}</Card></div>);
}
