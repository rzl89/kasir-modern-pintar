
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@/lib/types';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

const formSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(['admin', 'cashier'] as const),
});

type FormValues = z.infer<typeof formSchema>;

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'cashier',
    },
  });

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          const user = data as UserProfile;
          reset({
            fullName: user.full_name,
            email: user.email,
            password: '',
            role: user.role,
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Gagal memuat data pengguna',
          });
          navigate('/users');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, isEditing, reset, navigate, toast]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      if (isEditing) {
        const updateData: Partial<UserProfile> = {
          full_name: data.fullName,
          role: data.role,
        };

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Sukses',
          description: 'Pengguna berhasil diperbarui',
        });
      } else {
        // Create new user
        await signUp(data.email, data.password || 'password123', data.fullName, data.role);
        toast({
          title: 'Sukses',
          description: 'Pengguna baru berhasil ditambahkan',
        });
      }

      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan data pengguna',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout requiredRole="admin">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/users')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Informasi Pengguna' : 'Formulir Pengguna Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input id="fullName" {...register('fullName')} />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register('email')} 
                    disabled={isEditing}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    Peran <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={register('role').value}
                    onValueChange={(value) => setValue('role', value as 'admin' | 'cashier')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="role-admin" />
                      <Label htmlFor="role-admin" className="cursor-pointer">
                        Admin - Akses penuh ke semua fitur
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cashier" id="role-cashier" />
                      <Label htmlFor="role-cashier" className="cursor-pointer">
                        Kasir - Akses terbatas ke transaksi dan laporan
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/users')}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        Menyimpan...
                      </span>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UserForm;
