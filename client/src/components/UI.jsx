export const Card = ({ title, action, children, className = '' }) => (
  <section className={`glass p-5 ${className}`}>{(title || action) && <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{title}</h3>{action}</div>}{children}</section>);
export const Stat = ({ label, value, icon: Icon }) => (
  <div className="glass flex items-center gap-3 p-4">{Icon && <div className="rounded-xl bg-violet/25 p-2"><Icon size={20} /></div>}<div><div className="text-2xl font-bold">{value ?? '–'}</div><div className="text-xs text-slate-400">{label}</div></div></div>);
export const Empty = ({ children }) => <p className="py-8 text-center text-sm text-slate-400">{children}</p>;
export const Loading = () => <p className="py-8 text-center text-sm text-slate-400">Loading…</p>;
export const ErrorBox = ({ children }) => children ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{children}</p> : null;
export const Progress = ({ value = 0 }) => <div className="h-2 w-full rounded-full bg-bg"><div className="h-2 rounded-full bg-gradient-to-r from-lav to-magenta" style={{ width: `${value}%` }} /></div>;
export const Status = ({ s }) => <span className="badge">{String(s).replace('_', ' ')}</span>;
export const Field = ({ label, children }) => <label className="block"><span className="label">{label}</span>{children}</label>;
