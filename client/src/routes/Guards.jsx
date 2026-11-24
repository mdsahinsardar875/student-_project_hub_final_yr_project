import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-10 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/forbidden" replace />;
  return children;
}
export const home = (u) => `/${u.role}`;
