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
    tempoSintomas?: string;
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

const CIDS_COMUNS = [
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'E11', descricao: 'Diabetes mellitus tipo 2' },
  { codigo: 'M54.5', descricao: 'Lombalgia' },
  { codigo: 'J00', descricao: 'Rinofaringite aguda (resfriado comum)' },
  { codigo: 'A09', descricao: 'Diarreia e gastroenterite de origem infecciosa presumível' },
  { codigo: 'F32', descricao: 'Episódio depressivo' },
  { codigo: 'Z00.0', descricao: 'Exame médico geral (consulta de rotina)' },
  { codigo: 'Z13', descricao: 'Exames especiais de rastreamento (screening)' },
  { codigo: 'G43.9', descricao: 'Enxaqueca não especificada' },
];

export const CID_POR_ESPECIALIDADE: Record<string, { codigo: string; descricao: string }[]> = {
  'Clínica Médica': CIDS_COMUNS,
  'Pediatria': CIDS_COMUNS,
};

// ============================================================================
// Verificação de contraindicações medicamentosas por comorbidade
// ============================================================================
export interface Contraindicacao {
  comorbidade: string;
  keywords: string[];
  medicamentos: { nome: string; motivo: string }[];
}

export const CONTRAINDICACOES: Contraindicacao[] = [
  {
    comorbidade: 'Hipertensão arterial',
    keywords: [
      'hipertens', 'hipertenso', 'hipertensa',
      'press[aã]o\\s*(arterial\\s*)?(alta|elevada)',
      '\\bp\\.?\\s*a\\.?\\s*(alta|elevada)\\b',
      '\\bhas\\b', '\\bhta\\b',
      'pressao do sangue alta', 'pressão do sangue alta',
    ],
    medicamentos: [
      { nome: 'ibuprofeno', motivo: 'AINE eleva a pressão arterial e reduz efeito de anti-hipertensivos' },
      { nome: 'diclofenaco', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'naproxeno', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'cetoprofeno', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'pseudoefedrina', motivo: 'Vasoconstritor — eleva a pressão arterial' },
      { nome: 'prednisona', motivo: 'Corticoide — retém sódio e eleva a pressão' },
    ],
  },
  {
    comorbidade: 'Diabetes mellitus',
    keywords: [
      'diabet', 'diabete', 'diabetico', 'diabetica',
      '\\bdm\\b', '\\bdm\\s*(1|2|i|ii|tipo)',
      'a[çc]ucar\\s*(alto|elevado)', 'glicemia\\s*alta', 'glicose\\s*alta',
      'insulino\\s*dependente', 'insulinodependente',
    ],
    medicamentos: [
      { nome: 'prednisona', motivo: 'Corticoide eleva significativamente a glicemia' },
      { nome: 'dexametasona', motivo: 'Corticoide eleva significativamente a glicemia' },
      { nome: 'hidrocortisona', motivo: 'Corticoide eleva a glicemia' },
      { nome: 'xarope com açúcar', motivo: 'Contém sacarose — descompensa glicemia' },
    ],
  },
  {
    comorbidade: 'Asma / DPOC',
    keywords: [
      'asma', 'asmatic', '\\bdpoc\\b', 'bronquit', 'enfisema',
      'doen[çc]a\\s*pulmonar\\s*obstrutiva', 'broncoespasmo',
      'falta\\s*de\\s*ar\\s*cr[oô]nica', 'chiado\\s*no\\s*peito',
    ],
    medicamentos: [
      { nome: 'propranolol', motivo: 'Betabloqueador não seletivo — pode desencadear broncoespasmo' },
      { nome: 'atenolol', motivo: 'Betabloqueador — risco de broncoespasmo' },
      { nome: 'aspirina', motivo: 'AAS pode desencadear crise asmática' },
      { nome: 'aas', motivo: 'AAS pode desencadear crise asmática' },
      { nome: 'ibuprofeno', motivo: 'AINE pode desencadear broncoespasmo em asmáticos' },
    ],
  },
  {
    comorbidade: 'Insuficiência renal',
    keywords: [
      'insufici[eê]ncia\\s*renal', 'insuf\\.?\\s*renal',
      '\\birc\\b', '\\bdrc\\b', '\\blra\\b',
      'nefropat', 'doen[çc]a\\s*renal', 'problema\\s*(no|nos)\\s*rim',
      'rim\\s*(ruim|fraco|doente)', 'rins\\s*(ruins|fracos|doentes)',
      'di[aá]lise', 'hemodi[aá]lise',
    ],
    medicamentos: [
      { nome: 'ibuprofeno', motivo: 'AINE é nefrotóxico — agrava função renal' },
      { nome: 'diclofenaco', motivo: 'AINE é nefrotóxico' },
      { nome: 'naproxeno', motivo: 'AINE é nefrotóxico' },
      { nome: 'cetoprofeno', motivo: 'AINE é nefrotóxico' },
      { nome: 'gentamicina', motivo: 'Aminoglicosídeo — nefrotóxico' },
      { nome: 'metformina', motivo: 'Risco de acidose láctica em insuficiência renal' },
    ],
  },
  {
    comorbidade: 'Insuficiência cardíaca',
    keywords: [
      'insufici[eê]ncia\\s*card[ií]aca', 'insuf\\.?\\s*card',
      '\\bicc\\b', '\\bic\\s*(descompensada|congestiva)',
      'cardiopat', 'problema\\s*(no\\s*)?cora[çc][aã]o',
      'cora[çc][aã]o\\s*(fraco|dilatado|doente)',
    ],
    medicamentos: [
      { nome: 'ibuprofeno', motivo: 'AINE causa retenção hídrica e descompensa IC' },
      { nome: 'diclofenaco', motivo: 'AINE causa retenção hídrica' },
      { nome: 'naproxeno', motivo: 'AINE causa retenção hídrica' },
      { nome: 'pioglitazona', motivo: 'Agrava insuficiência cardíaca' },
    ],
  },
  {
    comorbidade: 'Gestação',
    keywords: [
      'gestant', 'gesta[çc][aã]o', 'gr[aá]vid', 'gravidez',
      'gestando', 'esperando\\s*beb[eê]', '\\bgesta\\b',
      'pr[eé]\\-?natal', 'pre\\s*natal',
      '\\d+\\s*(semanas?|meses?)\\s*de\\s*gesta',
    ],
    medicamentos: [
      { nome: 'misoprostol', motivo: 'Abortivo — contraindicado na gestação' },
      { nome: 'isotretinoína', motivo: 'Teratogênico' },
      { nome: 'isotretinoina', motivo: 'Teratogênico' },
      { nome: 'varfarina', motivo: 'Teratogênico' },
      { nome: 'enalapril', motivo: 'IECA — teratogênico (2º e 3º trimestres)' },
      { nome: 'losartana', motivo: 'BRA — teratogênico' },
      { nome: 'tetraciclina', motivo: 'Altera formação óssea e dentária do feto' },
      { nome: 'doxiciclina', motivo: 'Altera formação óssea e dentária do feto' },
      { nome: 'ibuprofeno', motivo: 'AINE contraindicado no 3º trimestre' },
    ],
  },
  {
    comorbidade: 'Úlcera / Gastrite',
    keywords: [
      '[uú]lcera', 'gastrit', 'refluxo', '\\bdrge\\b',
      'esofagit', 'azia', 'queima[çc][aã]o\\s*(no\\s*)?est[oô]mago',
      'h\\.?\\s*pylori', 'helicobacter',
      'dor\\s*no\\s*est[oô]mago\\s*cr[oô]nica',
    ],
    medicamentos: [
      { nome: 'aspirina', motivo: 'AAS lesiona mucosa gástrica' },
      { nome: 'aas', motivo: 'AAS lesiona mucosa gástrica' },
      { nome: 'ibuprofeno', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'diclofenaco', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'naproxeno', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'cetoprofeno', motivo: 'AINE agrava úlcera/gastrite' },
    ],
  },
  {
    comorbidade: 'Hepatopatia',
    keywords: [
      'hepat', 'hepatite', 'f[ií]gado', 'cirrose',
      'esteatose\\s*hep[aá]tica', 'doen[çc]a\\s*hep[aá]tica',
      'problema\\s*(no\\s*)?f[ií]gado', 'f[ií]gado\\s*(ruim|gordo|doente)',
      'insufici[eê]ncia\\s*hep[aá]tica',
    ],
    medicamentos: [
      { nome: 'paracetamol', motivo: 'Hepatotóxico em doses elevadas — usar com cautela' },
      { nome: 'metotrexato', motivo: 'Hepatotóxico' },
      { nome: 'isoniazida', motivo: 'Hepatotóxico' },
      { nome: 'cetoconazol', motivo: 'Hepatotóxico' },
    ],
  },
];

// Normaliza texto: minúsculo, sem acentos, espaços colapsados
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Compila um padrão (string keyword) em RegExp tolerante a acentos.
// Aceita tanto strings simples (substring) quanto padrões regex (com \b, [], etc.)
function compilarPadrao(pattern: string): RegExp {
  // Remove acentos do próprio padrão para casar contra texto normalizado
  const semAcento = pattern
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  try {
    return new RegExp(semAcento, 'i');
  } catch {
    // Se não for regex válida, escapa e usa como literal
    const escaped = semAcento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  }
}

export function detectarComorbidades(texto: string): Contraindicacao[] {
  if (!texto) return [];
  const t = normalizar(texto);
  if (!t || t === 'nenhuma' || t === 'nenhum' || t === 'nao' || t === 'n/a') return [];
  return CONTRAINDICACOES.filter(c =>
    c.keywords.some(k => compilarPadrao(k).test(t))
  );
}

export interface AlertaContraindicacao {
  comorbidade: string;
  medicamento: string;
  motivo: string;
}

export function verificarContraindicacoes(
  comorbidadeTexto: string,
  medicamentosTexto: string
): AlertaContraindicacao[] {
  const ativas = detectarComorbidades(comorbidadeTexto);
  if (ativas.length === 0 || !medicamentosTexto) return [];
  const medLower = medicamentosTexto.toLowerCase();
  const alertas: AlertaContraindicacao[] = [];
  for (const c of ativas) {
    for (const m of c.medicamentos) {
      if (medLower.includes(m.nome.toLowerCase())) {
        alertas.push({ comorbidade: c.comorbidade, medicamento: m.nome, motivo: m.motivo });
      }
    }
  }
  return alertas;
}

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
