import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, FolderKanban, PlusCircle, Users, MessageSquare, Star, LogOut, Shield, Megaphone, CalendarDays, LifeBuoy, HelpCircle, Settings, Search, BarChart3, GraduationCap, Info, Bell, FolderOpen, MonitorSmartphone, Activity, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const COMMON = (r) => [[`/${r}/announcements`, 'Announcements', Megaphone], [`/${r}/notifications`, 'Notifications', Bell], [`/${r}/files`, 'Files & Documents', FolderOpen], [`/${r}/calendar`, 'Calendar', CalendarDays], [`/${r}/search`, 'Search', Search], [`/${r}/support`, 'Support', LifeBuoy], [`/${r}/help`, 'Help Center', HelpCircle], [`/${r}/about`, 'About', Info], [`/${r}/sessions`, 'Active Sessions', MonitorSmartphone], [`/${r}/settings`, 'Settings', Settings]];
const NAV = {
  student: [['/student', 'Dashboard', LayoutDashboard, true], ['/student/projects', 'My Projects', FolderKanban], ['/student/create', 'Create Project', PlusCircle], ...COMMON('student')],
  teacher: [['/teacher', 'Dashboard', LayoutDashboard, true], ['/teacher/projects', 'Projects', FolderKanban], ['/teacher/reviews', 'Review & Feedback', MessageSquare], ['/teacher/students', 'Students', GraduationCap], ['/teacher/reports', 'Reports', BarChart3], ...COMMON('teacher')],
  admin: [['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/users', 'Users Management', Users], ['/admin/projects', 'Projects Management', FolderKanban], ['/admin/evaluations', 'Evaluations', Star], ['/admin/reports', 'Reports & Analytics', BarChart3], ['/admin/audit', 'Audit & Activity Logs', Shield], ['/admin/system', 'System Status', Activity], ['/admin/backups', 'Backup & Database', Database], ...COMMON('admin')],
};
export default function AppLayout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const [unread, setUnread] = useState(0);
  useEffect(() => { const load = () => api.get('/notifications?unread=true').then((r) => setUnread(r.data.unread)).catch(() => {}); load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-violet/20 bg-bg/80 p-4 md:flex">
        <div className="mb-6 text-lg font-bold">Student <span className="text-lav">Project Hub</span></div>
        <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">{user.role} panel</div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV[user.role].map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-gradient-to-r from-lav to-violet text-white' : 'text-slate-300 hover:bg-violet/15'}`}><Icon size={18} />{label}</NavLink>))}
        </nav>
        <button onClick={async () => { await logout(); nav('/login'); }} className="btn-ghost mt-4"><LogOut size={16} />Logout</button>
      </aside>
      <main className="flex-1 p-4 md:p-8"><div className="no-print mb-6 flex items-center justify-between text-sm text-slate-400"><span>Signed in as <b className="text-ink">{user.name}</b></span><Link to={`/${user.role}/notifications`} className="relative"><Bell size={20} />{unread > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-magenta px-1.5 text-xs text-white">{unread}</span>}</Link></div><Outlet /></main>
    </div>);
}
