import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errMsg } from '../../services/api';
import { ErrorBox, Field } from '../../components/UI';
export default function Login() {
  const { login } = useAuth(); const nav = useNavigate(); const [sp] = useSearchParams();
  const [role, setRole] = useState('student'); const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(sp.get('expired') ? 'Your session expired. Please sign in again.' : ''); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const u = await login({ ...f, role }); nav(`/${u.role}`); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (<div className="grid min-h-screen place-items-center p-4"><form onSubmit={submit} className="glass w-full max-w-md space-y-4 p-8">
    <h1 className="text-center text-2xl font-bold">Log In to Student <span className="text-lav">Project Hub</span></h1>
    <div className="grid grid-cols-3 gap-2">{['student', 'teacher', 'admin'].map((r) => <button type="button" key={r} onClick={() => setRole(r)} className={`btn capitalize ${role === r ? 'btn-primary' : 'btn-ghost'}`}>{r}</button>)}</div>
    <ErrorBox>{err}</ErrorBox>
    <Field label="Email Address"><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Enter your email address" /></Field>
    <Field label="Password"><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Enter your password" /></Field>
    <Link to="/forgot-password" className="block text-right text-xs text-lav">Forgot Password?</Link>
    <button disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Log In →'}</button>
    <p className="text-center text-sm text-slate-400">Don't have an account? <Link to="/register" className="text-lav">Create Account</Link></p>
  </form></div>);
}
