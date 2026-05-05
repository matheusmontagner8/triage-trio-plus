## Plano

### 1. Adicionar o arquivo `.env` ao projeto
- Copiar o arquivo enviado (`user-uploads://env`) para a raiz do projeto como `.env`, contendo:
  ```
  VITE_GEMINI_API_KEY='AIzaSyBlmsis3Axwt0jV1GXJldvzryk9v_kKog4'
  ```
- Garantir que `.env` esteja listado no `.gitignore` (verificar/atualizar).
- Observação: por enquanto a chave fica disponível em `import.meta.env.VITE_GEMINI_API_KEY` para uso futuro. Nenhum código de IA será adicionado agora — apenas o registro da variável.
- Aviso de segurança: como esta chave foi compartilhada em texto, recomendo regenerá-la no Google AI Studio depois.

### 2. Expandir as especialidades médicas
Em `src/lib/store.ts`, atualizar a constante `ESPECIALIDADES`, adicionando 5 opções:
- Clínica Médica (existente)
- Pediatria (existente)
- Psiquiatria
- Cirurgia Geral
- Ginecologia
- Ortopedia
- Obstetrícia

Atualizar também o mapa `CID_POR_ESPECIALIDADE` para que cada nova especialidade utilize a lista `CIDS_COMUNS` (mantendo o autocomplete funcional). No futuro pode-se refinar o conjunto de CIDs por especialidade, mas por ora todos terão a lista geral.

A tela de Login já renderiza dinamicamente `ESPECIALIDADES.map(...)` — as novas opções aparecerão automaticamente após o médico selecionar o nome.

### 3. Restringir crianças (0–10 anos) a Pediatria ou Ortopedia
A idade é registrada na ficha do paciente (`Paciente.idade`). A regra será aplicada na fila do médico (`src/pages/Medico.tsx`), no `refreshFila`:

- Calcular `idadeNum = parseInt(p.idade)`.
- Se `idadeNum >= 0 && idadeNum <= 10`:
  - O paciente só aparece para médicos cuja `session.especialidade` seja **Pediatria** ou **Ortopedia**.
- Médicos de outras especialidades (Clínica, Psiquiatria, Cirurgia Geral, Ginecologia, Obstetrícia) não verão pacientes nessa faixa etária na fila e portanto não poderão chamá-los.

Adicionalmente, exibir um pequeno texto informativo no cabeçalho da fila quando a especialidade ativa for diferente de Pediatria/Ortopedia, indicando que pacientes de 0–10 anos estão filtrados para esses dois setores.

### Detalhes técnicos
- `src/lib/store.ts`: adicionar entradas em `ESPECIALIDADES` e em `CID_POR_ESPECIALIDADE`.
- `src/pages/Medico.tsx`: ajustar o filtro do `refreshFila` para aplicar a regra de idade vs. especialidade; adicionar nota visual opcional na fila.
- `.env` na raiz + verificação do `.gitignore`.

Nenhuma outra tela precisa de alteração — Recepção segue cadastrando idade normalmente e Login já lista especialidades dinamicamente.