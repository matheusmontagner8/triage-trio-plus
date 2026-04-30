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
  // Cardiovascular / metabólico
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'I11', descricao: 'Doença cardíaca hipertensiva' },
  { codigo: 'I25', descricao: 'Doença isquêmica crônica do coração' },
  { codigo: 'I50', descricao: 'Insuficiência cardíaca' },
  { codigo: 'E11', descricao: 'Diabetes mellitus tipo 2' },
  { codigo: 'E10', descricao: 'Diabetes mellitus tipo 1' },
  { codigo: 'E78.0', descricao: 'Hipercolesterolemia pura' },
  { codigo: 'E78.5', descricao: 'Dislipidemia não especificada' },
  { codigo: 'E66', descricao: 'Obesidade' },
  { codigo: 'E03.9', descricao: 'Hipotireoidismo não especificado' },
  { codigo: 'E05.9', descricao: 'Hipertireoidismo não especificado' },
  { codigo: 'E79.0', descricao: 'Hiperuricemia (gota)' },

  // Respiratório
  { codigo: 'J00', descricao: 'Rinofaringite aguda (resfriado comum)' },
  { codigo: 'J02.9', descricao: 'Faringite aguda não especificada' },
  { codigo: 'J03.9', descricao: 'Amigdalite aguda não especificada' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores' },
  { codigo: 'J20', descricao: 'Bronquite aguda' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'J45', descricao: 'Asma' },
  { codigo: 'J44', descricao: 'DPOC (doença pulmonar obstrutiva crônica)' },
  { codigo: 'J30.4', descricao: 'Rinite alérgica não especificada' },
  { codigo: 'J01.9', descricao: 'Sinusite aguda não especificada' },

  // Gastrointestinal
  { codigo: 'A09', descricao: 'Diarreia e gastroenterite de origem infecciosa presumível' },
  { codigo: 'K21', descricao: 'Doença do refluxo gastroesofágico (DRGE)' },
  { codigo: 'K29.7', descricao: 'Gastrite não especificada' },
  { codigo: 'K30', descricao: 'Dispepsia funcional' },
  { codigo: 'K59.0', descricao: 'Constipação intestinal' },
  { codigo: 'K58', descricao: 'Síndrome do intestino irritável' },

  // Urinário
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário (ITU)' },
  { codigo: 'N20.0', descricao: 'Cálculo renal' },

  // Musculoesquelético / dor
  { codigo: 'M54.5', descricao: 'Lombalgia' },
  { codigo: 'M54.2', descricao: 'Cervicalgia' },
  { codigo: 'M25.5', descricao: 'Dor articular' },
  { codigo: 'M79.1', descricao: 'Mialgia' },
  { codigo: 'M19.9', descricao: 'Osteoartrose não especificada' },
  { codigo: 'M06.9', descricao: 'Artrite reumatoide não especificada' },
  { codigo: 'M81.9', descricao: 'Osteoporose não especificada' },

  // Neurológico
  { codigo: 'G43.9', descricao: 'Enxaqueca não especificada' },
  { codigo: 'G44.2', descricao: 'Cefaleia tensional' },
  { codigo: 'R51', descricao: 'Cefaleia' },
  { codigo: 'G47.0', descricao: 'Distúrbios do início e manutenção do sono (insônia)' },

  // Saúde mental
  { codigo: 'F32', descricao: 'Episódio depressivo' },
  { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada' },
  { codigo: 'F41.0', descricao: 'Transtorno de pânico' },
  { codigo: 'F43.0', descricao: 'Reação aguda ao estresse' },

  // Pele
  { codigo: 'L20', descricao: 'Dermatite atópica' },
  { codigo: 'L23', descricao: 'Dermatite de contato alérgica' },
  { codigo: 'L30.9', descricao: 'Dermatite não especificada' },
  { codigo: 'B02', descricao: 'Herpes zoster' },

  // Sintomas gerais
  { codigo: 'R50.9', descricao: 'Febre não especificada' },
  { codigo: 'R10.4', descricao: 'Dor abdominal não especificada' },
  { codigo: 'R11', descricao: 'Náusea e vômito' },
  { codigo: 'R05', descricao: 'Tosse' },
  { codigo: 'R42', descricao: 'Tontura e instabilidade' },
  { codigo: 'R53', descricao: 'Mal-estar e fadiga' },
  { codigo: 'D50.9', descricao: 'Anemia por deficiência de ferro não especificada' },

  // Rotina / preventivo
  { codigo: 'Z00.0', descricao: 'Exame médico geral (consulta de rotina)' },
  { codigo: 'Z13', descricao: 'Exames especiais de rastreamento (screening)' },
  { codigo: 'Z76.3', descricao: 'Pessoa em situação saudável acompanhando enfermo' },
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
      { nome: 'nimesulida', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'piroxicam', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'meloxicam', motivo: 'AINE eleva a pressão arterial' },
      { nome: 'celecoxibe', motivo: 'AINE COX-2 eleva pressão e risco cardiovascular' },
      { nome: 'etoricoxibe', motivo: 'AINE COX-2 eleva pressão e risco cardiovascular' },
      { nome: 'pseudoefedrina', motivo: 'Vasoconstritor — eleva a pressão arterial' },
      { nome: 'fenilefrina', motivo: 'Vasoconstritor — eleva a pressão arterial' },
      { nome: 'efedrina', motivo: 'Vasoconstritor — eleva a pressão arterial' },
      { nome: 'prednisona', motivo: 'Corticoide — retém sódio e eleva a pressão' },
      { nome: 'prednisolona', motivo: 'Corticoide — retém sódio e eleva a pressão' },
      { nome: 'dexametasona', motivo: 'Corticoide — retém sódio e eleva a pressão' },
      { nome: 'sibutramina', motivo: 'Eleva pressão arterial e frequência cardíaca' },
      { nome: 'metilfenidato', motivo: 'Estimulante — eleva pressão arterial' },
      { nome: 'venlafaxina', motivo: 'Pode elevar a pressão arterial em doses altas' },
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
      { nome: 'prednisolona', motivo: 'Corticoide eleva significativamente a glicemia' },
      { nome: 'dexametasona', motivo: 'Corticoide eleva significativamente a glicemia' },
      { nome: 'hidrocortisona', motivo: 'Corticoide eleva a glicemia' },
      { nome: 'betametasona', motivo: 'Corticoide eleva a glicemia' },
      { nome: 'metilprednisolona', motivo: 'Corticoide eleva a glicemia' },
      { nome: 'olanzapina', motivo: 'Antipsicótico — causa hiperglicemia e ganho de peso' },
      { nome: 'clozapina', motivo: 'Antipsicótico — causa hiperglicemia' },
      { nome: 'quetiapina', motivo: 'Antipsicótico — causa hiperglicemia' },
      { nome: 'tiazida', motivo: 'Diurético tiazídico eleva glicemia em altas doses' },
      { nome: 'hidroclorotiazida', motivo: 'Diurético tiazídico eleva glicemia' },
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
      { nome: 'metoprolol', motivo: 'Betabloqueador — risco de broncoespasmo em altas doses' },
      { nome: 'carvedilol', motivo: 'Betabloqueador não seletivo — risco de broncoespasmo' },
      { nome: 'timolol', motivo: 'Betabloqueador — risco de broncoespasmo (mesmo colírio)' },
      { nome: 'aspirina', motivo: 'AAS pode desencadear crise asmática (asma por AINE)' },
      { nome: 'aas', motivo: 'AAS pode desencadear crise asmática' },
      { nome: 'ácido acetilsalicílico', motivo: 'AAS pode desencadear crise asmática' },
      { nome: 'acido acetilsalicilico', motivo: 'AAS pode desencadear crise asmática' },
      { nome: 'ibuprofeno', motivo: 'AINE pode desencadear broncoespasmo em asmáticos' },
      { nome: 'diclofenaco', motivo: 'AINE pode desencadear broncoespasmo' },
      { nome: 'naproxeno', motivo: 'AINE pode desencadear broncoespasmo' },
      { nome: 'codeína', motivo: 'Opioide — depressão respiratória' },
      { nome: 'codeina', motivo: 'Opioide — depressão respiratória' },
      { nome: 'morfina', motivo: 'Opioide — depressão respiratória' },
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
      { nome: 'nimesulida', motivo: 'AINE é nefrotóxico' },
      { nome: 'piroxicam', motivo: 'AINE é nefrotóxico' },
      { nome: 'meloxicam', motivo: 'AINE é nefrotóxico' },
      { nome: 'gentamicina', motivo: 'Aminoglicosídeo — nefrotóxico' },
      { nome: 'amicacina', motivo: 'Aminoglicosídeo — nefrotóxico' },
      { nome: 'vancomicina', motivo: 'Nefrotóxico — exige ajuste de dose' },
      { nome: 'anfotericina', motivo: 'Nefrotóxico grave' },
      { nome: 'metformina', motivo: 'Risco de acidose láctica em insuficiência renal' },
      { nome: 'enoxaparina', motivo: 'Acumula em IR — risco hemorrágico' },
      { nome: 'lítio', motivo: 'Nefrotóxico e acumula em IR' },
      { nome: 'litio', motivo: 'Nefrotóxico e acumula em IR' },
      { nome: 'contraste iodado', motivo: 'Nefrotoxicidade por contraste' },
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
      { nome: 'nimesulida', motivo: 'AINE causa retenção hídrica' },
      { nome: 'celecoxibe', motivo: 'AINE COX-2 — risco cardiovascular' },
      { nome: 'pioglitazona', motivo: 'Agrava insuficiência cardíaca' },
      { nome: 'rosiglitazona', motivo: 'Agrava insuficiência cardíaca' },
      { nome: 'verapamil', motivo: 'Bloqueador de cálcio — deprime contratilidade' },
      { nome: 'diltiazem', motivo: 'Bloqueador de cálcio — deprime contratilidade' },
      { nome: 'flecainida', motivo: 'Antiarrítmico contraindicado em IC' },
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
      { nome: 'isotretinoína', motivo: 'Teratogênico grave' },
      { nome: 'isotretinoina', motivo: 'Teratogênico grave' },
      { nome: 'talidomida', motivo: 'Teratogênico grave' },
      { nome: 'varfarina', motivo: 'Teratogênico' },
      { nome: 'warfarina', motivo: 'Teratogênico' },
      { nome: 'enalapril', motivo: 'IECA — teratogênico (2º e 3º trimestres)' },
      { nome: 'captopril', motivo: 'IECA — teratogênico' },
      { nome: 'lisinopril', motivo: 'IECA — teratogênico' },
      { nome: 'ramipril', motivo: 'IECA — teratogênico' },
      { nome: 'losartana', motivo: 'BRA — teratogênico' },
      { nome: 'valsartana', motivo: 'BRA — teratogênico' },
      { nome: 'tetraciclina', motivo: 'Altera formação óssea e dentária do feto' },
      { nome: 'doxiciclina', motivo: 'Altera formação óssea e dentária do feto' },
      { nome: 'ciprofloxacino', motivo: 'Quinolona — afeta cartilagem fetal' },
      { nome: 'levofloxacino', motivo: 'Quinolona — afeta cartilagem fetal' },
      { nome: 'metotrexato', motivo: 'Teratogênico e abortivo' },
      { nome: 'fluconazol', motivo: 'Teratogênico em altas doses' },
      { nome: 'sinvastatina', motivo: 'Estatina — contraindicada na gestação' },
      { nome: 'atorvastatina', motivo: 'Estatina — contraindicada na gestação' },
      { nome: 'rosuvastatina', motivo: 'Estatina — contraindicada na gestação' },
      { nome: 'ibuprofeno', motivo: 'AINE contraindicado no 3º trimestre' },
      { nome: 'diclofenaco', motivo: 'AINE contraindicado no 3º trimestre' },
      { nome: 'aspirina', motivo: 'AAS contraindicado no 3º trimestre (dose plena)' },
      { nome: 'fenitoína', motivo: 'Teratogênico — síndrome fetal por hidantoína' },
      { nome: 'fenitoina', motivo: 'Teratogênico' },
      { nome: 'ácido valproico', motivo: 'Teratogênico — defeitos do tubo neural' },
      { nome: 'acido valproico', motivo: 'Teratogênico' },
      { nome: 'valproato', motivo: 'Teratogênico' },
      { nome: 'carbamazepina', motivo: 'Teratogênico' },
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
      { nome: 'ácido acetilsalicílico', motivo: 'AAS lesiona mucosa gástrica' },
      { nome: 'acido acetilsalicilico', motivo: 'AAS lesiona mucosa gástrica' },
      { nome: 'ibuprofeno', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'diclofenaco', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'naproxeno', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'cetoprofeno', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'nimesulida', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'piroxicam', motivo: 'AINE com alto risco gastrointestinal' },
      { nome: 'meloxicam', motivo: 'AINE agrava úlcera/gastrite' },
      { nome: 'prednisona', motivo: 'Corticoide aumenta risco de úlcera' },
      { nome: 'dexametasona', motivo: 'Corticoide aumenta risco de úlcera' },
      { nome: 'alendronato', motivo: 'Bisfosfonato — esofagite/úlcera' },
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
      { nome: 'paracetamol', motivo: 'Hepatotóxico — risco grave em hepatopatas' },
      { nome: 'acetaminofeno', motivo: 'Hepatotóxico — risco grave em hepatopatas' },
      { nome: 'metotrexato', motivo: 'Hepatotóxico' },
      { nome: 'isoniazida', motivo: 'Hepatotóxico' },
      { nome: 'rifampicina', motivo: 'Hepatotóxico' },
      { nome: 'pirazinamida', motivo: 'Hepatotóxico' },
      { nome: 'cetoconazol', motivo: 'Hepatotóxico' },
      { nome: 'fluconazol', motivo: 'Hepatotóxico em altas doses' },
      { nome: 'itraconazol', motivo: 'Hepatotóxico' },
      { nome: 'nimesulida', motivo: 'Hepatotóxico — banido em vários países' },
      { nome: 'amiodarona', motivo: 'Hepatotóxico' },
      { nome: 'sinvastatina', motivo: 'Estatina — risco de hepatotoxicidade' },
      { nome: 'atorvastatina', motivo: 'Estatina — risco de hepatotoxicidade' },
      { nome: 'ácido valproico', motivo: 'Hepatotóxico' },
      { nome: 'valproato', motivo: 'Hepatotóxico' },
    ],
  },
  {
    comorbidade: 'Epilepsia / Convulsões',
    keywords: [
      'epilep', 'convuls', 'crise\\s*convulsiv',
      'ataque\\s*epil[eé]p', 'mal\\s*epil[eé]p',
    ],
    medicamentos: [
      { nome: 'tramadol', motivo: 'Reduz limiar convulsivo' },
      { nome: 'bupropiona', motivo: 'Reduz limiar convulsivo' },
      { nome: 'ciprofloxacino', motivo: 'Quinolona — reduz limiar convulsivo' },
      { nome: 'levofloxacino', motivo: 'Quinolona — reduz limiar convulsivo' },
      { nome: 'imipenem', motivo: 'Reduz limiar convulsivo' },
      { nome: 'clorpromazina', motivo: 'Antipsicótico — reduz limiar convulsivo' },
      { nome: 'metronidazol', motivo: 'Risco de convulsões em altas doses' },
    ],
  },
  {
    comorbidade: 'Glaucoma',
    keywords: ['glaucoma', 'press[aã]o\\s*(intra)?\\s*ocular\\s*alta'],
    medicamentos: [
      { nome: 'atropina', motivo: 'Anticolinérgico — agrava glaucoma de ângulo fechado' },
      { nome: 'escopolamina', motivo: 'Anticolinérgico — agrava glaucoma' },
      { nome: 'amitriptilina', motivo: 'Anticolinérgico — agrava glaucoma' },
      { nome: 'difenidramina', motivo: 'Anti-histamínico anticolinérgico — agrava glaucoma' },
      { nome: 'prometazina', motivo: 'Anticolinérgico — agrava glaucoma' },
      { nome: 'oxibutinina', motivo: 'Anticolinérgico — agrava glaucoma' },
    ],
  },
  {
    comorbidade: 'Hipertireoidismo',
    keywords: [
      'hipertireoid', 'tireoide\\s*hiperativ', 'doen[çc]a\\s*de\\s*graves',
      't4\\s*alto', 'tsh\\s*suprimido',
    ],
    medicamentos: [
      { nome: 'levotiroxina', motivo: 'Hormônio tireoidiano — agrava hipertireoidismo' },
      { nome: 'pseudoefedrina', motivo: 'Simpatomimético — agrava sintomas' },
      { nome: 'amiodarona', motivo: 'Contém iodo — agrava hipertireoidismo' },
    ],
  },
  {
    comorbidade: 'Em uso de anticoagulante',
    keywords: [
      'anticoagul', 'varfarina', 'warfarina', 'marevan',
      'rivaroxabana', 'xarelto', 'apixabana', 'eliquis',
      'dabigatrana', 'pradaxa', 'enoxaparina', 'clexane',
      'heparina', 'usa\\s*marevan',
    ],
    medicamentos: [
      { nome: 'aspirina', motivo: 'AAS aumenta risco hemorrágico com anticoagulante' },
      { nome: 'aas', motivo: 'AAS aumenta risco hemorrágico com anticoagulante' },
      { nome: 'ibuprofeno', motivo: 'AINE potencializa sangramento' },
      { nome: 'diclofenaco', motivo: 'AINE potencializa sangramento' },
      { nome: 'naproxeno', motivo: 'AINE potencializa sangramento' },
      { nome: 'cetoprofeno', motivo: 'AINE potencializa sangramento' },
      { nome: 'clopidogrel', motivo: 'Antiagregante — soma efeito anticoagulante' },
      { nome: 'ginkgo biloba', motivo: 'Aumenta risco de sangramento' },
    ],
  },
  {
    comorbidade: 'Lactação / Amamentação',
    keywords: [
      'lacta[çc][aã]o', 'amamenta', 'aleitamento', 'puerp[eé]rio',
      'amamentando', 'lactante',
    ],
    medicamentos: [
      { nome: 'amiodarona', motivo: 'Contraindicado na lactação' },
      { nome: 'lítio', motivo: 'Excretado no leite — toxicidade no lactente' },
      { nome: 'litio', motivo: 'Excretado no leite — toxicidade no lactente' },
      { nome: 'metotrexato', motivo: 'Contraindicado na lactação' },
      { nome: 'cloranfenicol', motivo: 'Risco de síndrome do bebê cinzento' },
      { nome: 'tetraciclina', motivo: 'Contraindicado na lactação' },
      { nome: 'doxiciclina', motivo: 'Contraindicado na lactação' },
      { nome: 'ciprofloxacino', motivo: 'Contraindicado na lactação' },
      { nome: 'codeína', motivo: 'Risco de depressão respiratória no lactente' },
      { nome: 'codeina', motivo: 'Risco de depressão respiratória no lactente' },
      { nome: 'isotretinoína', motivo: 'Contraindicado na lactação' },
      { nome: 'isotretinoina', motivo: 'Contraindicado na lactação' },
    ],
  },
  {
    comorbidade: 'Alergia a AINE / AAS',
    keywords: [
      'alerg.*\\b(aine|aas|aspirina|ibuprofeno|dipirona|diclofenaco|nimesulida|naproxeno|paracetamol)\\b',
      '\\b(aine|aas|aspirina|ibuprofeno|dipirona|diclofenaco|nimesulida|naproxeno|paracetamol)\\b.*alerg',
    ],
    medicamentos: [
      { nome: 'aspirina', motivo: 'Alergia relatada a AAS/AINE' },
      { nome: 'aas', motivo: 'Alergia relatada a AAS/AINE' },
      { nome: 'ibuprofeno', motivo: 'Alergia relatada a AINE' },
      { nome: 'diclofenaco', motivo: 'Alergia relatada a AINE' },
      { nome: 'naproxeno', motivo: 'Alergia relatada a AINE' },
      { nome: 'cetoprofeno', motivo: 'Alergia relatada a AINE' },
      { nome: 'nimesulida', motivo: 'Alergia relatada a AINE' },
      { nome: 'piroxicam', motivo: 'Alergia relatada a AINE' },
      { nome: 'meloxicam', motivo: 'Alergia relatada a AINE' },
      { nome: 'dipirona', motivo: 'Reatividade cruzada com AINE' },
    ],
  },
  {
    comorbidade: 'Alergia a penicilina / betalactâmicos',
    keywords: [
      'alerg.*\\b(penicilina|amoxicilina|ampicilina|cefalosporina|betalact|beta\\s*lact)\\b',
      '\\b(penicilina|amoxicilina|ampicilina|cefalosporina)\\b.*alerg',
    ],
    medicamentos: [
      { nome: 'penicilina', motivo: 'Alergia a betalactâmicos relatada' },
      { nome: 'amoxicilina', motivo: 'Alergia a betalactâmicos relatada' },
      { nome: 'ampicilina', motivo: 'Alergia a betalactâmicos relatada' },
      { nome: 'cefalexina', motivo: 'Cefalosporina — risco de reação cruzada' },
      { nome: 'cefaclor', motivo: 'Cefalosporina — risco de reação cruzada' },
      { nome: 'ceftriaxona', motivo: 'Cefalosporina — risco de reação cruzada' },
      { nome: 'cefuroxima', motivo: 'Cefalosporina — risco de reação cruzada' },
      { nome: 'oxacilina', motivo: 'Betalactâmico — alergia relatada' },
    ],
  },
  {
    comorbidade: 'Alergia a sulfas',
    keywords: [
      'alerg.*\\b(sulfa|sulfas|bactrim|sulfametoxazol)\\b',
      '\\b(sulfa|sulfas|bactrim)\\b.*alerg',
    ],
    medicamentos: [
      { nome: 'sulfametoxazol', motivo: 'Alergia a sulfas relatada' },
      { nome: 'bactrim', motivo: 'Contém sulfa — alergia relatada' },
      { nome: 'sulfadiazina', motivo: 'Sulfa — alergia relatada' },
      { nome: 'sulfassalazina', motivo: 'Sulfa — alergia relatada' },
    ],
  },
  {
    comorbidade: 'Alergia a dipirona',
    keywords: [
      'alerg.*\\b(dipirona|metamizol|novalgina)\\b',
      '\\b(dipirona|metamizol|novalgina)\\b.*alerg',
    ],
    medicamentos: [
      { nome: 'dipirona', motivo: 'Alergia a dipirona relatada' },
      { nome: 'metamizol', motivo: 'Mesma substância da dipirona' },
      { nome: 'novalgina', motivo: 'Marca da dipirona — alergia relatada' },
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

// Mapa de equivalências/marcas → princípios ativos para reforçar match de alergias.
// Quando o paciente declara alergia a um item à esquerda, todos os termos à direita
// (e o próprio termo) também serão bloqueados se aparecerem na prescrição.
const EQUIVALENCIAS_FARMACO: Record<string, string[]> = {
  'aas': ['aspirina', 'acido acetilsalicilico', 'ácido acetilsalicílico', 'aas'],
  'aspirina': ['aas', 'acido acetilsalicilico', 'ácido acetilsalicílico', 'aspirina'],
  'acido acetilsalicilico': ['aas', 'aspirina', 'ácido acetilsalicílico'],
  'dipirona': ['novalgina', 'metamizol', 'anador', 'magnopyrol'],
  'novalgina': ['dipirona', 'metamizol'],
  'metamizol': ['dipirona', 'novalgina'],
  'paracetamol': ['acetaminofeno', 'tylenol'],
  'acetaminofeno': ['paracetamol', 'tylenol'],
  'ibuprofeno': ['advil', 'alivium', 'motrin'],
  'diclofenaco': ['cataflam', 'voltaren'],
  'amoxicilina': ['amoxil', 'novocilin'],
  'penicilina': ['benzetacil', 'amoxicilina', 'ampicilina'],
  'azitromicina': ['zitromax'],
  'cefalexina': ['keflex'],
  'sulfametoxazol': ['bactrim', 'sulfa'],
  'omeprazol': ['losec'],
  'losartana': ['cozaar'],
  'sinvastatina': ['zocor'],
  'tramadol': ['tramal'],
};

// Extrai uma lista de fármacos/marcas declarados como alergia no campo alergia.
// Ex.: "Sim - Dipirona, Penicilina" → ["dipirona", "penicilina"]
function extrairFarmacosAlergia(alergiaTexto?: string): string[] {
  if (!alergiaTexto) return [];
  const t = normalizar(alergiaTexto);
  if (!t || t === 'nenhuma' || t === 'nao' || t === 'n/a' || t === 'sem alergia') return [];
  // Remove prefixos comuns
  const limpo = t
    .replace(/^.*?\balerg(ia|ico|ica)?\s*(a|ao|à|aos|às|:|-)?\s*/i, '')
    .replace(/\balergia relatada\b.*$/i, '')
    .replace(/\(.*?\)/g, '');
  // Quebra por separadores comuns
  const tokens = limpo
    .split(/[,;/\n]| e | ou /)
    .map(s => s.trim())
    .filter(s => s.length >= 3 && !/^(sim|nao|medicament[oa]s?|n[aã]o\s*especificad)/.test(s));
  // Expande com equivalências
  const set = new Set<string>();
  for (const tok of tokens) {
    const base = normalizar(tok);
    if (!base) continue;
    set.add(base);
    // Adiciona equivalências de cada palavra do token
    for (const palavra of base.split(/\s+/)) {
      if (EQUIVALENCIAS_FARMACO[palavra]) {
        for (const eq of EQUIVALENCIAS_FARMACO[palavra]) set.add(normalizar(eq));
      }
    }
    if (EQUIVALENCIAS_FARMACO[base]) {
      for (const eq of EQUIVALENCIAS_FARMACO[base]) set.add(normalizar(eq));
    }
  }
  return Array.from(set);
}

export function verificarContraindicacoes(
  comorbidadeTexto: string,
  medicamentosTexto: string,
  alergiaTexto?: string
): AlertaContraindicacao[] {
  if (!medicamentosTexto) return [];
  // Junta comorbidade + alergia para detectar todas as condições relevantes
  const textoCondicoes = [comorbidadeTexto, alergiaTexto].filter(Boolean).join(' ; ');
  const ativas = detectarComorbidades(textoCondicoes);
  const medNorm = normalizar(medicamentosTexto);
  const alertas: AlertaContraindicacao[] = [];
  const vistos = new Set<string>();

  const matchPalavra = (nomeNorm: string) => {
    if (!nomeNorm) return false;
    const escaped = nomeNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(medNorm);
  };

  // 1) Contraindicações por comorbidade/condição declarada
  for (const c of ativas) {
    for (const m of c.medicamentos) {
      const nomeNorm = normalizar(m.nome);
      if (matchPalavra(nomeNorm)) {
        const chave = `${c.comorbidade}|${nomeNorm}`;
        if (!vistos.has(chave)) {
          vistos.add(chave);
          alertas.push({ comorbidade: c.comorbidade, medicamento: m.nome, motivo: m.motivo });
        }
      }
    }
  }

  // 2) Bloqueio genérico: qualquer fármaco declarado no campo de alergia do paciente
  const alergicoA = extrairFarmacosAlergia(alergiaTexto);
  for (const farmaco of alergicoA) {
    if (matchPalavra(farmaco)) {
      const chave = `ALERGIA|${farmaco}`;
      if (!vistos.has(chave)) {
        vistos.add(chave);
        alertas.push({
          comorbidade: `Alergia declarada a ${farmaco}`,
          medicamento: farmaco,
          motivo: 'Paciente declarou alergia a este medicamento — prescrição bloqueada',
        });
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
