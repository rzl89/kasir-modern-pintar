
import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'cashier' | 'any';
}

export const AppLayout = ({ children, requiredRole = 'any' }: AppLayoutProps) => {
  const { user, userRole, userLoading, isAdmin, isCashier } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AppLayout mounted with requiredRole:', requiredRole);
    console.log('Current user role:', userRole);
  }, [requiredRole, userRole]);

  // Show loading state when checking authentication
  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check for role-based access
  if (requiredRole !== 'any') {
    console.log('Checking role-based access:', { requiredRole, userRole, isAdmin, isCashier });
    
    if (
      (requiredRole === 'admin' && !isAdmin) ||
      (requiredRole === 'cashier' && !isCashier && !isAdmin)
    ) {
      console.log('Access denied, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
