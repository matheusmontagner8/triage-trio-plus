import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import TriageProtocol from '@/components/TriageProtocol';
import { buscarPaciente, getAllPacientes, updateFicha, fallbackTriage, getSession, clearSession, type Paciente } from '@/lib/store';

const COLOR_MAP: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  VERMELHO: { dot: 'bg-triage-red', bg: 'bg-triage-red-bg', border: 'border-triage-red-border', text: 'text-triage-red' },
  LARANJA: { dot: 'bg-triage-orange', bg: 'bg-triage-orange-bg', border: 'border-triage-orange-border', text: 'text-triage-orange' },
  AMARELO: { dot: 'bg-triage-yellow', bg: 'bg-triage-yellow-bg', border: 'border-triage-yellow-border', text: 'text-triage-yellow' },
  VERDE: { dot: 'bg-triage-green', bg: 'bg-triage-green-bg', border: 'border-triage-green-border', text: 'text-triage-green' },
};

const Medico = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [busca, setBusca] = useState('');
  const [erroBusca, setErroBusca] = useState('');
  const [ficha, setFicha] = useState<Paciente | null>(null);
  const [resultado, setResultado] = useState<{ cor: string; urgencia: string; tempo: string; alertas: string[] } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [fila, setFila] = useState<Paciente[]>([]);

  useEffect(() => {
    if (!session || session.role !== 'medico') {
      navigate('/');
      return;
    }
    refreshFila();
    const interval = setInterval(refreshFila, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshFila = () => {
    const triados = getAllPacientes().filter(p => p.triado && !p.triagem);
    setFila(triados);
  };

  const buscarHandler = () => {
    setErroBusca('');
    setResultado(null);
    if (!busca.trim()) { setErroBusca('Digite o nome ou código do paciente.'); return; }
    const found = buscarPaciente(busca.trim());
    if (!found) { setErroBusca('Nenhuma ficha encontrada.'); setFicha(null); return; }
    setFicha(found);
    if (found.triagem) setResultado(found.triagem);
  };

  const selectFromFila = (p: Paciente) => {
    setFicha(p);
    setBusca(p.codigo);
    setResultado(null);
    setErroBusca('');
  };

  const runTriage = () => {
    if (!ficha || !ficha.temperatura || !ficha.pressaoSistolica || !ficha.pressaoDiastolica) return;
    setProcessando(true);

    // Use fallback triage
    setTimeout(() => {
      const res = fallbackTriage(ficha.temperatura!, ficha.pressaoSistolica!, ficha.pressaoDiastolica!);
      setResultado(res);
      updateFicha(ficha.codigo, { triagem: res, especialidade: session?.especialidade });
      setProcessando(false);
      refreshFila();
    }, 1200);
  };

  if (!session || session.role !== 'medico') return null;

  const colors = resultado ? COLOR_MAP[resultado.cor] || COLOR_MAP.VERDE : null;

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-surface border-r border-border p-8 flex flex-col gap-7 sticky top-0 h-screen overflow-y-auto">
        <Logo subtitle="Painel Médico" />

        <div className="bg-surface2 border border-border rounded-lg p-3 text-xs">
          <div className="text-muted-foreground mb-1">Médico</div>
          <div className="font-semibold">{session.nome}</div>
          <div className="text-primary text-[11px] mt-0.5">{session.especialidade}</div>
        </div>

        {/* Fila */}
        {fila.length > 0 && (
          <div className="border border-border rounded-[10px] overflow-hidden">
            <div className="px-3.5 py-2.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border bg-surface2">
              Fila de atendimento ({fila.length})
            </div>
            {fila.map((p) => (
              <button
                key={p.codigo}
                onClick={() => selectFromFila(p)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border last:border-b-0 text-xs hover:bg-surface2 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px] shrink-0">
                  {p.nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.nome}</div>
                  <div className="text-muted-foreground font-mono">{p.codigo}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <TriageProtocol />

        <div className="mt-auto text-[10px] text-muted-foreground leading-relaxed">
          Sistema de apoio à triagem.<br />Não substitui avaliação clínica presencial.
          <br />
          <button onClick={() => { clearSession(); navigate('/'); }} className="text-primary hover:underline mt-2 inline-block">Sair</button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-10 max-w-[900px]">
        <h1 className="font-heading text-[28px] font-extrabold mb-1.5">Painel Médico</h1>
        <p className="text-sm text-muted-foreground mb-8">Busque a ficha do paciente pelo nome ou código para iniciar a triagem.</p>

        {/* Search */}
        <div className="bg-card border border-border rounded-2xl p-7 mb-8">
          <div className="font-heading font-bold text-[15px] mb-4">Localizar paciente</div>
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Nome do paciente ou código de triagem</label>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarHandler()}
                placeholder="Ex: Maria Aparecida  ou  MA4382"
                className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] transition-all" />
            </div>
            <button onClick={buscarHandler}
              className="bg-primary text-primary-foreground rounded-lg px-5 h-[42px] text-[13px] font-semibold font-heading flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 20 20" fill="none" className="w-[15px] h-[15px]"><circle cx="9" cy="9" r="6" stroke="white" strokeWidth="2" /><path d="M14 14l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
              Buscar
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2.5">Digite ao menos parte do nome ou o código exato fornecido ao paciente.</div>
          {erroBusca && <p className="text-destructive text-sm mt-2">{erroBusca}</p>}
        </div>

        {/* Patient data */}
        {ficha && (
          <div>
            <hr className="border-border mb-8" />

            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-4 flex items-center gap-2">
              Dados informados pelo paciente <span className="flex-1 h-px bg-border" />
            </div>

            {/* Patient header */}
            <div className="flex items-center gap-3.5 bg-card border border-border rounded-[10px] p-3.5 mb-5">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-[15px] shrink-0">
                {ficha.nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px]">{ficha.nome}</div>
                <div className="text-xs text-muted-foreground">{ficha.idade} anos</div>
                <div className="font-mono text-xs text-primary mt-0.5">Código: {ficha.codigo}</div>
              </div>
              <div className="text-right font-mono text-[11px] text-muted-foreground">
                Registrado em {new Date(ficha.timestamp).toLocaleDateString('pt-BR')} às {new Date(ficha.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Data cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="col-span-2 bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Sintomas relatados</div>
                <div className="text-sm leading-relaxed">{ficha.sintomas}</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Alergias a medicamentos</div>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] border ${ficha.alergia !== 'Nenhuma' ? 'border-triage-red-border text-triage-red bg-triage-red-bg' : 'border-border bg-surface2'}`}>
                  {ficha.alergia}
                </span>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Comorbidades</div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] border border-border bg-surface2">
                  {ficha.comorbidade}
                </span>
              </div>
            </div>

            {/* Vital signs */}
            {ficha.triado && ficha.temperatura && (
              <>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  Sinais vitais (registrados pela enfermagem) <span className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-3 gap-3.5 mb-6">
                  <div className="bg-card border border-border rounded-[10px] p-3.5">
                    <div className="text-[11px] text-muted-foreground mb-1">Temperatura</div>
                    <div className="font-mono text-base font-medium">{ficha.temperatura}°C</div>
                  </div>
                  <div className="bg-card border border-border rounded-[10px] p-3.5">
                    <div className="text-[11px] text-muted-foreground mb-1">Pressão sistólica</div>
                    <div className="font-mono text-base font-medium">{ficha.pressaoSistolica} mmHg</div>
                  </div>
                  <div className="bg-card border border-border rounded-[10px] p-3.5">
                    <div className="text-[11px] text-muted-foreground mb-1">Pressão diastólica</div>
                    <div className="font-mono text-base font-medium">{ficha.pressaoDiastolica} mmHg</div>
                  </div>
                </div>
              </>
            )}

            {/* Triage button */}
            {!resultado && ficha.triado && (
              <button onClick={runTriage} disabled={processando}
                className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                {processando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processando...
                  </>
                ) : 'Processar triagem'}
              </button>
            )}

            {!ficha.triado && (
              <div className="bg-triage-orange-bg border border-triage-orange-border rounded-xl p-4 text-sm text-center">
                ⏳ Paciente aguardando triagem de enfermagem (sinais vitais não registrados).
              </div>
            )}

            {/* Result */}
            {resultado && colors && (
              <div className="mt-8">
                <hr className="border-border mb-8" />
                <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${colors.dot}`} />
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className={`inline-block px-3.5 py-1 rounded-full font-mono text-[11px] border ${colors.border} ${colors.text}`}>
                        {resultado.cor}
                      </span>
                      <div className={`font-heading text-[26px] font-extrabold mt-2.5 ${colors.text}`}>{resultado.urgencia}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">Espera máxima</div>
                      <div className={`font-heading text-[22px] font-extrabold ${colors.text}`}>{resultado.tempo}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-background/20 border border-border rounded-lg p-3">
                      <div className="text-[11px] text-muted-foreground mb-1">Temperatura</div>
                      <div className="font-mono text-base font-medium">{ficha.temperatura}°C</div>
                    </div>
                    <div className="bg-background/20 border border-border rounded-lg p-3">
                      <div className="text-[11px] text-muted-foreground mb-1">Pressão arterial</div>
                      <div className="font-mono text-base font-medium">{ficha.pressaoSistolica}/{ficha.pressaoDiastolica} mmHg</div>
                    </div>
                    <div className="bg-background/20 border border-border rounded-lg p-3">
                      <div className="text-[11px] text-muted-foreground mb-1">Classificação</div>
                      <div className="font-mono text-base font-medium">{resultado.cor}</div>
                    </div>
                  </div>

                  {resultado.alertas.length > 0 && (
                    <div className="bg-triage-red-bg border border-triage-red-border rounded-lg p-3 mb-4 flex items-start gap-2.5 text-sm">
                      <strong className="text-triage-red">⚠ Atenção:</strong>
                      <span>{resultado.alertas.join(' · ')}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Sintomas / queixa principal</div>
                      <div className="text-sm bg-background/20 p-2.5 rounded-md leading-relaxed">{ficha.sintomas}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Alergias registradas</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] border ${ficha.alergia !== 'Nenhuma' ? 'border-triage-red-border text-triage-red bg-triage-red-bg' : 'border-border bg-surface2'}`}>
                        {ficha.alergia !== 'Nenhuma' ? ficha.alergia : 'Nenhuma relatada'}
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Comorbidades</div>
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] border border-border bg-surface2">
                        {ficha.comorbidade !== 'Nenhuma' ? ficha.comorbidade : 'Sem histórico'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Medico;
