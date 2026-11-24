import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../../hooks/useFetch';
import { Card, Loading, Empty, Stat } from '../../components/UI';
const COLORS = ['#7C3AED', '#A855F7', '#D946EF', '#38BDF8', '#22C55E', '#F59E0B', '#EF4444', '#94A3B8'];
const Pie2 = ({ rows }) => !rows.length ? <Empty>No data yet.</Empty> : <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>{rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
export default function AdminReports() {
  const { data: d, loading } = useFetch('/admin/stats');
  if (loading) return <Loading />;
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Reports & Analytics</h1><div className="grid gap-4 sm:grid-cols-3"><Stat label="Total Users" value={d.users} /><Stat label="Total Projects" value={d.projects} /><Stat label="Total Evaluations" value={d.evaluations} /></div>
    <div className="grid gap-5 md:grid-cols-2"><Card title="User Analytics"><Pie2 rows={d.byRole.map((x) => ({ name: x._id, value: x.n }))} /></Card><Card title="Project Status Distribution"><Pie2 rows={d.byStatus.map((x) => ({ name: x._id.replace('_', ' '), value: x.n }))} /></Card></div></div>);
}
