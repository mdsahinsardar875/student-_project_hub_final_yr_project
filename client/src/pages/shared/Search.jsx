import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Empty } from '../../components/UI';
export default function Search() {
  const { user } = useAuth(); const [q, setQ] = useState(''); const [res, setRes] = useState(null);
  const go = async (e) => { e.preventDefault(); setRes((await api.get('/search', { params: { q } })).data.results); };
  const link = (r) => r.type === 'project' ? (user.role === 'admin' ? '/admin/projects' : `/${user.role}/projects/${r.id}`) : r.type === 'user' ? '/admin/users' : `/${user.role}/announcements`;
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Global Search</h1><form onSubmit={go} className="flex gap-2"><input className="input" placeholder="Search by project title, user, announcement…" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn-primary">Search</button></form>
    <Card title="Search Results">{res === null ? <Empty>Type at least 2 characters and press Search.</Empty> : !res.length ? <Empty>No results found. Try a different keyword.</Empty> : <ul className="space-y-2 text-sm">{res.map((r) => <li key={r.type + r.id}><Link className="flex justify-between rounded-xl border border-violet/20 px-3 py-2 hover:bg-violet/10" to={link(r)}><span><span className="badge mr-2">{r.type}</span>{r.title}</span><span className="text-slate-400">{r.sub}</span></Link></li>)}</ul>}</Card></div>);
}
