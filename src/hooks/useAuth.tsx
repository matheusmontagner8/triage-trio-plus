import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'recepcao' | 'enfermagem' | 'medico' | 'admin';

interface AuthValue {
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  especialidade: string | null;
  nome: string;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [especialidade, setEspecialidade] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const [{ data: roleRow }, { data: profile }] = await Promise.all([
      supabase.from('user_roles').select('role, especialidade').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('nome').eq('id', userId).maybeSingle(),
    ]);
    setRole((roleRow?.role as AppRole) ?? null);
    setEspecialidade(roleRow?.especialidade ?? null);
    setNome(profile?.nome ?? '');
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session) await loadProfile(data.session.user.id);
    else { setRole(null); setEspecialidade(null); setNome(''); }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        // Defer to avoid recursive supabase calls inside listener
        setTimeout(() => { loadProfile(s.user.id); }, 0);
      } else {
        setRole(null); setEspecialidade(null); setNome('');
      }
    });

    refresh().finally(() => setLoading(false));

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setRole(null); setEspecialidade(null); setNome('');
  };

  return (
    <AuthContext.Provider value={{ session, loading, role, especialidade, nome, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
