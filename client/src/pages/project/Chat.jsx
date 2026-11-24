import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProjectTabs from '../../components/ProjectTabs';
import { Card, ErrorBox, Empty } from '../../components/UI';
export default function Chat() {
  const { id } = useParams(); const { user } = useAuth(); const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [err, setErr] = useState(''); const end = useRef();
  const load = () => api.get(`/projects/${id}/messages`).then((r) => setMsgs(r.data.messages)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [id]);
  useEffect(() => end.current?.scrollIntoView({ block: 'nearest' }), [msgs.length]);
  const send = async (e) => { e.preventDefault(); if (!text.trim()) return; try { const r = await api.post(`/projects/${id}/messages`, { text }); setMsgs([...msgs, r.data.message]); setText(''); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Team Collaboration</h1><ProjectTabs id={id} /><ErrorBox>{err}</ErrorBox>
    <Card title="Team Chat (refreshes every 5 seconds)"><div className="h-96 space-y-2 overflow-y-auto pr-2">{!msgs.length ? <Empty>No messages yet. Start a conversation with your team.</Empty> : msgs.map((m) => { const mine = m.sender?._id === user.id; return <div key={m._id} className={`flex ${mine ? 'justify-end' : ''}`}><div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-violet/50' : 'bg-bg/80'}`}><div className="text-xs text-slate-400">{m.sender?.name} ({m.sender?.role}) · {new Date(m.createdAt).toLocaleString('en-IN')}</div><div className="whitespace-pre-wrap">{m.text}</div></div></div>; })}<div ref={end} /></div>
      {user.role !== 'admin' && <form onSubmit={send} className="mt-3 flex gap-2"><input className="input" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} /><button className="btn-primary">Send</button></form>}</Card></div>);
}
