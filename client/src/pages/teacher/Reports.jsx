import { FolderKanban, ClipboardList, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useFetch from '../../hooks/useFetch';
import { Card, Stat, Loading, Empty } from '../../components/UI';
const COLORS = ['#7C3AED', '#A855F7', '#D946EF', '#38BDF8', '#22C55E', '#F59E0B', '#EF4444', '#94A3B8'];
export default function TeacherReports() {
  const { data: d, loading } = useFetch('/teacher/report');
  if (loading) return <Loading />;
  const status = Object.entries(d.byStatus).map(([name, value]) => ({ name: name.replace('_', ' '), value })), grades = Object.entries(d.grades).map(([name, value]) => ({ name, value }));
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Reports & Analytics</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Total Projects" value={d.totalProjects} icon={FolderKanban} /><Stat label="Total Submissions" value={d.totalSubmissions} icon={ClipboardList} /><Stat label="Evaluated" value={d.evaluated} icon={Star} /><Stat label="Completion Rate" value={`${d.completionRate}%`} icon={TrendingUp} /></div>
    <div className="grid gap-5 md:grid-cols-2"><Card title="Project Status Distribution">{!status.length ? <Empty>No data yet.</Empty> : <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={status} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>{status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>}</Card>
      <Card title={`Grade distribution${d.averageScorePct != null ? ` · average ${d.averageScorePct}%` : ''}`}>{!grades.length ? <Empty>No evaluations yet.</Empty> : <ResponsiveContainer width="100%" height={240}><BarChart data={grades}><XAxis dataKey="name" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip /><Bar dataKey="value" fill="#A855F7" /></BarChart></ResponsiveContainer>}</Card></div></div>);
}
