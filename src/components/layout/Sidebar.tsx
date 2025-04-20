
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, ShoppingCart, Package, Settings, Users, BarChart, User } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { signOut, loading, user } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-white border-r">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          <Link to="/dashboard" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/dashboard' ? 'bg-gray-100' : ''}`}>
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/pos" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/pos' ? 'bg-gray-100' : ''}`}>
            <ShoppingCart className="h-4 w-4" />
            POS
          </Link>
          <Link to="/products" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/products' ? 'bg-gray-100' : ''}`}>
            <Package className="h-4 w-4" />
            Produk
          </Link>
          <Link to="/inventory" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/inventory' ? 'bg-gray-100' : ''}`}>
            <Package className="h-4 w-4" />
            Inventory
          </Link>
          <Link to="/transactions" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/transactions' ? 'bg-gray-100' : ''}`}>
            <ShoppingCart className="h-4 w-4" />
            Transaksi
          </Link>
          <Link to="/reports" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/reports' ? 'bg-gray-100' : ''}`}>
            <BarChart className="h-4 w-4" />
            Laporan
          </Link>
          <Link to="/users" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/users' ? 'bg-gray-100' : ''}`}>
            <Users className="h-4 w-4" />
            Pengguna
          </Link>
          <Link to="/profile" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/profile' ? 'bg-gray-100' : ''}`}>
            <User className="h-4 w-4" />
            Profil
          </Link>
          <Link to="/settings" className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-gray-100 ${location.pathname === '/settings' ? 'bg-gray-100' : ''}`}>
            <Settings className="h-4 w-4" />
            Pengaturan
          </Link>
        </nav>
      </div>
      {user && (
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={signOut}
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      )}
    </div>
  );
};
