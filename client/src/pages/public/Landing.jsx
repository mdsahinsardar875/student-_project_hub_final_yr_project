import { Link } from 'react-router-dom';
export default function Landing() {
  return (<div className="mx-auto max-w-5xl px-6 py-16">
    <header className="mb-20 flex items-center justify-between"><b className="text-lg">Student <span className="text-lav">Project Hub</span></b>
      <div className="flex gap-2"><Link to="/login" className="btn-ghost">Log In</Link><Link to="/register" className="btn-primary">Get Started</Link></div></header>
    <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">Every great <span className="text-lav">project</span><br />starts here.</h1>
    <p className="mt-4 max-w-xl text-slate-300">One organized space to plan, submit, track, and evaluate academic projects.</p>
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {[['Manage Projects', 'Create, update and organize your academic projects in one place.'], ['Track Progress', 'Monitor milestones, submissions and overall progress.'], ['Teacher Feedback', 'Receive feedback, evaluations and marks from your teachers.']].map(([t, d]) => <div key={t} className="glass p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></div>)}
    </div></div>);
}
