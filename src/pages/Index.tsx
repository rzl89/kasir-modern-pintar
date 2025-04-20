
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading && user) {
      navigate('/dashboard');
    }
  }, [user, userLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Kasir Pintar</h1>
        <p className="text-lg text-gray-600 mb-8">Sistem manajemen toko yang mudah dan efisien</p>
      </div>
      <div className="space-x-4">
        <Button size="lg" onClick={() => navigate('/login')}>
          Masuk
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
          Daftar
        </Button>
      </div>
    </div>
  );
};

export default Index;
