// Types
export interface Paciente {
  codigo: string;
  nome: string;
  idade: string;
  sintomas: string;
  alergia: string;
  comorbidade: string;
  timestamp: string;
  processado: boolean;
  // Vital signs (filled by nursing)
  temperatura?: number;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  saturacaoO2?: number;
  frequenciaCardiaca?: number;
  glicemia?: number;
  frequenciaRespiratoria?: number;
  triado?: boolean;
  // Triage result (set by nursing)
  triagem?: {
    cor: string;
    urgencia: string;
    tempo: string;
    alertas: string[];
  };
  especialidade?: string;
  // Doctor call
  chamado?: boolean;
  medicoResponsavel?: string;
  // Prescription
  prescricao?: {
    cid?: string;
    diagnostico: string;
    medicamentos: string;
    procedimentos: string;
    observacoes: string;
    dataAtendimento: string;
  };
  atendido?: boolean;
}

export interface UserSession {
  role: 'recepcao' | 'enfermagem' | 'medico';
  nome: string;
  especialidade?: string;
}

export const ESPECIALIDADES = [
  { id: 'clinica', nome: 'Clínica Médica', desc: 'Atendimento geral e integral' },
  { id: 'pediatria', nome: 'Pediatria', desc: 'Saúde de crianças e adolescentes' },
];

export const CID_POR_ESPECIALIDADE: Record<string, { codigo: string; descricao: string }[]> = {
  'Clínica Médica': [
    { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
    { codigo: 'E11', descricao: 'Diabetes mellitus tipo 2' },
    { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores' },
    { codigo: 'J11', descricao: 'Influenza (gripe)' },
    { codigo: 'J18', descricao: 'Pneumonia não especificada' },
    { codigo: 'K29', descricao: 'Gastrite e duodenite' },
    { codigo: 'K52.9', descricao: 'Gastroenterite e colite não infecciosas' },
    { codigo: 'N39.0', descricao: 'Infecção do trato urinário' },
    { codigo: 'R10.4', descricao: 'Dor abdominal não especificada' },
    { codigo: 'R51', descricao: 'Cefaleia' },
    { codigo: 'R50.9', descricao: 'Febre não especificada' },
    { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  ],
  'Pediatria': [
    { codigo: 'J00', descricao: 'Nasofaringite aguda (resfriado comum)' },
    { codigo: 'J03.9', descricao: 'Amigdalite aguda' },
    { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores' },
    { codigo: 'J21', descricao: 'Bronquiolite aguda' },
    { codigo: 'H66.9', descricao: 'Otite média não especificada' },
    { codigo: 'A09', descricao: 'Diarreia e gastroenterite (origem infecciosa)' },
    { codigo: 'B01', descricao: 'Varicela' },
    { codigo: 'B05', descricao: 'Sarampo' },
    { codigo: 'B08.4', descricao: 'Exantema viral' },
    { codigo: 'L20', descricao: 'Dermatite atópica' },
    { codigo: 'R50.9', descricao: 'Febre não especificada' },
    { codigo: 'R11', descricao: 'Náusea e vômito' },
  ],
};


export function getFichas(): Record<string, Paciente> {
  return JSON.parse(localStorage.getItem('triagem_fichas') || '{}');
}

export function saveFicha(paciente: Paciente) {
  const fichas = getFichas();
  fichas[paciente.codigo] = paciente;
  fichas['__nome__' + paciente.nome.toLowerCase().replace(/\s+/g, '_')] = paciente.codigo as any;
  localStorage.setItem('triagem_fichas', JSON.stringify(fichas));
}

export function getAllPacientes(): Paciente[] {
  const fichas = getFichas();
  return Object.entries(fichas)
    .filter(([key]) => !key.startsWith('__'))
    .map(([, val]) => val as Paciente);
}

export function updateFicha(codigo: string, updates: Partial<Paciente>) {
  const fichas = getFichas();
  if (fichas[codigo]) {
    fichas[codigo] = { ...fichas[codigo], ...updates };
    localStorage.setItem('triagem_fichas', JSON.stringify(fichas));
  }
}

export function buscarPaciente(query: string): Paciente | null {
  const fichas = getFichas();
  if (fichas[query] && !query.startsWith('__')) return fichas[query] as Paciente;
  
  const chaveNome = '__nome__' + query.toLowerCase().replace(/\s+/g, '_');
  if (fichas[chaveNome]) return fichas[fichas[chaveNome] as any] as Paciente;
  
  const nomeLower = query.toLowerCase();
  for (const [key, val] of Object.entries(fichas)) {
    if (key.startsWith('__')) continue;
    const p = val as Paciente;
    if (p.nome?.toLowerCase().includes(nomeLower)) return p;
  }
  return null;
}

export function gerarCodigo(nome: string): string {
  const initials = nome.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const num = Math.floor(1000 + Math.random() * 9000);
  return initials + num;
}

export function getSession(): UserSession | null {
  const s = localStorage.getItem('triagem_session');
  return s ? JSON.parse(s) : null;
}

export function setSession(session: UserSession) {
  localStorage.setItem('triagem_session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('triagem_session');
}

export function fallbackTriage(
  temp: number, sys: number, dia: number,
  satO2?: number, fc?: number, glicemia?: number, fr?: number
) {
  let cor = 'VERDE', urgencia = 'Pouco urgente', tempo = '120 min', alertas: string[] = [];

  // Critical
  if (temp > 40 || temp < 35 || sys > 180 || dia > 120 || (satO2 !== undefined && satO2 < 90) || (fc !== undefined && (fc > 150 || fc < 40)) || (glicemia !== undefined && (glicemia < 50 || glicemia > 400)) || (fr !== undefined && (fr > 35 || fr < 8))) {
    cor = 'VERMELHO'; urgencia = 'Emergência'; tempo = 'Imediato';
    if (temp > 40 || temp < 35) alertas.push('Temperatura crítica');
    if (sys > 180 || dia > 120) alertas.push('Pressão arterial crítica');
    if (satO2 !== undefined && satO2 < 90) alertas.push('Saturação O₂ crítica');
    if (fc !== undefined && (fc > 150 || fc < 40)) alertas.push('Frequência cardíaca crítica');
    if (glicemia !== undefined && (glicemia < 50 || glicemia > 400)) alertas.push('Glicemia crítica');
    if (fr !== undefined && (fr > 35 || fr < 8)) alertas.push('Frequência respiratória crítica');
  }
  // Very urgent
  else if (temp > 39 || sys > 160 || dia > 100 || (satO2 !== undefined && satO2 < 93) || (fc !== undefined && (fc > 130 || fc < 50)) || (glicemia !== undefined && (glicemia < 70 || glicemia > 300)) || (fr !== undefined && (fr > 28 || fr < 10))) {
    cor = 'LARANJA'; urgencia = 'Muito urgente'; tempo = '10 min';
  }
  // Urgent
  else if (temp >= 38 || sys >= 140 || dia >= 90 || (satO2 !== undefined && satO2 < 95) || (fc !== undefined && (fc > 110 || fc < 55)) || (glicemia !== undefined && (glicemia < 80 || glicemia > 200)) || (fr !== undefined && (fr > 24 || fr < 12))) {
    cor = 'AMARELO'; urgencia = 'Urgente'; tempo = '60 min';
  }

  return { cor, urgencia, tempo, alertas };
}
