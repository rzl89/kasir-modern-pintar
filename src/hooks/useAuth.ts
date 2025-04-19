
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error checking session:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
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

  return {
    loading,
    signIn,
    signOut,
    checkSession,
  };
};
