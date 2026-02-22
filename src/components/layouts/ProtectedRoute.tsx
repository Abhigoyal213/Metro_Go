import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../atoms/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ADMIN_PHONE = '8107235363';
const ADMIN_NAME = 'Abhishek';

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access
  if (requireAdmin) {
    const isAdmin = user?.phone === ADMIN_PHONE && user?.name === ADMIN_NAME;
    
    if (!isAdmin) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
          <div className="text-center max-w-md">
            <div className="size-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400">
                block
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have permission to access the admin panel.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
