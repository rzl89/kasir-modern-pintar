
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Role } from '@/lib/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: Role | null;
  isAdmin: boolean;
  isCashier: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  loading: boolean;
  userLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthProvider initialized');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user role
          const fetchUserRole = async () => {
            try {
              const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              if (!error && data) {
                console.log('User role fetched:', data.role);
                setUserRole(data.role as Role);
              } else {
                console.error('Error or no data in fetchUserRole:', error);
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
            }
          };
          
          fetchUserRole();
        } else {
          setUserRole(null);
        }
        
        setUserLoading(false);
      }
    );

    // Initial session check
    const checkSession = async () => {
      try {
        console.log('Checking initial session');
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          console.log('Session exists, fetching user role');
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          if (!error && userData) {
            console.log('Initial user role:', userData.role);
            setUserRole(userData.role as Role);
          } else {
            console.error('Error or no data in checkSession:', error);
          }
        } else {
          console.log('No session found initially');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setUserLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login gagal',
          description: error.message,
        });
      } else {
        toast({
          title: 'Login berhasil',
          description: 'Selamat datang kembali!',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi kesalahan',
        description: 'Tidak dapat melakukan login. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: Role = 'cashier'): Promise<void> => {
    try {
      setLoading(true);
      
      // Create user in auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Registrasi gagal',
          description: error.message,
        });
        return;
      }
      
      if (data.user) {
        // Create user in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role,
          });
          
        if (profileError) {
          toast({
            variant: 'destructive',
            title: 'Registrasi gagal',
            description: profileError.message,
          });
          return;
        }
        
        toast({
          title: 'Registrasi berhasil',
          description: 'Silakan login dengan akun yang baru dibuat.',
        });
        
        navigate('/login');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi kesalahan',
        description: 'Tidak dapat melakukan registrasi. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: 'Logout berhasil',
        description: 'Anda telah keluar dari sistem.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi kesalahan',
        description: 'Tidak dapat melakukan logout. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Reset password gagal',
          description: error.message,
        });
      } else {
        toast({
          title: 'Reset password link telah dikirim',
          description: 'Silakan cek email Anda.',
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi kesalahan',
        description: 'Tidak dapat melakukan reset password. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Update password gagal',
          description: error.message,
        });
      } else {
        toast({
          title: 'Password berhasil diperbarui',
          description: 'Silakan login dengan password baru Anda.',
        });
        await signOut();
      }
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi kesalahan',
        description: 'Tidak dapat melakukan update password. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === 'admin';
  const isCashier = userRole === 'cashier';

  console.log('Auth state:', { 
    authenticated: !!user, 
    userRole, 
    isAdmin, 
    isCashier,
    userLoading
  });

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        isAdmin,
        isCashier,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        loading,
        userLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
