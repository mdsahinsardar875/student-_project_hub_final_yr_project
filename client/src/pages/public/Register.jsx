import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errMsg } from '../../services/api';
import { ErrorBox, Field } from '../../components/UI';
import { DEPARTMENTS } from '../../utils/constants';
export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [role, setRole] = useState('student'); const [f, setF] = useState({ name: '', email: '', rollNumber: '', employeeId: '', department: '', password: '', confirm: '', agree: false }); const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => { e.preventDefault(); if (f.password !== f.confirm) return setErr('Passwords do not match'); if (!f.agree) return setErr('Please accept the Terms & Conditions');
    try { const { confirm, agree, ...body } = f; const u = await register({ ...body, role }); nav(`/${u.role}`); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="grid min-h-screen place-items-center p-4"><form onSubmit={submit} className="glass w-full max-w-2xl space-y-4 p-8">
    <h1 className="text-center text-3xl font-bold">Create an <span className="text-lav">Account</span></h1>
    <div className="grid grid-cols-2 gap-2">{['student', 'teacher'].map((r) => <button type="button" key={r} onClick={() => setRole(r)} className={`btn capitalize ${role === r ? 'btn-primary' : 'btn-ghost'}`}>{r}</button>)}</div>
    <ErrorBox>{err}</ErrorBox>
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Full Name"><input className="input" required value={f.name} onChange={set('name')} /></Field>
      {role === 'student' ? <Field label="Roll Number"><input className="input" required value={f.rollNumber} onChange={set('rollNumber')} /></Field> : <Field label="Employee ID"><input className="input" value={f.employeeId} onChange={set('employeeId')} /></Field>}
      <Field label="Email Address"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
      <Field label="Department"><select className="input" required value={f.department} onChange={set('department')}><option value="">Select your department</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
      <Field label="Create Password"><input className="input" type="password" required value={f.password} onChange={set('password')} /></Field>
      <Field label="Confirm Password"><input className="input" type="password" required value={f.confirm} onChange={set('confirm')} /></Field>
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.agree} onChange={set('agree')} /> I agree to the Terms & Conditions and Privacy Policy</label>
    <p className="rounded-lg bg-violet/10 px-3 py-2 text-xs text-slate-300">Student and Teacher registration only. Admin accounts are managed securely.</p>
    <button className="btn-primary w-full">Create Account →</button>
    <p className="text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="text-lav">Log In</Link></p>
  </form></div>);
}
