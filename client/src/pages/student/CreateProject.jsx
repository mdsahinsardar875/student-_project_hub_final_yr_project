import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Card, ErrorBox, Field } from '../../components/UI';
import { DEPARTMENTS, CATEGORIES, DEFAULT_MILESTONES } from '../../utils/constants';
const STEPS = ['Project Details', 'Team Members', 'Documents', 'Milestones'];
export default function CreateProject() {
  const nav = useNavigate(); const [step, setStep] = useState(0); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [d, setD] = useState({ title: '', department: '', description: '', category: '', teamSize: '', expectedSubmissionDate: '', type: 'academic', teacher: '' });
  const [teachers, setTeachers] = useState([]); const [emails, setEmails] = useState([]); const [em, setEm] = useState(''); const [files, setFiles] = useState([]);
  const [ms, setMs] = useState(DEFAULT_MILESTONES.map((title) => ({ title, dueDate: '' })));
  useEffect(() => { api.get('/teachers', { params: { department: d.department || undefined } }).then((r) => setTeachers(r.data.teachers)).catch(() => {}); }, [d.department]);
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const validStep = () => step !== 0 || (d.title.length >= 3 && d.department && d.description.length >= 10 && d.category);
  const next = () => { if (!validStep()) return setErr('Please complete all required fields (title ≥ 3 chars, description ≥ 10 chars).'); setErr(''); setStep(step + 1); };
  const create = async () => {
    setBusy(true); setErr('');
    try {
      const body = { ...d, teamSize: d.teamSize || undefined, expectedSubmissionDate: d.expectedSubmissionDate || undefined, teacher: d.teacher || undefined, teamEmails: emails, milestones: ms.filter((m) => m.title).map((m) => ({ title: m.title, dueDate: m.dueDate || undefined })) };
      const { data } = await api.post('/projects', body);
      if (files.length) { const fd = new FormData(); files.forEach((f) => fd.append('files', f)); await api.post(`/projects/${data.project._id}/documents`, fd); }
      nav(`/student/projects/${data.project._id}`);
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (<div className="space-y-5"><div><h1 className="text-3xl font-bold">Create New Project</h1><p className="text-slate-400">Add details, set a team, upload documents, and define milestones.</p></div>
    <div className="glass flex flex-wrap gap-2 p-3">{STEPS.map((s, i) => <div key={s} className={`rounded-xl px-4 py-2 text-sm ${i === step ? 'bg-gradient-to-r from-lav to-violet' : i < step ? 'text-lav' : 'text-slate-400'}`}>{i + 1}. {s}{i < step && ' ✓'}</div>)}</div>
    <ErrorBox>{err}</ErrorBox>
    <Card title={STEPS[step]}>
      {step === 0 && <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project Title *"><input className="input" value={d.title} onChange={set('title')} placeholder="e.g. Smart Campus Portal" /></Field>
        <Field label="Department *"><select className="input" value={d.department} onChange={set('department')}><option value="">Select department</option>{DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
        <div className="md:col-span-2"><Field label="Project Description *"><textarea className="input h-28" maxLength={800} value={d.description} onChange={set('description')} placeholder="Describe the objectives, scope, and expected outcomes…" /></Field><div className="text-right text-xs text-slate-500">{d.description.length}/800</div></div>
        <Field label="Project Category *"><select className="input" value={d.category} onChange={set('category')}><option value="">Select category</option>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Team Size"><select className="input" value={d.teamSize} onChange={set('teamSize')}><option value="">Select number of members</option>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></Field>
        <Field label="Expected Submission Date"><input type="date" className="input" value={d.expectedSubmissionDate} onChange={set('expectedSubmissionDate')} /></Field>
        <Field label="Project Type"><div className="flex gap-4 pt-2 text-sm">{['academic', 'research'].map((t) => <label key={t} className="capitalize"><input type="radio" checked={d.type === t} onChange={() => setD({ ...d, type: t })} /> {t} Project</label>)}</div></Field>
        <Field label="Faculty Guide (optional)"><select className="input" value={d.teacher} onChange={set('teacher')}><option value="">Not assigned yet</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
      </div>}
      {step === 1 && <div className="space-y-3"><p className="text-sm text-slate-400">You are added as Lead automatically. Add registered students by email or roll number (2–5 members recommended).</p>
        <div className="flex gap-2"><input className="input" placeholder="Enter student email / roll number" value={em} onChange={(e) => setEm(e.target.value)} /><button type="button" className="btn-primary" onClick={() => { if (em.trim() && !emails.includes(em.trim())) setEmails([...emails, em.trim()]); setEm(''); }}>Add Member</button></div>
        {emails.map((x) => <div key={x} className="flex items-center justify-between rounded-xl border border-violet/20 px-3 py-2 text-sm">{x}<button onClick={() => setEmails(emails.filter((y) => y !== x))} className="btn-ghost py-1">Remove</button></div>)}</div>}
      {step === 2 && <div className="space-y-3"><p className="text-sm text-slate-400">Supported: PDF, DOCX, PPTX, XLSX, ZIP, JPG, PNG · max 50 MB each. Recommended: Project Proposal, Requirement Document.</p>
        <input type="file" multiple onChange={(e) => setFiles([...files, ...e.target.files])} className="input" />
        {files.map((f, i) => <div key={i} className="flex items-center justify-between rounded-xl border border-violet/20 px-3 py-2 text-sm">{f.name} <span className="text-slate-500">{(f.size / 1048576).toFixed(1)} MB</span><button onClick={() => setFiles(files.filter((_, j) => j !== i))}><Trash2 size={16} /></button></div>)}</div>}
      {step === 3 && <div className="space-y-3">{ms.map((m, i) => <div key={i} className="flex gap-2"><input className="input" value={m.title} onChange={(e) => setMs(ms.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /><input type="date" className="input max-w-44" value={m.dueDate} onChange={(e) => setMs(ms.map((x, j) => j === i ? { ...x, dueDate: e.target.value } : x))} /><button onClick={() => setMs(ms.filter((_, j) => j !== i))}><Trash2 size={16} /></button></div>)}
        <button className="btn-ghost" onClick={() => setMs([...ms, { title: '', dueDate: '' }])}><Plus size={16} />Add Milestone</button></div>}
    </Card>
    <div className="flex justify-between"><button className="btn-ghost" onClick={() => nav('/student/projects')}>Cancel</button><div className="flex gap-2">{step > 0 && <button className="btn-ghost" onClick={() => setStep(step - 1)}>Previous</button>}{step < 3 ? <button className="btn-primary" onClick={next}>Next: {STEPS[step + 1]} →</button> : <button disabled={busy} className="btn-primary" onClick={create}>{busy ? 'Creating…' : 'Create Project ✓'}</button>}</div></div></div>);
}
