
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'cashier' | 'any';
}

export const AppLayout = ({ children, requiredRole = 'any' }: AppLayoutProps) => {
  const { user, userRole, userLoading } = useAuth();

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for role-based access
  if (requiredRole !== 'any') {
    if (
      (requiredRole === 'admin' && userRole !== 'admin') ||
      (requiredRole === 'cashier' && userRole !== 'cashier' && userRole !== 'admin')
    ) {
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
