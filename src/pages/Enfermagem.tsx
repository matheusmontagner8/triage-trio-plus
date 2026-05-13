import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import TriageProtocol from '@/components/TriageProtocol';
import { getAllPacientes, updateFicha, fallbackTriage, type Paciente } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';

const COLOR_MAP: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  VERMELHO: { dot: 'bg-triage-red', bg: 'bg-triage-red-bg', border: 'border-triage-red-border', text: 'text-triage-red' },
  LARANJA: { dot: 'bg-triage-orange', bg: 'bg-triage-orange-bg', border: 'border-triage-orange-border', text: 'text-triage-orange' },
  AMARELO: { dot: 'bg-triage-yellow', bg: 'bg-triage-yellow-bg', border: 'border-triage-yellow-border', text: 'text-triage-yellow' },
  VERDE: { dot: 'bg-triage-green', bg: 'bg-triage-green-bg', border: 'border-triage-green-border', text: 'text-triage-green' },
};

const Enfermagem = () => {
  const navigate = useNavigate();
  const { session, role, nome: userNome, loading, signOut } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [temp, setTemp] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [satO2, setSatO2] = useState('');
  const [fc, setFc] = useState('');
  const [glicemia, setGlicemia] = useState('');
  const [fr, setFr] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [resultadoTriagem, setResultadoTriagem] = useState<{ cor: string; urgencia: string; tempo: string; alertas: string[] } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session || role !== 'enfermagem') {
      navigate('/login', { replace: true });
      return;
    }
    refreshList();
    const interval = setInterval(refreshList, 3000);
    return () => clearInterval(interval);
  }, [session, role, loading]);

  const refreshList = () => {
    const all = getAllPacientes().filter(p => !p.triado);
    setPacientes(all);
  };

  const clearForm = () => {
    setTemp(''); setBpSys(''); setBpDia(''); setSatO2(''); setFc(''); setGlicemia(''); setFr('');
  };

  const salvarSinais = () => {
    setErro('');
    if (!selected) return;
    if (!temp) { setErro('Informe a temperatura.'); return; }
    if (!bpSys || !bpDia) { setErro('Informe a pressão arterial.'); return; }
    if (!satO2) { setErro('Informe a saturação de oxigênio.'); return; }
    if (!fc) { setErro('Informe a frequência cardíaca.'); return; }
    if (!glicemia) { setErro('Informe a glicemia (dextro).'); return; }
    if (!fr) { setErro('Informe a frequência respiratória.'); return; }

    const tempVal = parseFloat(temp);
    const sysVal = parseInt(bpSys);
    const diaVal = parseInt(bpDia);
    const satVal = parseFloat(satO2);
    const fcVal = parseInt(fc);
    const gliVal = parseFloat(glicemia);
    const frVal = parseInt(fr);

    // Run triage classification
    const triagem = fallbackTriage(tempVal, sysVal, diaVal, satVal, fcVal, gliVal, frVal);

    updateFicha(selected.codigo, {
      temperatura: tempVal,
      pressaoSistolica: sysVal,
      pressaoDiastolica: diaVal,
      saturacaoO2: satVal,
      frequenciaCardiaca: fcVal,
      glicemia: gliVal,
      frequenciaRespiratoria: frVal,
      triado: true,
      triagem,
    });

    setResultadoTriagem(triagem);
    setSucesso(true);
    setTimeout(() => {
      setSelected(null);
      clearForm();
      setSucesso(false);
      setResultadoTriagem(null);
      refreshList();
    }, 4000);
  };

  if (loading || !session || role !== 'enfermagem') return null;

  const colors = resultadoTriagem ? COLOR_MAP[resultadoTriagem.cor] || COLOR_MAP.VERDE : null;

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-surface border-r border-border p-8 flex flex-col gap-7 sticky top-0 h-screen overflow-y-auto">
        <Logo subtitle="Enfermagem" />
        <TriageProtocol />
        <div className="mt-auto text-[10px] text-muted-foreground leading-relaxed">
          Triagem de enfermagem — {userNome}
          <br />
          <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline mt-2 inline-block mr-3">📊 Histórico</button>
          <button onClick={async () => { await signOut(); navigate('/login'); }} className="text-primary hover:underline mt-2 inline-block">Sair</button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-10 max-w-[900px]">
        <h1 className="font-heading text-[28px] font-extrabold mb-1.5">Triagem de Enfermagem</h1>
        <p className="text-sm text-muted-foreground mb-8">Selecione um paciente, registre os sinais vitais e a classificação será gerada automaticamente.</p>

        {/* Patient list */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="font-heading font-bold text-[15px] mb-4">
            Pacientes aguardando ({pacientes.length})
          </div>
          {pacientes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum paciente aguardando triagem.</p>
          ) : (
            <div className="space-y-2">
              {pacientes.map((p) => (
                <button
                  key={p.codigo}
                  onClick={() => { setSelected(p); setSucesso(false); setErro(''); setResultadoTriagem(null); clearForm(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected?.codigo === p.codigo ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
                    {p.nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">{p.idade} anos · Código: <span className="font-mono text-primary">{p.codigo}</span></div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vital signs form */}
        {selected && !sucesso && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
              Sinais vitais — {selected.nome} <span className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-4 p-3 bg-surface2 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Sintomas relatados</div>
              <div className="text-sm">{selected.sintomas}</div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Temperatura (°C)</label>
                <input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="36.5" step={0.1}
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Pressão sistólica (mmHg)</label>
                <input type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} placeholder="120"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Pressão diastólica (mmHg)</label>
                <input type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)} placeholder="80"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Saturação O₂ (%)</label>
                <input type="number" value={satO2} onChange={(e) => setSatO2(e.target.value)} placeholder="98"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Frequência cardíaca (bpm)</label>
                <input type="number" value={fc} onChange={(e) => setFc(e.target.value)} placeholder="80"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Glicemia / Dextro (mg/dL)</label>
                <input type="number" value={glicemia} onChange={(e) => setGlicemia(e.target.value)} placeholder="100"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5 col-span-3">
                <label className="text-xs text-muted-foreground font-medium">Frequência respiratória (irpm)</label>
                <input type="number" value={fr} onChange={(e) => setFr(e.target.value)} placeholder="18"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors max-w-[calc(33.33%-0.583rem)]" />
              </div>
            </div>

            {erro && <p className="text-destructive text-sm mb-3">{erro}</p>}

            <button onClick={salvarSinais}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading hover:opacity-90 transition-opacity">
              Salvar sinais vitais e classificar
            </button>
          </div>
        )}

        {sucesso && resultadoTriagem && colors && (
          <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 text-center relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${colors.dot}`} />
            <div className="text-3xl mb-2">✓</div>
            <div className={`font-heading font-bold text-lg ${colors.text}`}>Triagem concluída!</div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className={`inline-block px-4 py-1.5 rounded-full font-mono text-sm border ${colors.border} ${colors.text} font-bold`}>
                {resultadoTriagem.cor}
              </span>
              <span className="text-sm text-muted-foreground">—</span>
              <span className="text-sm font-semibold">{resultadoTriagem.urgencia}</span>
              <span className="text-sm text-muted-foreground">—</span>
              <span className="text-sm">Espera: <strong>{resultadoTriagem.tempo}</strong></span>
            </div>
            {resultadoTriagem.alertas.length > 0 && (
              <div className="mt-3 text-sm text-triage-red font-semibold">
                ⚠ {resultadoTriagem.alertas.join(' · ')}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">Paciente encaminhado para atendimento médico.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Enfermagem;
