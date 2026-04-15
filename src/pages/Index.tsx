import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '@/lib/store';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'recepcao') navigate('/recepcao');
      else if (session.role === 'enfermagem') navigate('/enfermagem');
      else navigate('/medico');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default Index;
