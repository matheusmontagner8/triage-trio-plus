import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate('/login', { replace: true }); return; }
    if (role === 'recepcao') navigate('/recepcao', { replace: true });
    else if (role === 'enfermagem') navigate('/enfermagem', { replace: true });
    else if (role === 'medico') navigate('/medico', { replace: true });
    else if (role === 'admin') navigate('/login', { replace: true });
  }, [session, role, loading, navigate]);

  return null;
};

export default Index;
