import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { ESPECIALIDADES, setSession } from '@/lib/store';

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
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!role || !nome) return;
    if (role === 'medico' && !especialidade) return;
    if (SENHAS[nome] !== senha) {
      setErro('Senha incorreta. Tente novamente.');
      return;
    }
    setErro('');
    setSession({ role, nome, especialidade: role === 'medico' ? especialidade : undefined });
    if (role === 'recepcao') navigate('/recepcao');
    else if (role === 'enfermagem') navigate('/enfermagem');
    else navigate('/medico');
  };

  const roles: { id: Role; label: string; icon: string; desc: string }[] = [
    { id: 'recepcao', label: 'Recepção', icon: '🏥', desc: 'Cadastro de pacientes' },
    { id: 'enfermagem', label: 'Triagem de Enfermagem', icon: '💉', desc: 'Sinais vitais e classificação' },
    { id: 'medico', label: 'Médico', icon: '🩺', desc: 'Chamada e atendimento' },
  ];

  const getNomes = () => {
    if (role === 'recepcao') return FUNCIONARIOS_RECEPCAO;
    if (role === 'enfermagem') return FUNCIONARIOS_ENFERMAGEM;
    return FUNCIONARIOS_MEDICOS;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-lg">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="font-heading text-2xl font-extrabold mb-1.5">Acesso ao Sistema</h1>
        <p className="text-sm text-muted-foreground mb-6">Selecione seu setor e identifique-se para continuar.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full border border-border bg-surface2 rounded-[10px] py-3 text-sm font-semibold hover:border-primary/50 transition-colors mb-6 flex items-center justify-center gap-2"
        >
          📊 Dashboard de Atendimento
        </button>

        {/* Role selection */}
        <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
          Setor <span className="flex-1 h-px bg-border" />
        </div>
        <div className="grid gap-3 mb-6">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setNome(''); setEspecialidade(''); }}
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
              onChange={(e) => setNome(e.target.value)}
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

            <button
              onClick={handleLogin}
              disabled={!nome || (role === 'medico' && !especialidade)}
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
