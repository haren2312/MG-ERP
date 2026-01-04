import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'cashier' | 'manager' | 'super_admin';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(user.role, requiredRole)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>🚫 Access Denied</h2>
        <p style={{ color: '#7f8c8d' }}>You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className="button button-secondary"
          style={{ marginTop: '20px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper function to check if user role has sufficient permission
function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'cashier': 1,
    'manager': 2,
    'super_admin': 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export default ProtectedRoute;
