import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Progress, Status } from '../../components/UI';
export default function TeacherStudents() {
  const { data, loading } = useFetch('/teacher/students'); const [q, setQ] = useState(''); const [sel, setSel] = useState(null);
  const list = (data?.students || []).filter((s) => (s.name + s.email + (s.rollNumber || '')).toLowerCase().includes(q.toLowerCase()));
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Student Management</h1><input className="input max-w-sm" placeholder="Search students by name, roll number or email" value={q} onChange={(e) => setQ(e.target.value)} />
    <div className="grid gap-5 lg:grid-cols-3"><Card title={`Student List (${list.length})`} className="lg:col-span-2">{loading ? <Loading /> : !list.length ? <Empty>No students in your projects yet.</Empty> : <table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Name</th><th>Roll</th><th>Department</th><th>Projects</th><th /></tr></thead><tbody>{list.map((s) => <tr key={s.id} className="border-t border-violet/10"><td className="py-2">{s.name}</td><td>{s.rollNumber || '–'}</td><td>{s.department || '–'}</td><td>{s.projects.length}</td><td><button className="btn-ghost py-1" onClick={() => setSel(s)}>View</button></td></tr>)}</tbody></table>}</Card>
      <Card title="Student Details">{!sel ? <Empty>Select a student.</Empty> : <div className="space-y-2 text-sm"><div><b>{sel.name}</b></div><div>{sel.email}</div>{sel.projects.map((p) => <div key={p.id} className="rounded-xl border border-violet/20 p-2"><div className="flex justify-between"><span>{p.title}</span><Status s={p.status} /></div><div className="text-xs text-slate-400">Role: {p.role}</div><Progress value={p.progress} /></div>)}</div>}</Card></div></div>);
}
