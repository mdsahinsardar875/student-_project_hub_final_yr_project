import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProjectTabs({ id }) {
  const { user } = useAuth(); const base = `/${user.role}/projects/${id}`;
  const tabs = user.role === 'admin' ? [['/report', 'Summary & Report'], ['/tasks', 'Tasks'], ['/chat', 'Team Chat']] : [['', 'Overview'], ['/tasks', 'Milestones & Tasks'], ['/chat', 'Team Chat'], ['/report', 'Summary & Report']];
  return <div className="no-print flex flex-wrap gap-2">{tabs.map(([p, l]) => <NavLink key={p} end to={base + p} className={({ isActive }) => (isActive ? 'btn-primary py-1' : 'btn-ghost py-1')}>{l}</NavLink>)}</div>;
}
