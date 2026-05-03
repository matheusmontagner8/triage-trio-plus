import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import TriageProtocol from '@/components/TriageProtocol';
import { 
  getAllPacientes, 
  updateFicha, 
  processarTriagemGemini, 
  getSession, 
  clearSession,
  type Paciente 
} from '@/lib/store';

const COLOR_MAP: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  VERMELHO: { dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  LARANJA: { dot: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  AMARELO: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  VERDE: { dot: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

const Enfermagem = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(false);
  const [vitais, setVitais] = useState({ temp: '', sys: '', dia: '', sat: '', fc: '', gli: '', fr: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [resultadoTriagem, setResultadoTriagem] = useState<any>(null);

  useEffect(() => {
    if (!session || session.role !== 'enfermagem') { navigate('/'); return; }
    refreshList();
  }, []);

  const refreshList = () => setPacientes(getAllPacientes().filter(p => !p.triado));

 const salvarSinais = async () => {
  if (!selected) return;
  
  // Bloqueia múltiplas tentativas
  setLoading(true);
  setErro('');

  try {
    // Validação básica: impede envio se campos críticos estiverem vazios
    if (!vitais.temp || !vitais.sys || !vitais.dia) {
      throw new Error("Preencha ao menos Temperatura e Pressão Arterial.");
    }

    // Preparação dos dados para a IA (Evitando zeros irreais com undefined)
    const sinaisFormatados = {
      temperatura: parseFloat(vitais.temp) || undefined,
      pressaoSistolica: parseInt(vitais.sys) || undefined,
      pressaoDiastolica: parseInt(vitais.dia) || undefined,
      saturacaoO2: parseFloat(vitais.sat) || undefined,
      frequenciaCardiaca: parseInt(vitais.fc) || undefined,
      glicemia: parseFloat(vitais.gli) || undefined,
      frequenciaRespiratoria: parseInt(vitais.fr) || undefined,
    };

    // Usando variável de ambiente para proteger a chave
    const apiKey = "AIzaSyAYgw8Qaw4IvwmezYhymP_WkSmfMkRDFgA"; 
    
    if (!apiKey) {
        throw new Error("API Key não configurada. Verifique suas variáveis de ambiente.");
    }

    // Chamada para o Motor de IA
    const respostaIA = await processarTriagemGemini(
      { ...selected, ...sinaisFormatados }, 
      apiKey
    );

    // PERSISTÊNCIA LOCAL: Salva no "banco" (localStorage) e marca como triado
    updateFicha(selected.codigo, {
      ...sinaisFormatados,
      triagem: respostaIA,
      triado: true 
    });

    // Atualiza o estado visual
    setResultadoTriagem(respostaIA);
    setSucesso(true);

    // Limpa a seleção após um tempo para o usuário ver o resultado
    setTimeout(() => {
      refreshList(); // Recarrega a fila (removendo o paciente já triado)
      setSelected(null);
      setSucesso(false);
      setVitais({ temp: '', sys: '', dia: '', sat: '', fc: '', gli: '', fr: '' });
    }, 4000);

  } catch (err: any) {
    setErro(err.message || "Falha ao processar dados.");
    console.error("Erro na triagem:", err);
  } finally {
    setLoading(false);
  }
};

  const colors = resultadoTriagem ? COLOR_MAP[resultadoTriagem.cor] : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 border-r p-8 bg-card flex flex-col gap-6">
        <Logo subtitle="Enfermagem" />
        <TriageProtocol />
        <button onClick={() => { clearSession(); navigate('/'); }} className="mt-auto text-sm text-primary hover:underline">Sair</button>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-8">Triagem de Pacientes</h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-semibold">Fila de Espera</h2>
            {pacientes.map(p => (
              <div 
                key={p.codigo} 
                onClick={() => setSelected(p)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${selected?.codigo === p.codigo ? 'border-primary bg-primary/5' : 'bg-card'}`}
              >
                <p className="font-bold">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.sintomas}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border rounded-2xl p-6">
            {selected ? (
              <>
                <h3 className="font-bold mb-4">Sinais Vitais - {selected.nome}</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <input 
                      placeholder="Temp (°C)" 
                      className="border p-2 rounded" 
                      value={vitais.temp} 
                      onChange={e => setVitais({...vitais, temp: e.target.value})} 
                    />
                    <input 
                      placeholder="PA Sistólica" 
                      className="border p-2 rounded" 
                      value={vitais.sys} 
                      onChange={e => setVitais({...vitais, sys: e.target.value})} 
                    />
                    <input 
                      placeholder="PA Diastólica" 
                      className="border p-2 rounded" 
                      value={vitais.dia} 
                      onChange={e => setVitais({...vitais, dia: e.target.value})} 
                    />
                    <input 
                      placeholder="Saturação O2" 
                      className="border p-2 rounded" 
                      value={vitais.sat} 
                      onChange={e => setVitais({...vitais, sat: e.target.value})} 
                    />
                    {/* NOVO INPUT ADICIONADO ABAIXO */}
                    <input 
                      placeholder="Frequência Cardíaca" 
                      className="border p-2 rounded" 
                      value={vitais.fc} 
                      onChange={e => setVitais({...vitais, fc: e.target.value})} 
                    />
                  </div>
                
                {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

                <button 
                  disabled={loading}
                  onClick={salvarSinais}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold"
                >
                  {loading ? "PROCESSANDO..." : "CLASSIFICAR COM IA"}
                </button>
              </>
            ) : <p className="text-muted-foreground">Selecione um paciente na fila.</p>}

            {sucesso && colors && (
              <div className={`mt-6 p-4 rounded-lg border ${colors.bg} ${colors.border} text-center animate-bounce`}>
                <p className={`font-black ${colors.text}`}>CLASSIFICAÇÃO: {resultadoTriagem.cor}</p>
                <p className="text-sm">Tempo de espera: {resultadoTriagem.tempo}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Enfermagem;