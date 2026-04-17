import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const [filtroPeriodo, setFiltroPeriodo] = useState<'TODOS' | 'HOJE' | 'SEMANA' | 'MES'>('TODOS');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  // Parse pt-BR date "dd/mm/yyyy, hh:mm:ss" to Date
  const parsePtDate = (s?: string): Date | null => {
    if (!s) return null;
    const m = s.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):?(\d+)?/);
    if (!m) return null;
    return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +(m[6] || '0'));
  };

  const dentroDoPeriodo = (dataStr?: string): boolean => {
    if (filtroPeriodo === 'TODOS') return true;
    const d = parsePtDate(dataStr);
    if (!d) return false;
    const agora = new Date();
    if (filtroPeriodo === 'HOJE') {
      return d.toDateString() === agora.toDateString();
    }
    const diffDias = (agora.getTime() - d.getTime()) / 86400000;
    if (filtroPeriodo === 'SEMANA') return diffDias <= 7;
    if (filtroPeriodo === 'MES') return diffDias <= 30;
    return true;
  };

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

  const historicoFiltrado = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return atendidos
      .filter(p => filtroCor === 'TODOS' || p.triagem?.cor === filtroCor)
      .filter(p => dentroDoPeriodo(p.prescricao?.dataAtendimento))
      .filter(p => !q || p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.prescricao?.diagnostico?.toLowerCase().includes(q))
      .sort((a, b) => (b.prescricao?.dataAtendimento || '').localeCompare(a.prescricao?.dataAtendimento || ''));
  }, [atendidos, busca, filtroCor, filtroPeriodo]);

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

        {/* History */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="font-heading font-bold text-[15px]">
              Histórico de atendimentos ({historicoFiltrado.length})
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou diagnóstico..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="pl-9 w-full sm:w-72"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(['TODOS', 'VERMELHO', 'LARANJA', 'AMARELO', 'VERDE'] as const).map(cor => {
                  const active = filtroCor === cor;
                  const c = cor === 'TODOS' ? null : COLOR_LABELS[cor];
                  return (
                    <button
                      key={cor}
                      onClick={() => setFiltroCor(cor)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {c && <span className={`w-2 h-2 rounded-full ${c.dot}`} />}
                      {cor === 'TODOS' ? 'Todos' : c?.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { key: 'TODOS', label: 'Todo período' },
                  { key: 'HOJE', label: 'Hoje' },
                  { key: 'SEMANA', label: 'Última semana' },
                  { key: 'MES', label: 'Último mês' },
                ] as const).map(({ key, label }) => {
                  const active = filtroPeriodo === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFiltroPeriodo(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {historicoFiltrado.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum atendimento encontrado.</p>
          ) : (
            <div className="space-y-2">
              {historicoFiltrado.map(p => {
                const c = p.triagem ? COLOR_LABELS[p.triagem.cor] || COLOR_LABELS.VERDE : COLOR_LABELS.VERDE;
                return (
                  <button
                    key={p.codigo}
                    onClick={() => setPacienteSelecionado(p)}
                    className={`w-full text-left p-3 rounded-xl border ${c.border} ${c.bg} hover:opacity-90 hover:shadow-sm transition-all cursor-pointer`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${c.dot} shrink-0 mt-1.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <div className="text-sm font-semibold">{p.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.idade} anos · <span className="font-mono text-primary">{p.codigo}</span>
                          </div>
                        </div>
                        {p.prescricao?.diagnostico && (
                          <div className="text-xs mt-1">
                            <span className="text-muted-foreground">Diagnóstico: </span>
                            <span className="font-medium">{p.prescricao.diagnostico}</span>
                          </div>
                        )}
                        {p.medicoResponsavel && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Atendido por {p.medicoResponsavel}
                            {p.especialidade && ` · ${p.especialidade}`}
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono text-right shrink-0">
                        {p.prescricao?.dataAtendimento || '—'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!pacienteSelecionado} onOpenChange={(o) => !o && setPacienteSelecionado(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {pacienteSelecionado && (() => {
            const p = pacienteSelecionado;
            const c = p.triagem ? COLOR_LABELS[p.triagem.cor] || COLOR_LABELS.VERDE : COLOR_LABELS.VERDE;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${c.dot}`} />
                    <DialogTitle className="font-heading text-xl">{p.nome}</DialogTitle>
                  </div>
                  <DialogDescription>
                    {p.idade} anos · <span className="font-mono text-primary">{p.codigo}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  {/* Triagem */}
                  {p.triagem && (
                    <section>
                      <h3 className="font-heading font-bold text-sm mb-2">Classificação de risco</h3>
                      <div className={`rounded-xl border ${c.border} ${c.bg} p-3 text-sm`}>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <div><span className="text-muted-foreground">Cor:</span> <span className="font-semibold">{c.label}</span></div>
                          <div><span className="text-muted-foreground">Urgência:</span> <span className="font-semibold">{p.triagem.urgencia}</span></div>
                          <div><span className="text-muted-foreground">Tempo alvo:</span> <span className="font-mono">{p.triagem.tempo}</span></div>
                        </div>
                        {p.triagem.alertas?.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Alertas: </span>
                            {p.triagem.alertas.join(' · ')}
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Sinais vitais */}
                  <section>
                    <h3 className="font-heading font-bold text-sm mb-2">Sinais vitais</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Temperatura', val: p.temperatura, unit: '°C' },
                        { label: 'Pressão arterial', val: p.pressaoSistolica && p.pressaoDiastolica ? `${p.pressaoSistolica}/${p.pressaoDiastolica}` : undefined, unit: 'mmHg' },
                        { label: 'Saturação O₂', val: p.saturacaoO2, unit: '%' },
                        { label: 'Freq. cardíaca', val: p.frequenciaCardiaca, unit: 'bpm' },
                        { label: 'Glicemia', val: p.glicemia, unit: 'mg/dL' },
                        { label: 'Freq. respiratória', val: p.frequenciaRespiratoria, unit: 'irpm' },
                      ].map(s => (
                        <div key={s.label} className="bg-surface border border-border rounded-lg p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                          <div className="text-sm font-mono font-semibold mt-0.5">
                            {s.val !== undefined && s.val !== '' ? `${s.val} ${s.unit}` : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Queixa */}
                  <section>
                    <h3 className="font-heading font-bold text-sm mb-2">Queixa e histórico</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-muted-foreground">Sintomas: </span>{p.sintomas || '—'}</div>
                      <div><span className="text-muted-foreground">Alergias: </span>{p.alergia || '—'}</div>
                      <div><span className="text-muted-foreground">Comorbidades: </span>{p.comorbidade || '—'}</div>
                    </div>
                  </section>

                  {/* Médico */}
                  {p.medicoResponsavel && (
                    <section>
                      <h3 className="font-heading font-bold text-sm mb-2">Médico responsável</h3>
                      <div className="bg-surface border border-border rounded-lg p-3 text-sm">
                        <div className="font-semibold">{p.medicoResponsavel}</div>
                        {p.especialidade && <div className="text-xs text-muted-foreground mt-0.5">{p.especialidade}</div>}
                        {p.prescricao?.dataAtendimento && (
                          <div className="text-[11px] text-muted-foreground font-mono mt-1">{p.prescricao.dataAtendimento}</div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Prescrição */}
                  {p.prescricao && (
                    <section>
                      <h3 className="font-heading font-bold text-sm mb-2">Prescrição médica</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Diagnóstico</div>
                          <div className="bg-surface border border-border rounded-lg p-2.5">{p.prescricao.diagnostico || '—'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Medicamentos</div>
                          <div className="bg-surface border border-border rounded-lg p-2.5 whitespace-pre-wrap">{p.prescricao.medicamentos || '—'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Procedimentos</div>
                          <div className="bg-surface border border-border rounded-lg p-2.5 whitespace-pre-wrap">{p.prescricao.procedimentos || '—'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Observações</div>
                          <div className="bg-surface border border-border rounded-lg p-2.5 whitespace-pre-wrap">{p.prescricao.observacoes || '—'}</div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
