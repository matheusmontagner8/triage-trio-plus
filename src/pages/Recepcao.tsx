import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { gerarCodigo, saveFicha, getSession, clearSession } from '@/lib/store';

const Recepcao = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [alergia, setAlergia] = useState('Não');
  const [alergiaQual, setAlergiaQual] = useState('');
  const [comorbidade, setComorbidade] = useState('');
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  if (!session || session.role !== 'recepcao') {
    navigate('/');
    return null;
  }

  const enviar = () => {
    setErro('');
    if (!nome.trim()) { setErro('Por favor, informe o nome completo.'); return; }
    if (!idade.trim()) { setErro('Por favor, informe a idade.'); return; }

    const alergiaFinal = alergia === 'Sim'
      ? (alergiaQual.trim() || 'Alergia relatada (medicamento não especificado)')
      : 'Nenhuma';

    const codigo = gerarCodigo(nome);
    saveFicha({
      codigo,
      nome: nome.trim(),
      idade: idade.trim(),
      sintomas: sintomas.trim() || 'Não relatados',
      alergia: alergiaFinal,
      comorbidade: comorbidade.trim() || 'Nenhuma',
      timestamp: new Date().toISOString(),
      processado: false,
    });

    setSucesso(codigo);
  };

  const novaFicha = () => {
    setNome(''); setIdade(''); setSintomas(''); setAlergia('Não');
    setAlergiaQual(''); setComorbidade(''); setSucesso(null); setErro('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-card border border-border rounded-[20px] p-12 w-full max-w-[600px]">
        <div className="flex items-center justify-between mb-7">
          <Logo subtitle="Recepção" />
          <button onClick={() => { clearSession(); navigate('/'); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sair ({session.nome})
          </button>
        </div>

        <h1 className="font-heading text-[26px] font-extrabold mb-1.5">Ficha do Paciente</h1>
        <p className="text-sm text-muted-foreground mb-8">Preencha os dados abaixo para iniciar o atendimento.</p>

        {!sucesso ? (
          <>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3.5 flex items-center gap-2">
              Dados pessoais <span className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-muted-foreground mr-1.5">1</span>
                  Nome completo
                </label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maria Aparecida Silva"
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-muted-foreground mr-1.5">2</span>
                  Idade
                </label>
                <input type="number" value={idade} onChange={(e) => setIdade(e.target.value)} placeholder="Ex: 45" min={0} max={130}
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3.5 flex items-center gap-2">
              Saúde e sintomas <span className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-muted-foreground mr-1.5">3</span>
                  Sintomas que está sentindo
                </label>
                <textarea value={sintomas} onChange={(e) => setSintomas(e.target.value)} placeholder="Descreva o que está sentindo: dor, tontura, febre, etc."
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-y min-h-[80px] leading-relaxed" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-muted-foreground mr-1.5">4</span>
                  Possui alergia a algum medicamento?
                </label>
                <select value={alergia} onChange={(e) => { setAlergia(e.target.value); if (e.target.value === 'Não') setAlergiaQual(''); }}
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors">
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>
              {alergia === 'Sim' && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className="text-xs text-muted-foreground">Qual(is) medicamento(s)?</label>
                  <input value={alergiaQual} onChange={(e) => setAlergiaQual(e.target.value)} placeholder="Ex: Dipirona, Penicilina..."
                    className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
                  <span className="text-[11px] text-muted-foreground">Separe por vírgula se houver mais de um.</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-muted-foreground mr-1.5">5</span>
                  Doenças ou comorbidades pré-existentes
                </label>
                <input value={comorbidade} onChange={(e) => setComorbidade(e.target.value)} placeholder="Ex: Diabetes, Hipertensão..."
                  className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            {erro && <p className="text-destructive text-sm mt-3">{erro}</p>}

            <button onClick={enviar}
              className="w-full bg-accent text-accent-foreground rounded-[10px] py-3.5 text-sm font-semibold font-heading mt-7 flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.99] transition-all">
              <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]"><path d="M3 10h14M10 4l6 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Enviar para triagem
            </button>
          </>
        ) : (
          <div className="bg-triage-green-bg border border-triage-green-border rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">✓</div>
            <div className="font-heading font-bold text-base text-triage-green mb-1">Dados enviados com sucesso!</div>
            <p className="text-sm text-muted-foreground mb-3">Informe o código abaixo ao profissional de saúde:</p>
            <div className="font-mono text-[22px] font-medium text-triage-green tracking-[0.12em] mb-1">{sucesso}</div>
            <p className="text-[11px] text-muted-foreground mb-4">O médico usará este código para localizar a ficha.</p>
            <button onClick={novaFicha} className="bg-surface2 border border-border rounded-lg px-4 py-2 text-sm hover:border-primary transition-colors">
              Nova ficha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recepcao;
