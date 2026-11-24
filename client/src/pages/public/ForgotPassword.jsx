import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import { ErrorBox, Field } from '../../components/UI';
export default function ForgotPassword() {
  const [step, setStep] = useState(1); const [email, setEmail] = useState(''); const [token, setToken] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const send = async (e) => { e.preventDefault(); try { const r = await api.post('/auth/forgot-password', { email }); setMsg(r.data.message); if (r.data.devToken) setToken(r.data.devToken); setStep(2); setErr(''); } catch (x) { setErr(errMsg(x)); } };
  const reset = async (e) => { e.preventDefault(); try { await api.post('/auth/reset-password', { token, password }); setMsg('Password updated. You can log in now.'); setStep(3); setErr(''); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="grid min-h-screen place-items-center p-4"><div className="glass w-full max-w-md space-y-4 p-8"><h1 className="text-xl font-bold">Reset password</h1><ErrorBox>{err}</ErrorBox>{msg && <p className="text-sm text-green-300">{msg}</p>}
    {step === 1 && <form onSubmit={send} className="space-y-3"><Field label="Registered email"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><button className="btn-primary w-full">Send reset token</button></form>}
    {step === 2 && <form onSubmit={reset} className="space-y-3"><p className="text-xs text-slate-400">No mail server is configured; in development the token is pre-filled.</p><Field label="Reset token"><input className="input" required value={token} onChange={(e) => setToken(e.target.value)} /></Field><Field label="New password"><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field><button className="btn-primary w-full">Update password</button></form>}
    <Link to="/login" className="block text-center text-sm text-lav">Back to login</Link></div></div>);
}
