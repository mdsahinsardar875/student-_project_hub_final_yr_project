import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, ErrorBox, Field } from '../../components/UI';
export default function Settings() {
  const { user } = useAuth(); const [f, setF] = useState({ name: user.name, phone: user.phone || '', department: user.department || '' }); const [pw, setPw] = useState({ currentPassword: '', newPassword: '' }); const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  const save = async (e) => { e.preventDefault(); setErr(''); setOk(''); try { await api.patch('/auth/profile', f); setOk('Profile saved. Refresh to see the new name in the header.'); } catch (x) { setErr(errMsg(x)); } };
  const change = async (e) => { e.preventDefault(); setErr(''); setOk(''); try { await api.post('/auth/change-password', pw); setOk('Password changed.'); setPw({ currentPassword: '', newPassword: '' }); } catch (x) { setErr(errMsg(x)); } };
  return (<div className="space-y-5"><h1 className="text-3xl font-bold">Settings & Profile</h1><ErrorBox>{err}</ErrorBox>{ok && <p className="text-sm text-green-300">{ok}</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Personal Information"><form onSubmit={save} className="space-y-3">
        <Field label="Full Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email (cannot be changed)"><input className="input opacity-60" value={user.email} disabled /></Field>
        {user.rollNumber && <Field label="Roll Number"><input className="input opacity-60" value={user.rollNumber} disabled /></Field>}
        <Field label="Department"><input className="input" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <button className="btn-primary">Save Changes</button></form></Card>
      <Card title="Change Password"><form onSubmit={change} className="space-y-3">
        <Field label="Current password"><input className="input" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password (8+ chars, letter and digit)"><input className="input" type="password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <button className="btn-primary">Update Password</button></form></Card></div></div>);
}
