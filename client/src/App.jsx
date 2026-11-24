import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { Protected } from './routes/Guards';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import { NotFound, Forbidden } from './pages/public/ErrorPages';
import StudentDashboard from './pages/student/Dashboard';
import MyProjects from './pages/student/MyProjects';
import CreateProject from './pages/student/CreateProject';
import ProjectDetails from './pages/student/ProjectDetails';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherProjects from './pages/teacher/Projects';
import Reviews from './pages/teacher/Reviews';
import ReviewProject from './pages/teacher/ReviewProject';
import { AdminDashboard, AdminUsers, AdminProjects } from './pages/admin/AdminPages';
import Settings from './pages/shared/Settings';
import Announcements from './pages/shared/Announcements';
import Support from './pages/shared/Support';
import Calendar from './pages/shared/Calendar';
import Search from './pages/shared/Search';
import { Help, About, Legal } from './pages/shared/Info';
import TeacherStudents from './pages/teacher/Students';
import TeacherReports from './pages/teacher/Reports';
import AdminEvaluations from './pages/admin/AdminEvaluations';
import AdminReports from './pages/admin/AdminReports';
import Notifications from './pages/shared/Notifications';
import Sessions from './pages/shared/Sessions';
import Files from './pages/shared/Files';
import TaskBoard from './pages/project/TaskBoard';
import Chat from './pages/project/Chat';
import ProjectReport from './pages/project/ProjectReport';
import SystemStatus from './pages/admin/SystemStatus';
import Backups from './pages/admin/Backups';
import AuditCompliance from './pages/admin/AuditCompliance';
const shared = [['settings', <Settings />], ['announcements', <Announcements />], ['support', <Support />], ['calendar', <Calendar />], ['search', <Search />], ['help', <Help />], ['about', <About />], ['legal', <Legal />], ['notifications', <Notifications />], ['sessions', <Sessions />], ['files', <Files />], ['projects/:id/tasks', <TaskBoard />], ['projects/:id/chat', <Chat />], ['projects/:id/report', <ProjectReport />]].map(([p, el]) => <Route key={p} path={p} element={el} />);
const shell = (role) => <Protected role={role}><AppLayout /></Protected>;
export default function App() {
  return (<Routes>
    <Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/privacy" element={<div className="mx-auto max-w-3xl p-8"><Legal /></div>} /><Route path="/forbidden" element={<Forbidden />} />
    <Route path="/student" element={shell('student')}><Route index element={<StudentDashboard />} /><Route path="projects" element={<MyProjects />} /><Route path="projects/:id" element={<ProjectDetails />} /><Route path="create" element={<CreateProject />} />{shared}</Route>
    <Route path="/teacher" element={shell('teacher')}><Route index element={<TeacherDashboard />} /><Route path="projects" element={<TeacherProjects />} /><Route path="projects/:id" element={<ReviewProject />} /><Route path="reviews" element={<Reviews />} /><Route path="students" element={<TeacherStudents />} /><Route path="reports" element={<TeacherReports />} />{shared}</Route>
    <Route path="/admin" element={shell('admin')}><Route index element={<AdminDashboard />} /><Route path="users" element={<AdminUsers />} /><Route path="projects" element={<AdminProjects />} /><Route path="audit" element={<AuditCompliance />} /><Route path="system" element={<SystemStatus />} /><Route path="backups" element={<Backups />} /><Route path="evaluations" element={<AdminEvaluations />} /><Route path="reports" element={<AdminReports />} />{shared}</Route>
    <Route path="*" element={<NotFound />} /></Routes>);
}
