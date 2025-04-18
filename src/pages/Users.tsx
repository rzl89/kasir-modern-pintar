
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Role } from '@/lib/types';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
  last_sign_in_at?: string;
};

const Users = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('full_name');
  
        if (error) throw error;
        
        setUsers(data as UserProfile[]);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data pengguna',
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [toast]);
  
  const filteredUsers = users.filter(
    (user) => 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <AppLayout requiredRole="admin">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <Button asChild>
          <Link to="/users/add">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Link>
        </Button>
      </div>
  
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <Input
              placeholder="Cari pengguna berdasarkan nama atau email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
  
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Nama</th>
                    <th className="py-3 text-left font-medium">Email</th>
                    <th className="py-3 text-left font-medium">Peran</th>
                    <th className="py-3 text-left font-medium">Terdaftar</th>
                    <th className="py-3 text-left font-medium">Login Terakhir</th>
                    <th className="py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-neutral-50">
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-2">
                          <User size={14} />
                        </div>
                        {user.full_name}
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role === 'admin' ? 'Admin' : 'Kasir'}
                        </Badge>
                      </td>
                      <td className="py-3">{formatDate(user.created_at)}</td>
                      <td className="py-3">{formatDate(user.last_sign_in_at)}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/users/edit/${user.id}`}>
                              <Edit size={16} />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-500">Tidak ada pengguna ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Users;
