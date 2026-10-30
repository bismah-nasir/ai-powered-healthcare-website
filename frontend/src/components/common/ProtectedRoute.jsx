import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rememberPage } from '../../utils/authRedirect';

// Wraps routes that need a signed-in user (and optionally a role).
// Guests go to /login and come back here after signing in.
function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the saved session to be checked before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base/30">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-text-sub font-body">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={rememberPage(location)} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
