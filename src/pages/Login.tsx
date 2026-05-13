import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { ESPECIALIDADES } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, type AppRole } from '@/hooks/useAuth';
import { toast } from 'sonner';

type FuncRole = 'recepcao' | 'enfermagem' | 'medico';

const ROLE_ROUTES: Record<AppRole, string> = {
  recepcao: '/recepcao',
  enfermagem: '/enfermagem',
  medico: '/medico',
  admin: '/',
};

const Login = () => {
  const navigate = useNavigate();
  const { session, role, refresh, signOut } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Setup-admin (only if no admin exists)
  const [precisaSetup, setPrecisaSetup] = useState(false);
  const [setupNome, setSetupNome] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupSenha, setSetupSenha] = useState('');
  const [setupErro, setSetupErro] = useState('');

  // Cadastro funcionário (admin)
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState<FuncRole | ''>('');
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [cadErro, setCadErro] = useState('');
  const [cadOk, setCadOk] = useState('');

  // Detect if admin exists (try a HEAD count via roles RLS lets nothing through if not signed in,
  // so we check via the bootstrap-admin function returning a friendly error).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (session) return;
      // Probe: call bootstrap-admin with empty body to learn if setup is needed.
      try {
        const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
          body: {},
        });
        if (cancelled) return;
        // Returns 400 invalid email if setup still needed; 403 if already set up.
        const msg = (error as any)?.context?.body || (data as any)?.error || (error as any)?.message || '';
        const text = typeof msg === 'string' ? msg : JSON.stringify(msg);
        if (text.includes('Administrador já configurado')) setPrecisaSetup(false);
        else setPrecisaSetup(true);
      } catch {
        // Default: assume setup not needed
        setPrecisaSetup(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  // Redirect after auth + role load
  useEffect(() => {
    if (!session || !role) return;
    if (role !== 'admin') navigate(ROLE_ROUTES[role], { replace: true });
  }, [session, role, navigate]);

  const handleLogin = async () => {
    setErro('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) { setErro('Email ou senha incorretos.'); return; }
    await refresh();
  };

  const handleSetup = async () => {
    setSetupErro('');
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
      body: { email: setupEmail.trim(), password: setupSenha, nome: setupNome.trim() },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      setSetupErro((data as any)?.error || 'Falha ao configurar administrador.');
      return;
    }
    toast.success('Administrador criado! Faça login.');
    setPrecisaSetup(false);
    setEmail(setupEmail.trim());
    setSenha('');
  };

  const handleCadastrar = async () => {
    setCadErro(''); setCadOk('');
    if (!novoRole) { setCadErro('Selecione o setor de trabalho.'); return; }
    if (novoRole === 'medico' && !novaEspecialidade) { setCadErro('Selecione a especialidade do médico.'); return; }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-employee', {
      body: {
        email: novoEmail.trim(),
        password: novaSenha,
        nome: novoNome.trim(),
        role: novoRole,
        especialidade: novoRole === 'medico' ? novaEspecialidade : undefined,
      },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      setCadErro((data as any)?.error || 'Não foi possível cadastrar.');
      return;
    }
    setCadOk(`Funcionário "${novoNome.trim()}" cadastrado!`);
    setNovoNome(''); setNovoEmail(''); setNovaSenha(''); setNovoRole(''); setNovaEspecialidade('');
  };

  // ===== Setup-admin screen =====
  if (precisaSetup && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
          <div className="mb-8"><Logo /></div>
          <h1 className="font-heading text-2xl font-extrabold mb-1.5">Configuração inicial</h1>
          <p className="text-sm text-muted-foreground mb-6">Crie o primeiro administrador do sistema.</p>

          <div className="space-y-3">
            <Field label="Nome" value={setupNome} onChange={setSetupNome} placeholder="Nome do administrador" />
            <Field label="Email" type="email" value={setupEmail} onChange={setSetupEmail} placeholder="admin@clinica.com" />
            <Field label="Senha (mín. 8 caracteres)" type="password" value={setupSenha} onChange={setSetupSenha} placeholder="••••••••" />
            {setupErro && <p className="text-xs text-destructive">{setupErro}</p>}
            <button
              onClick={handleSetup}
              disabled={loading || !setupNome.trim() || !setupEmail.includes('@') || setupSenha.length < 8}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading disabled:opacity-40"
            >
              {loading ? 'Criando…' : 'Criar administrador'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Admin panel =====
  if (session && role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
          <div className="mb-8"><Logo /></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-extrabold mb-1.5">Painel do Administrador</h1>
              <p className="text-sm text-muted-foreground">Cadastre novos funcionários no sistema.</p>
            </div>
            <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5">
              Sair
            </button>
          </div>

          <div className="space-y-3">
            <Field label="Nome completo" value={novoNome} onChange={setNovoNome} placeholder="Ex: Dra. Maria Souza" />
            <Field label="Email" type="email" value={novoEmail} onChange={setNovoEmail} placeholder="maria@clinica.com" />
            <Field label="Senha (mín. 8 caracteres)" type="password" value={novaSenha} onChange={setNovaSenha} placeholder="••••••••" />

            <div>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Setor</label>
              <div className="grid grid-cols-3 gap-2">
                {(['recepcao', 'enfermagem', 'medico'] as FuncRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNovoRole(r)}
                    className={`p-2.5 rounded-lg border text-center text-[11px] font-semibold capitalize ${
                      novoRole === r ? 'border-primary bg-primary/5' : 'border-border bg-surface2'
                    }`}
                  >
                    {r === 'recepcao' ? 'Recepção' : r === 'enfermagem' ? 'Triagem' : 'Médico'}
                  </button>
                ))}
              </div>
            </div>

            {novoRole === 'medico' && (
              <div>
                <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Especialidade</label>
                <select
                  value={novaEspecialidade}
                  onChange={(e) => setNovaEspecialidade(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">Selecione…</option>
                  {ESPECIALIDADES.map((e) => <option key={e.id} value={e.nome}>{e.nome}</option>)}
                </select>
              </div>
            )}

            {cadErro && <p className="text-xs text-destructive">{cadErro}</p>}
            {cadOk && <p className="text-xs text-emerald-500">{cadOk}</p>}

            <button
              type="button"
              onClick={handleCadastrar}
              disabled={loading || !novoNome.trim() || !novoEmail.includes('@') || novaSenha.length < 8 || !novoRole}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3 text-sm font-semibold font-heading disabled:opacity-40"
            >
              {loading ? 'Cadastrando…' : 'Cadastrar funcionário'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Login screen =====
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
        <div className="mb-8"><Logo /></div>
        <h1 className="font-heading text-2xl font-extrabold mb-1.5">Acesso ao Sistema</h1>
        <p className="text-sm text-muted-foreground mb-6">Entre com seu email e senha.</p>

        <div className="space-y-3">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
          <div>
            <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !email.includes('@') || senha.length < 1}
            className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading disabled:opacity-40"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

export default Login;
