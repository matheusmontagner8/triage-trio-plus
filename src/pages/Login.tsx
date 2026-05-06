import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import {
  ESPECIALIDADES,
  setSession,
  getFuncionariosCustom,
  addFuncionarioCustom,
  type FuncionarioCustom,
} from '@/lib/store';

const FUNCIONARIOS_RECEPCAO = ['Ana Santos'];
const FUNCIONARIOS_ENFERMAGEM = ['Carlos Oliveira', 'Mariana Silva'];
const FUNCIONARIOS_MEDICOS = [
  'Dr. Ricardo Mendes',
  'Dra. Fernanda Costa',
  'Dr. Paulo Almeida',
  'Dra. Juliana Rocha',
  'Dr. André Barbosa',
  'Dra. Camila Ferreira',
];
const FUNCIONARIOS_ADMIN = ['Administrador'];

const SENHAS_PADRAO: Record<string, string> = {
  'Ana Santos': '1111',
  'Carlos Oliveira': '2222',
  'Mariana Silva': '3333',
  'Dr. Ricardo Mendes': '4444',
  'Dra. Fernanda Costa': '5555',
  'Dr. Paulo Almeida': '6666',
  'Dra. Juliana Rocha': '7777',
  'Dr. André Barbosa': '8888',
  'Dra. Camila Ferreira': '9999',
  'Administrador': '0000',
};

type Role = 'recepcao' | 'enfermagem' | 'medico' | 'admin';
type FuncRole = 'recepcao' | 'enfermagem' | 'medico';

const Login = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [customs, setCustoms] = useState<FuncionarioCustom[]>([]);
  const [adminLogado, setAdminLogado] = useState(false);
  const navigate = useNavigate();

  // Cadastro
  const [novoNome, setNovoNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState<FuncRole | ''>('');
  const [cadastroErro, setCadastroErro] = useState('');
  const [cadastroOk, setCadastroOk] = useState('');

  useEffect(() => {
    setSenha('');
    setErro('');
    setCustoms(getFuncionariosCustom());
  }, []);

  const senhasMap = useMemo(() => {
    const map: Record<string, string> = { ...SENHAS_PADRAO };
    customs.forEach((c) => { map[c.nome] = c.senha; });
    return map;
  }, [customs]);

  const handleLogin = () => {
    if (!role || !nome) return;
    if (role === 'medico' && !especialidade) return;
    if (senhasMap[nome] !== senha) {
      setErro('Senha incorreta. Tente novamente.');
      return;
    }
    setErro('');
    if (role === 'admin') {
      setAdminLogado(true);
      return;
    }
    setSession({ role, nome, especialidade: role === 'medico' ? especialidade : undefined });
    if (role === 'recepcao') navigate('/recepcao');
    else if (role === 'enfermagem') navigate('/enfermagem');
    else navigate('/medico');
  };

  const handleCadastrar = () => {
    setCadastroErro('');
    setCadastroOk('');
    if (!novoRole) { setCadastroErro('Selecione o setor de trabalho.'); return; }
    const res = addFuncionarioCustom({ nome: novoNome, senha: novaSenha, role: novoRole });
    if (!res.ok) { setCadastroErro(res.erro || 'Não foi possível cadastrar.'); return; }
    setCustoms(getFuncionariosCustom());
    setCadastroOk(`Funcionário "${novoNome.trim()}" cadastrado com sucesso!`);
    setNovoNome(''); setNovaSenha(''); setNovoRole('');
  };

  const handleSairAdmin = () => {
    setAdminLogado(false);
    setRole(null);
    setNome('');
    setSenha('');
    setNovoNome(''); setNovaSenha(''); setNovoRole('');
    setCadastroErro(''); setCadastroOk('');
  };

  const roles: { id: Role; label: string; icon: string; desc: string }[] = [
    { id: 'recepcao', label: 'Recepção', icon: '🏥', desc: 'Cadastro de pacientes' },
    { id: 'enfermagem', label: 'Triagem de Enfermagem', icon: '💉', desc: 'Sinais vitais e classificação' },
    { id: 'medico', label: 'Médico', icon: '🩺', desc: 'Chamada e atendimento' },
    { id: 'admin', label: 'Administrador', icon: '🛡️', desc: 'Cadastro de funcionários' },
  ];

  const funcRoles: { id: FuncRole; label: string; icon: string }[] = [
    { id: 'recepcao', label: 'Recepção', icon: '🏥' },
    { id: 'enfermagem', label: 'Triagem', icon: '💉' },
    { id: 'medico', label: 'Médico', icon: '🩺' },
  ];

  const getNomes = () => {
    let base: string[] = [];
    if (role === 'recepcao') base = [...FUNCIONARIOS_RECEPCAO];
    else if (role === 'enfermagem') base = [...FUNCIONARIOS_ENFERMAGEM];
    else if (role === 'medico') base = [...FUNCIONARIOS_MEDICOS];
    else if (role === 'admin') base = [...FUNCIONARIOS_ADMIN];
    if (role === 'admin') return base;
    const extras = customs.filter((c) => c.role === role).map((c) => c.nome);
    return [...base, ...extras];
  };

  // ==== Tela do Administrador autenticado ====
  if (adminLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
          <div className="mb-8">
            <Logo />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-extrabold mb-1.5">Painel do Administrador</h1>
              <p className="text-sm text-muted-foreground">Cadastrar novos funcionários no sistema.</p>
            </div>
            <button
              onClick={handleSairAdmin}
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5"
            >
              Sair
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Nome completo
              </label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Dra. Maria Souza"
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Senha (4 dígitos)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary tracking-[0.5em] text-center"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5 block">
                Setor de trabalho
              </label>
              <div className="grid grid-cols-3 gap-2">
                {funcRoles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setNovoRole(r.id)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      novoRole === r.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-surface2 hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="text-base">{r.icon}</div>
                    <div className="text-[11px] font-semibold mt-0.5">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {cadastroErro && <p className="text-xs text-destructive">{cadastroErro}</p>}
            {cadastroOk && <p className="text-xs text-emerald-500">{cadastroOk}</p>}

            <button
              type="button"
              onClick={handleCadastrar}
              disabled={!novoNome.trim() || novaSenha.length !== 4 || !novoRole}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3 text-sm font-semibold font-heading disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              Cadastrar funcionário
            </button>

            {customs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Funcionários cadastrados ({customs.length})
                </div>
                <ul className="space-y-1.5 max-h-48 overflow-auto">
                  {customs.map((c) => (
                    <li key={c.nome} className="flex justify-between text-xs bg-surface2 border border-border rounded-md px-3 py-2">
                      <span className="font-medium">{c.nome}</span>
                      <span className="text-muted-foreground capitalize">{c.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="font-heading text-2xl font-extrabold mb-1.5">Acesso ao Sistema</h1>
        <p className="text-sm text-muted-foreground mb-6">Selecione seu setor e identifique-se para continuar.</p>

        {/* Role selection */}
        <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
          Setor <span className="flex-1 h-px bg-border" />
        </div>
        <div className="grid gap-3 mb-6">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setNome(''); setEspecialidade(''); setSenha(''); setErro(''); }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                role === r.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface2 hover:border-muted-foreground/30'
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <div>
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {role && (
          <>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
              {role === 'admin' ? 'Usuário' : 'Funcionário'} <span className="flex-1 h-px bg-border" />
            </div>
            <select
              value={nome}
              onChange={(e) => { setNome(e.target.value); setSenha(''); setErro(''); }}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-4"
            >
              <option value="">Selecione seu nome</option>
              {getNomes().map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            {role === 'medico' && (
              <>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  Especialidade <span className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ESPECIALIDADES.map((esp) => (
                    <button
                      key={esp.id}
                      onClick={() => setEspecialidade(esp.nome)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        especialidade === esp.nome
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface2 hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="text-xs font-semibold">{esp.nome}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{esp.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {nome && (role !== 'medico' || especialidade) && (
              <>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  Senha (4 dígitos) <span className="flex-1 h-px bg-border" />
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={senha}
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(e) => { setSenha(e.target.value.replace(/\D/g, '')); setErro(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                  placeholder="••••"
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-2 tracking-[0.5em] text-center"
                />
                {erro && <p className="text-xs text-destructive mb-2">{erro}</p>}
              </>
            )}

            <button
              onClick={handleLogin}
              disabled={!nome || (role === 'medico' && !especialidade) || senha.length !== 4}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading disabled:opacity-40 transition-opacity hover:opacity-90 mt-2"
            >
              Entrar no sistema
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
