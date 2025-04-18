
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  PackageIcon, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Receipt,
  Warehouse,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { signOut, isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
      show: true,
    },
    {
      name: 'Transaksi',
      href: '/pos',
      icon: ShoppingCart,
      active: pathname === '/pos',
      show: true,
    },
    {
      name: 'Produk',
      href: '/products',
      icon: PackageIcon,
      active: pathname.startsWith('/products'),
      show: true,
    },
    {
      name: 'Inventori',
      href: '/inventory',
      icon: Warehouse,
      active: pathname.startsWith('/inventory'),
      show: true,
    },
    {
      name: 'Riwayat Transaksi',
      href: '/transactions',
      icon: Receipt,
      active: pathname.startsWith('/transactions'),
      show: true,
    },
    {
      name: 'Laporan',
      href: '/reports',
      icon: BarChart3,
      active: pathname.startsWith('/reports'),
      show: true,
    },
    {
      name: 'Pengguna',
      href: '/users',
      icon: Users,
      active: pathname.startsWith('/users'),
      show: isAdmin,
    },
    {
      name: 'Pengaturan',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
      show: true,
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: User,
      active: pathname.startsWith('/profile'),
      show: true,
    },
  ];

  return (
    <>
      <div
        className={cn(
          'h-screen bg-white fixed inset-y-0 left-0 z-20 border-r border-neutral-200 shadow-sm transition-all duration-300 ease-in-out',
          expanded ? 'w-64' : 'w-20'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
          {expanded ? (
            <h1 className="text-xl font-bold text-primary-600">Kasir Pintar</h1>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold">
              K
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
          >
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                )}
              >
                <item.icon size={20} />
                {expanded && <span>{item.name}</span>}
              </Link>
            ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => signOut()}
          >
            <LogOut size={20} className="mr-2" />
            {expanded && <span>Keluar</span>}
          </Button>
        </div>
      </div>

      {/* Main Content Wrapper (to push content to the right) */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          expanded ? 'ml-64' : 'ml-20'
        )}
      />
    </>
  );
};
