
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { Role } from '@/lib/types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Fetch user role if session exists
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!roleError && userData) {
          setUserRole(userData.role as Role);
        }
      }
      
      return session;
    } catch (error) {
      console.error('Error checking session:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login gagal",
          description: error.message,
        });
        return;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        
        // Fetch user role after successful login
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (!roleError && userData) {
          setUserRole(userData.role as Role);
        }
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error during sign in:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat login",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setUserRole(null);
      
      navigate('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat logout",
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

  return {
    loading,
    user,
    session,
    userRole,
    isAdmin,
    isCashier,
    signIn,
    signUp,
    signOut,
    checkSession,
    resetPassword,
    updatePassword,
  };
};
