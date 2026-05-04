import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { ESPECIALIDADES, setSession, getFuncionariosCustom, addFuncionarioCustom, type FuncionarioRole } from '@/lib/store';

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

const SENHAS: Record<string, string> = {
  'Ana Santos': '1111',
  'Carlos Oliveira': '2222',
  'Mariana Silva': '3333',
  'Dr. Ricardo Mendes': '4444',
  'Dra. Fernanda Costa': '5555',
  'Dr. Paulo Almeida': '6666',
  'Dra. Juliana Rocha': '7777',
  'Dr. André Barbosa': '8888',
  'Dra. Camila Ferreira': '9999',
};

type Role = 'recepcao' | 'enfermagem' | 'medico';

const Login = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [customs, setCustoms] = useState(() => getFuncionariosCustom());

  // Cadastro
  const [showCadastro, setShowCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoRole, setNovoRole] = useState<FuncionarioRole | ''>('');
  const [cadErro, setCadErro] = useState('');
  const [cadOk, setCadOk] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setSenha('');
    setErro('');
  }, []);

  const senhasMap = useMemo(() => {
    const map: Record<string, string> = { ...SENHAS };
    customs.forEach((f) => { map[f.nome] = f.senha; });
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
    setSession({ role, nome, especialidade: role === 'medico' ? especialidade : undefined });
    if (role === 'recepcao') navigate('/recepcao');
    else if (role === 'enfermagem') navigate('/enfermagem');
    else navigate('/medico');
  };

  const handleCadastrar = () => {
    setCadErro(''); setCadOk('');
    const n = novoNome.trim();
    if (!n) return setCadErro('Informe o nome.');
    if (!/^\d{4}$/.test(novaSenha)) return setCadErro('Senha deve ter 4 dígitos numéricos.');
    if (!novoRole) return setCadErro('Selecione o setor.');
    const todos = [
      ...FUNCIONARIOS_RECEPCAO, ...FUNCIONARIOS_ENFERMAGEM, ...FUNCIONARIOS_MEDICOS,
      ...customs.map((c) => c.nome),
    ];
    if (todos.some((x) => x.toLowerCase() === n.toLowerCase())) {
      return setCadErro('Já existe um funcionário com esse nome.');
    }
    addFuncionarioCustom({ nome: n, senha: novaSenha, role: novoRole });
    setCustoms(getFuncionariosCustom());
    setCadOk(`Funcionário "${n}" cadastrado com sucesso!`);
    setNovoNome(''); setNovaSenha(''); setNovoRole('');
  };

  const roles: { id: Role; label: string; icon: string; desc: string }[] = [
    { id: 'recepcao', label: 'Recepção', icon: '🏥', desc: 'Cadastro de pacientes' },
    { id: 'enfermagem', label: 'Triagem de Enfermagem', icon: '💉', desc: 'Sinais vitais e classificação' },
    { id: 'medico', label: 'Médico', icon: '🩺', desc: 'Chamada e atendimento' },
  ];

  const getNomes = () => {
    const extras = customs.filter((c) => c.role === role).map((c) => c.nome);
    if (role === 'recepcao') return [...FUNCIONARIOS_RECEPCAO, ...extras];
    if (role === 'enfermagem') return [...FUNCIONARIOS_ENFERMAGEM, ...extras];
    return [...FUNCIONARIOS_MEDICOS, ...extras];
  };

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
              Funcionário <span className="flex-1 h-px bg-border" />
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

        {/* Cadastro de novo funcionário */}
        <div className="mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => setShowCadastro((v) => !v)}
            className="w-full text-left text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between"
          >
            <span>➕ Cadastrar novo funcionário</span>
            <span className="text-base">{showCadastro ? '−' : '+'}</span>
          </button>

          {showCadastro && (
            <div className="mt-4 grid gap-3">
              <div>
                <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Nome</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Senha (4 dígitos)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary mt-1 tracking-[0.5em] text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Setor</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['recepcao', 'enfermagem', 'medico'] as FuncionarioRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNovoRole(r)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        novoRole === r
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface2 hover:border-muted-foreground/30'
                      }`}
                    >
                      {r === 'recepcao' ? 'Recepção' : r === 'enfermagem' ? 'Triagem' : 'Médico'}
                    </button>
                  ))}
                </div>
              </div>
              {cadErro && <p className="text-xs text-destructive">{cadErro}</p>}
              {cadOk && <p className="text-xs text-green-600">{cadOk}</p>}
              <button
                type="button"
                onClick={handleCadastrar}
                className="w-full bg-secondary text-secondary-foreground rounded-[10px] py-2.5 text-sm font-semibold font-heading hover:opacity-90 transition-opacity"
              >
                Cadastrar funcionário
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
