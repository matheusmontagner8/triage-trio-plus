import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { getAllPacientes, type Paciente } from '@/lib/store';

const COLOR_LABELS: Record<string, { label: string; dot: string; bg: string; border: string }> = {
  VERMELHO: { label: 'Vermelho', dot: 'bg-triage-red', bg: 'bg-triage-red-bg', border: 'border-triage-red-border' },
  LARANJA: { label: 'Laranja', dot: 'bg-triage-orange', bg: 'bg-triage-orange-bg', border: 'border-triage-orange-border' },
  AMARELO: { label: 'Amarelo', dot: 'bg-triage-yellow', bg: 'bg-triage-yellow-bg', border: 'border-triage-yellow-border' },
  VERDE: { label: 'Verde', dot: 'bg-triage-green', bg: 'bg-triage-green-bg', border: 'border-triage-green-border' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCor, setFiltroCor] = useState<string>('TODOS');

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const refresh = () => setPacientes(getAllPacientes());

  const triados = pacientes.filter(p => p.triado);
  const atendidos = pacientes.filter(p => p.atendido);
  const aguardando = pacientes.filter(p => p.triado && !p.atendido);

  const contagem: Record<string, number> = { VERMELHO: 0, LARANJA: 0, AMARELO: 0, VERDE: 0 };
  triados.forEach(p => {
    if (p.triagem?.cor && contagem[p.triagem.cor] !== undefined) {
      contagem[p.triagem.cor]++;
    }
  });

  // Average wait time: difference between timestamp (registration) and prescricao.dataAtendimento for attended patients
  const tempoMedio = (() => {
    const tempos: number[] = [];
    atendidos.forEach(p => {
      if (p.timestamp && p.prescricao?.dataAtendimento) {
        const inicio = new Date(p.timestamp).getTime();
        // Parse pt-BR date format dd/mm/yyyy, hh:mm:ss
        const parts = p.prescricao.dataAtendimento.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):?(\d+)?/);
        if (parts) {
          const fim = new Date(
            parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]),
            parseInt(parts[4]), parseInt(parts[5]), parseInt(parts[6] || '0')
          ).getTime();
          if (!isNaN(inicio) && !isNaN(fim) && fim > inicio) {
            tempos.push((fim - inicio) / 60000); // minutes
          }
        }
      }
    });
    if (tempos.length === 0) return null;
    const avg = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    return avg;
  })();

  const formatTempo = (min: number | null) => {
    if (min === null) return '—';
    if (min < 1) return '< 1 min';
    if (min < 60) return `${Math.round(min)} min`;
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}min`;
  };

  const maxCor = Math.max(...Object.values(contagem), 1);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-5 flex items-center justify-between">
        <Logo subtitle="Dashboard" />
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-primary hover:underline"
        >
          ← Voltar ao login
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-8">
        <h1 className="font-heading text-[28px] font-extrabold mb-1.5">Dashboard de Atendimento</h1>
        <p className="text-sm text-muted-foreground mb-8">Visão geral em tempo real dos atendimentos.</p>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] text-muted-foreground mb-1">Total cadastrados</div>
            <div className="font-heading text-3xl font-extrabold">{pacientes.length}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] text-muted-foreground mb-1">Triados</div>
            <div className="font-heading text-3xl font-extrabold text-primary">{triados.length}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] text-muted-foreground mb-1">Atendidos</div>
            <div className="font-heading text-3xl font-extrabold text-triage-green">{atendidos.length}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] text-muted-foreground mb-1">Tempo médio de espera</div>
            <div className="font-heading text-2xl font-extrabold">{formatTempo(tempoMedio)}</div>
          </div>
        </div>

        {/* Classification breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="font-heading font-bold text-[15px] mb-5">Classificação por cor</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE'] as const).map(cor => {
              const c = COLOR_LABELS[cor];
              return (
                <div key={cor} className={`${c.bg} border ${c.border} rounded-xl p-4 text-center`}>
                  <div className={`w-4 h-4 rounded-full ${c.dot} mx-auto mb-2`} />
                  <div className="text-[11px] text-muted-foreground">{c.label}</div>
                  <div className="font-heading text-2xl font-extrabold mt-1">{contagem[cor]}</div>
                </div>
              );
            })}
          </div>

          {/* Bar chart */}
          <div className="space-y-3">
            {(['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE'] as const).map(cor => {
              const c = COLOR_LABELS[cor];
              const pct = maxCor > 0 ? (contagem[cor] / maxCor) * 100 : 0;
              return (
                <div key={cor} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground text-right">{c.label}</div>
                  <div className="flex-1 bg-surface2 rounded-full h-5 overflow-hidden">
                    <div className={`${c.dot} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-xs font-mono font-semibold text-right">{contagem[cor]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting patients */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="font-heading font-bold text-[15px] mb-4">
            Aguardando atendimento ({aguardando.length})
          </div>
          {aguardando.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum paciente aguardando.</p>
          ) : (
            <div className="space-y-2">
              {aguardando.map(p => {
                const c = p.triagem ? COLOR_LABELS[p.triagem.cor] || COLOR_LABELS.VERDE : COLOR_LABELS.VERDE;
                return (
                  <div key={p.codigo} className={`flex items-center gap-3 p-3 rounded-xl border ${c.border} ${c.bg}`}>
                    <div className={`w-3 h-3 rounded-full ${c.dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.idade} anos · <span className="font-mono text-primary">{p.codigo}</span> · {p.triagem?.cor} — {p.triagem?.urgencia}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{p.triagem?.tempo}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
