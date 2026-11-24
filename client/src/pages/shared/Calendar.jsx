import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty } from '../../components/UI';
import { fmt } from '../../utils/constants';
export default function Calendar() {
  const { data, loading } = useFetch('/calendar'); const [m, setM] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const events = data?.events || [];
  const days = useMemo(() => { const first = m.getDay(), n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(); return [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)]; }, [m]);
  const on = (day) => events.filter((e) => { const d = new Date(e.date); return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth() && d.getDate() === day; });
  const upcoming = events.filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).slice(0, 8);
  if (loading) return <Loading />;
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Project Calendar & Deadlines</h1>
    <div className="grid gap-5 lg:grid-cols-3"><Card className="lg:col-span-2" title={m.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} action={<span className="flex gap-2"><button className="btn-ghost py-1" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</button><button className="btn-ghost py-1" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button></span>}>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">{days.map((d, i) => <div key={i} className={`min-h-16 rounded-lg border p-1 text-xs ${d ? 'border-violet/20' : 'border-transparent'}`}>{d}{d && on(d).map((e, j) => <div key={j} title={e.title} className={`mt-1 truncate rounded px-1 ${e.type === 'deadline' ? 'bg-magenta/30' : 'bg-lav/30'}`}>{e.title}</div>)}</div>)}</div></Card>
      <Card title="Upcoming">{!upcoming.length ? <Empty>No upcoming deadlines.</Empty> : <ul className="space-y-2 text-sm">{upcoming.map((e, i) => <li key={i} className="flex justify-between gap-2"><span>{e.title}</span><span className="text-slate-400">{fmt(e.date)}</span></li>)}</ul>}</Card></div></div>);
}
