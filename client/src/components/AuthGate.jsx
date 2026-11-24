import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/** Wraps all app routes — redirects unauthenticated users to /register */
export default function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/register" replace />;

  return <Outlet />;
}
