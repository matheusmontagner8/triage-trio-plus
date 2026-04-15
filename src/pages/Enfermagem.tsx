import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import TriageProtocol from '@/components/TriageProtocol';
import { getAllPacientes, updateFicha, getSession, clearSession, type Paciente } from '@/lib/store';

const Enfermagem = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [temp, setTemp] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'enfermagem') {
      navigate('/');
      return;
    }
    refreshList();
    const interval = setInterval(refreshList, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshList = () => {
    const all = getAllPacientes().filter(p => !p.triado);
    setPacientes(all);
  };

  const salvarSinais = () => {
    setErro('');
    if (!selected) return;
    if (!temp) { setErro('Informe a temperatura.'); return; }
    if (!bpSys || !bpDia) { setErro('Informe a pressão arterial.'); return; }

    updateFicha(selected.codigo, {
      temperatura: parseFloat(temp),
      pressaoSistolica: parseInt(bpSys),
      pressaoDiastolica: parseInt(bpDia),
      triado: true,
    });

    setSucesso(true);
    setTimeout(() => {
      setSelected(null);
      setTemp(''); setBpSys(''); setBpDia('');
      setSucesso(false);
      refreshList();
    }, 2000);
  };

  if (!session || session.role !== 'enfermagem') return null;

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-surface border-r border-border p-8 flex flex-col gap-7 sticky top-0 h-screen overflow-y-auto">
        <Logo subtitle="Enfermagem" />
        <TriageProtocol />
        <div className="mt-auto text-[10px] text-muted-foreground leading-relaxed">
          Triagem de enfermagem — {session.nome}
          <br />
          <button onClick={() => { clearSession(); navigate('/'); }} className="text-primary hover:underline mt-2 inline-block">Sair</button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-10 max-w-[900px]">
        <h1 className="font-heading text-[28px] font-extrabold mb-1.5">Triagem de Enfermagem</h1>
        <p className="text-sm text-muted-foreground mb-8">Selecione um paciente para registrar os sinais vitais.</p>

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
                  onClick={() => { setSelected(p); setSucesso(false); setErro(''); setTemp(''); setBpSys(''); setBpDia(''); }}
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
                <input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="38.5" step={0.1}
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Pressão sistólica</label>
                <input type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} placeholder="120"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Pressão diastólica</label>
                <input type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)} placeholder="80"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            {erro && <p className="text-destructive text-sm mb-3">{erro}</p>}

            <button onClick={salvarSinais}
              className="w-full bg-primary text-primary-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading hover:opacity-90 transition-opacity">
              Salvar sinais vitais
            </button>
          </div>
        )}

        {sucesso && (
          <div className="bg-triage-green-bg border border-triage-green-border rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">✓</div>
            <div className="font-heading font-bold text-triage-green">Sinais vitais registrados!</div>
            <p className="text-sm text-muted-foreground">Paciente encaminhado para avaliação médica.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Enfermagem;
