import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import TriageProtocol from '@/components/TriageProtocol';
import { getAllPacientes, updateFicha, CID_POR_ESPECIALIDADE, CID_SISTEMAS, verificarContraindicacoes, detectarComorbidades, type Paciente, type CidSistema } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const COLOR_MAP: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  VERMELHO: { dot: 'bg-triage-red', bg: 'bg-triage-red-bg', border: 'border-triage-red-border', text: 'text-triage-red' },
  LARANJA: { dot: 'bg-triage-orange', bg: 'bg-triage-orange-bg', border: 'border-triage-orange-border', text: 'text-triage-orange' },
  AMARELO: { dot: 'bg-triage-yellow', bg: 'bg-triage-yellow-bg', border: 'border-triage-yellow-border', text: 'text-triage-yellow' },
  VERDE: { dot: 'bg-triage-green', bg: 'bg-triage-green-bg', border: 'border-triage-green-border', text: 'text-triage-green' },
};

const PRIORITY_ORDER = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE'];

const Medico = () => {
  const navigate = useNavigate();
  const { session, role, nome: userNome, especialidade, loading, signOut } = useAuth();
  const [ficha, setFicha] = useState<Paciente | null>(null);
  const [fila, setFila] = useState<Paciente[]>([]);
  const [atendendo, setAtendendo] = useState(false);
  const [diagnostico, setDiagnostico] = useState('');
  const [cid, setCid] = useState('');
  const [cidBusca, setCidBusca] = useState('');
  const [cidSistema, setCidSistema] = useState<CidSistema | 'Todos'>('Todos');
  const [tempoSintomas, setTempoSintomas] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [procedimentos, setProcedimentos] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const cidOptions = CID_POR_ESPECIALIDADE[especialidade || ''] || [];

  const normalizar = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const cidFiltrados = cidOptions.filter(c => {
    if (cidSistema !== 'Todos' && c.sistema !== cidSistema) return false;
    const termo = normalizar(cidBusca.trim());
    if (!termo) return true;
    return (
      normalizar(c.codigo).includes(termo) ||
      normalizar(c.descricao).includes(termo)
    );
  });

  useEffect(() => {
    if (loading) return;
    if (!session || role !== 'medico') {
      navigate('/login', { replace: true });
      return;
    }
    refreshFila();
    const interval = setInterval(refreshFila, 3000);
    return () => clearInterval(interval);
  }, [session, role, loading, especialidade]);

  const refreshFila = () => {
    const esp = especialidade || '';
    const especialidadesPediatricas = ['Pediatria', 'Ortopedia'];
    const triados = getAllPacientes()
      .filter(p => p.triado && p.triagem && !p.chamado)
      .filter(p => {
        const idadeNum = parseInt(p.idade);
        if (!isNaN(idadeNum) && idadeNum >= 0 && idadeNum <= 10) {
          return especialidadesPediatricas.includes(esp);
        }
        return true;
      })
      .sort((a, b) => {
        const prioA = PRIORITY_ORDER.indexOf(a.triagem!.cor);
        const prioB = PRIORITY_ORDER.indexOf(b.triagem!.cor);
        return prioA - prioB;
      });
    setFila(triados);
  };

  const chamarPaciente = (p: Paciente) => {
    setFicha(p);
    setAtendendo(true);
    updateFicha(p.codigo, { chamado: true, medicoResponsavel: userNome });
    refreshFila();
  };

  const [fichaFinalizada, setFichaFinalizada] = useState<Paciente | null>(null);

  const alertasContraindicacao = ficha
    ? verificarContraindicacoes(ficha.comorbidade, medicamentos, ficha.alergia)
    : [];
  const comorbidadesDetectadas = ficha
    ? detectarComorbidades([ficha.comorbidade, ficha.alergia].filter(Boolean).join(' ; '))
    : [];

  const finalizarAtendimento = () => {
    if (alertasContraindicacao.length > 0) {
      toast.error('Há medicamentos contraindicados para a comorbidade do paciente. Remova-os antes de finalizar.');
      return;
    }
    if (ficha && diagnostico.trim()) {
      const prescricaoData = {
        cid,
        tempoSintomas,
        diagnostico,
        medicamentos,
        procedimentos,
        observacoes,
        dataAtendimento: new Date().toLocaleString('pt-BR'),
      };
      updateFicha(ficha.codigo, { atendido: true, prescricao: prescricaoData });
      setFichaFinalizada({ ...ficha, atendido: true, prescricao: prescricaoData, medicoResponsavel: userNome });
    }
    setFicha(null);
    setAtendendo(false);
    setDiagnostico('');
    setCid('');
    setCidBusca('');
    setCidSistema('Todos');
    setTempoSintomas('');
    setMedicamentos('');
    setProcedimentos('');
    setObservacoes('');
    refreshFila();
  };

  const imprimirPrescricao = () => {
    if (!fichaFinalizada) return;
    const p = fichaFinalizada;
    const w = window.open('', '_blank');
    if (!w) return;
    const esc = (s: unknown) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Prescrição - ${esc(p.nome)}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#222;font-size:14px}
      h1{font-size:20px;margin-bottom:4px} h2{font-size:15px;color:#555;margin:20px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
      .header{text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:20px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px} .field{margin-bottom:6px}
      .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px} .value{font-size:14px}
      .rx{background:#f5f5f5;border:1px solid #ddd;border-radius:8px;padding:16px;margin:8px 0}
      .footer{margin-top:40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:16px}
      .sig{margin-top:60px;text-align:center} .sig-line{border-top:1px solid #333;width:250px;margin:0 auto;padding-top:6px}
      @media print{body{margin:20px}}
    </style></head><body>
    <div class="header">
      <h1>TriageEngine — Prescrição Médica</h1>
      <div style="font-size:12px;color:#666">Data: ${esc(p.prescricao?.dataAtendimento)}</div>
    </div>
    <h2>Dados do Paciente</h2>
    <div class="grid">
      <div class="field"><div class="label">Nome</div><div class="value">${esc(p.nome)}</div></div>
      <div class="field"><div class="label">Código</div><div class="value">${esc(p.codigo)}</div></div>
      <div class="field"><div class="label">Idade</div><div class="value">${esc(p.idade)} anos</div></div>
      <div class="field"><div class="label">Classificação</div><div class="value">${esc(p.triagem?.cor)} — ${esc(p.triagem?.urgencia)}</div></div>
    </div>
    <h2>Sinais Vitais</h2>
    <div class="grid">
      <div class="field"><div class="label">Temperatura</div><div class="value">${esc(p.temperatura)}°C</div></div>
      <div class="field"><div class="label">Pressão arterial</div><div class="value">${esc(p.pressaoSistolica)}/${esc(p.pressaoDiastolica)} mmHg</div></div>
      <div class="field"><div class="label">Saturação O₂</div><div class="value">${esc(p.saturacaoO2)}%</div></div>
      <div class="field"><div class="label">Freq. cardíaca</div><div class="value">${esc(p.frequenciaCardiaca)} bpm</div></div>
      <div class="field"><div class="label">Glicemia</div><div class="value">${esc(p.glicemia)} mg/dL</div></div>
      <div class="field"><div class="label">Freq. respiratória</div><div class="value">${esc(p.frequenciaRespiratoria)} irpm</div></div>
    </div>
    <h2>Prescrição</h2>
    <div class="rx"><div class="label">CID-10</div><div class="value"><strong>${esc(p.prescricao?.cid) || '—'}</strong></div></div>
    <div class="rx"><div class="label">Tempo com os sintomas</div><div class="value">${esc(p.prescricao?.tempoSintomas) || '—'}</div></div>
    <div class="rx"><div class="label">Diagnóstico</div><div class="value">${esc(p.prescricao?.diagnostico) || '—'}</div></div>
    <div class="rx"><div class="label">Medicamentos</div><div class="value">${esc(p.prescricao?.medicamentos) || '—'}</div></div>
    <div class="rx"><div class="label">Procedimentos</div><div class="value">${esc(p.prescricao?.procedimentos) || '—'}</div></div>
    <div class="rx"><div class="label">Observações</div><div class="value">${esc(p.prescricao?.observacoes) || '—'}</div></div>
    <div class="sig"><div class="sig-line">${esc(p.medicoResponsavel || userNome)}<br/><span style="font-size:11px;color:#888">${esc(especialidade || '')}</span></div></div>
    <div class="footer">Documento gerado pelo sistema TriageEngine — Protocolo de Manchester<br/>Este documento não substitui a avaliação clínica presencial.</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  if (loading || !session || role !== 'medico') return null;

  const colors = ficha?.triagem ? COLOR_MAP[ficha.triagem.cor] || COLOR_MAP.VERDE : null;

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-surface border-r border-border p-8 flex flex-col gap-7 sticky top-0 h-screen overflow-y-auto">
        <Logo subtitle="Painel Médico" />

        <div className="bg-surface2 border border-border rounded-lg p-3 text-xs">
          <div className="text-muted-foreground mb-1">Médico</div>
          <div className="font-semibold">{userNome}</div>
          <div className="text-primary text-[11px] mt-0.5">{especialidade}</div>
        </div>

        <TriageProtocol />

        <div className="mt-auto text-[10px] text-muted-foreground leading-relaxed">
          Sistema de apoio à triagem.<br />Não substitui avaliação clínica presencial.
          <br />
          <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline mt-2 inline-block mr-3">📊 Histórico</button>
          <button onClick={async () => { await signOut(); navigate('/login'); }} className="text-primary hover:underline mt-2 inline-block">Sair</button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-10 max-w-[900px]">
        <h1 className="font-heading text-[28px] font-extrabold mb-1.5">Painel Médico</h1>
        <p className="text-sm text-muted-foreground mb-8">Pacientes classificados pela enfermagem aguardando chamada.</p>

        {/* Queue */}
        {!atendendo && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="font-heading font-bold text-[15px] mb-2">
              Fila de atendimento ({fila.length})
            </div>
            {!['Pediatria', 'Ortopedia'].includes(especialidade || '') && (
              <p className="text-[11px] text-muted-foreground mb-3">
                ℹ Pacientes de 0 a 10 anos são direcionados apenas para Pediatria ou Ortopedia.
              </p>
            )}
            {fila.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhum paciente aguardando atendimento.</p>
            ) : (
              <div className="space-y-2">
                {fila.map((p) => {
                  const c = p.triagem ? COLOR_MAP[p.triagem.cor] || COLOR_MAP.VERDE : COLOR_MAP.VERDE;
                  return (
                    <div
                      key={p.codigo}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${c.border} ${c.bg} transition-all`}
                    >
                      <div className={`w-3 h-3 rounded-full ${c.dot} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{p.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.idade} anos · <span className="font-mono text-primary">{p.codigo}</span> ·{' '}
                          <span className={`font-semibold ${c.text}`}>{p.triagem?.cor}</span> — {p.triagem?.urgencia} — Espera: {p.triagem?.tempo}
                        </div>
                      </div>
                      <button
                        onClick={() => chamarPaciente(p)}
                        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
                      >
                        Chamar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Attending patient */}
        {atendendo && ficha && ficha.triagem && colors && (
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-4 flex items-center gap-2">
              Atendimento em andamento <span className="flex-1 h-px bg-border" />
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
              <div className={`px-3.5 py-1.5 rounded-full font-mono text-sm border ${colors.border} ${colors.text} font-bold`}>
                {ficha.triagem.cor}
              </div>
            </div>

            {/* Classification */}
            <div className={`${colors.bg} border ${colors.border} rounded-xl p-5 mb-5 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${colors.dot}`} />
              <div className="flex items-start justify-between">
                <div>
                  <div className={`font-heading text-xl font-extrabold ${colors.text}`}>{ficha.triagem.urgencia}</div>
                  <div className="text-sm text-muted-foreground mt-1">Classificação: {ficha.triagem.cor}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">Espera máxima</div>
                  <div className={`font-heading text-lg font-extrabold ${colors.text}`}>{ficha.triagem.tempo}</div>
                </div>
              </div>
              {ficha.triagem.alertas.length > 0 && (
                <div className="mt-3 bg-triage-red-bg border border-triage-red-border rounded-lg p-2.5 text-sm text-triage-red font-semibold">
                  ⚠ {ficha.triagem.alertas.join(' · ')}
                </div>
              )}
            </div>

            {/* Vital signs */}
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
              Sinais vitais (registrados pela enfermagem) <span className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Temperatura</div>
                <div className="font-mono text-base font-medium">{ficha.temperatura}°C</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Pressão arterial</div>
                <div className="font-mono text-base font-medium">{ficha.pressaoSistolica}/{ficha.pressaoDiastolica} mmHg</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Saturação O₂</div>
                <div className="font-mono text-base font-medium">{ficha.saturacaoO2}%</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Freq. cardíaca</div>
                <div className="font-mono text-base font-medium">{ficha.frequenciaCardiaca} bpm</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Glicemia (Dextro)</div>
                <div className="font-mono text-base font-medium">{ficha.glicemia} mg/dL</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Freq. respiratória</div>
                <div className="font-mono text-base font-medium">{ficha.frequenciaRespiratoria} irpm</div>
              </div>
            </div>

            {/* Patient info */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="col-span-2 bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Sintomas relatados</div>
                <div className="text-sm leading-relaxed">{ficha.sintomas}</div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1">Alergias</div>
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

            {/* Prescription */}
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
              Prescrição médica <span className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Tempo com os sintomas</label>
                <input
                  value={tempoSintomas}
                  onChange={e => setTempoSintomas(e.target.value)}
                  placeholder="Ex: 3 dias, 12 horas, 1 semana..."
                  className="w-full bg-surface2 border border-border rounded-[10px] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
                <div className="text-[10px] text-muted-foreground mt-1">
                  Informe há quanto tempo o paciente apresenta os sintomas relatados.
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Diagnóstico *</label>
                <textarea
                  value={diagnostico}
                  onChange={e => setDiagnostico(e.target.value)}
                  placeholder="Descreva o diagnóstico do paciente..."
                  className="w-full bg-surface2 border border-border rounded-[10px] p-3 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  CID-10 ({session.especialidade})
                </label>

                {/* Filtros de busca + sistema */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    value={cidBusca}
                    onChange={e => setCidBusca(e.target.value)}
                    placeholder="🔎 Buscar por código ou descrição (ex: J06, lombalgia, asma)"
                    className="flex-1 bg-surface2 border border-border rounded-[10px] p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  <select
                    value={cidSistema}
                    onChange={e => setCidSistema(e.target.value as CidSistema | 'Todos')}
                    className="bg-surface2 border border-border rounded-[10px] p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Todos">Todos os sistemas</option>
                    {CID_SISTEMAS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Lista de resultados */}
                <div className="bg-surface2 border border-border rounded-[10px] max-h-48 overflow-y-auto mb-2">
                  {cidFiltrados.length === 0 ? (
                    <div className="p-3 text-[11px] text-muted-foreground text-center">
                      Nenhum CID encontrado para os filtros atuais.
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {cidFiltrados.map(c => {
                        const valor = `${c.codigo} — ${c.descricao}`;
                        const selecionado = cid === valor;
                        return (
                          <li key={c.codigo}>
                            <button
                              type="button"
                              onClick={() => setCid(valor)}
                              className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface3 transition-colors flex items-start gap-2 ${
                                selecionado ? 'bg-primary/10 border-l-2 border-primary' : ''
                              }`}
                            >
                              <span className="font-mono font-semibold text-primary min-w-[56px]">{c.codigo}</span>
                              <span className="flex-1">{c.descricao}</span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{c.sistema}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Campo final (também aceita digitação manual) */}
                <input
                  value={cid}
                  onChange={e => setCid(e.target.value)}
                  placeholder="Selecione acima ou digite manualmente (ex: J06.9 — Infecção...)"
                  className="w-full bg-surface2 border border-border rounded-[10px] p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
                <div className="text-[10px] text-muted-foreground mt-1">
                  {cidFiltrados.length} resultado(s) • Você pode digitar um CID livre se necessário.
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Medicamentos prescritos</label>
                {comorbidadesDetectadas.length > 0 && (
                  <div className="mb-2 bg-triage-yellow-bg border border-triage-yellow-border rounded-[10px] p-2.5 text-[11px]">
                    <div className="font-semibold text-triage-yellow mb-1">
                      ⚠ Comorbidades detectadas: {comorbidadesDetectadas.map(c => c.comorbidade).join(', ')}
                    </div>
                    <div className="text-muted-foreground">
                      O sistema verifica automaticamente medicamentos contraindicados.
                    </div>
                  </div>
                )}
                <textarea
                  value={medicamentos}
                  onChange={e => setMedicamentos(e.target.value)}
                  placeholder="Ex: Dipirona 500mg — 1 comp. de 6/6h por 3 dias..."
                  className={`w-full bg-surface2 border rounded-[10px] p-3 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 placeholder:text-muted-foreground ${alertasContraindicacao.length > 0 ? 'border-triage-red-border focus:ring-triage-red' : 'border-border focus:ring-primary'}`}
                />
                {alertasContraindicacao.length > 0 && (
                  <div className="mt-2 bg-triage-red-bg border-2 border-triage-red-border rounded-[10px] p-3.5">
                    <div className="flex items-center gap-2 font-bold text-triage-red text-[13px] mb-2.5">
                      <span className="text-base">🚫</span>
                      <span>{alertasContraindicacao.length} medicamento{alertasContraindicacao.length > 1 ? 's' : ''} contraindicado{alertasContraindicacao.length > 1 ? 's' : ''} — corrija antes de finalizar</span>
                    </div>
                    <ul className="space-y-2">
                      {alertasContraindicacao.map((a, i) => (
                        <li key={i} className="bg-card border border-triage-red-border rounded-lg p-2.5 text-[12px]">
                          <div className="flex items-start gap-2">
                            <span className="text-triage-red font-bold shrink-0">●</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold capitalize text-foreground">{a.medicamento}</div>
                              <div className="text-muted-foreground mt-0.5">{a.motivo}</div>
                              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-triage-red-bg text-triage-red text-[10px] font-semibold uppercase tracking-wide">
                                Conflita com: {a.comorbidade}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2.5 text-[11px] text-muted-foreground">
                      💡 Remova ou substitua os itens acima do campo de medicamentos para liberar a finalização.
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Procedimentos realizados / solicitados</label>
                <textarea
                  value={procedimentos}
                  onChange={e => setProcedimentos(e.target.value)}
                  placeholder="Ex: Hemograma completo, Raio-X de tórax..."
                  className="w-full bg-surface2 border border-border rounded-[10px] p-3 text-sm min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Observações adicionais</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Orientações ao paciente, retorno, encaminhamentos..."
                  className="w-full bg-surface2 border border-border rounded-[10px] p-3 text-sm min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {alertasContraindicacao.length > 0 && (
              <div className="mb-3 bg-triage-red-bg border-2 border-triage-red-border rounded-[10px] p-3.5">
                <div className="flex items-center gap-2 font-bold text-triage-red text-[13px] mb-2">
                  <span>⚠</span>
                  <span>Resumo do bloqueio ({alertasContraindicacao.length})</span>
                </div>
                <ul className="space-y-1 text-[12px]">
                  {alertasContraindicacao.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-triage-red shrink-0">•</span>
                      <span>
                        <strong className="capitalize text-foreground">{a.medicamento}</strong>
                        <span className="text-muted-foreground"> — {a.motivo} </span>
                        <span className="text-triage-red font-semibold">({a.comorbidade})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={finalizarAtendimento}
              disabled={!diagnostico.trim() || alertasContraindicacao.length > 0}
              title={alertasContraindicacao.length > 0 ? 'Remova os medicamentos contraindicados antes de finalizar' : ''}
              className={`w-full rounded-[10px] py-3.5 text-sm font-semibold font-heading transition-all disabled:cursor-not-allowed ${
                alertasContraindicacao.length > 0
                  ? 'bg-triage-red-bg border-2 border-triage-red-border text-triage-red disabled:opacity-100'
                  : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40'
              }`}
            >
              {alertasContraindicacao.length > 0
                ? `🚫 Bloqueado — ${alertasContraindicacao.length} medicamento(s) contraindicado(s)`
                : 'Finalizar atendimento e salvar prescrição'}
            </button>
          </div>
        )}

        {/* Print prescription after finalization */}
        {fichaFinalizada && !atendendo && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-triage-green" />
              <div className="font-heading font-bold text-[15px]">Atendimento finalizado</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paciente <span className="font-semibold text-foreground">{fichaFinalizada.nome}</span> ({fichaFinalizada.codigo}) atendido com sucesso.
            </p>
            <div className="flex gap-3">
              <button
                onClick={imprimirPrescricao}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-[10px] px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                🖨️ Imprimir prescrição
              </button>
              <button
                onClick={() => setFichaFinalizada(null)}
                className="border border-border rounded-[10px] px-5 py-3 text-sm font-semibold hover:bg-surface2 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Medico;
