
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
    // Set initial session
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        // Fetch user role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
        } else if (userData) {
          setUserRole(userData.role as Role);
        }
      }
      
      setUserLoading(false);
    };

    initSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user role
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user role:', error);
          } else if (userData) {
            setUserRole(userData.role as Role);
          }
        } else {
          setUserRole(null);
        }

        setUserLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
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

  const signUp = async (email: string, password: string, fullName: string, role: Role = 'cashier') => {
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
          description: 'Silakan cek email Anda untuk verifikasi.',
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

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
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

  const resetPassword = async (email: string) => {
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

  const updatePassword = async (password: string) => {
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
