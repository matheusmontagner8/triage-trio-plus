## Goal
Replace the hardcoded-PIN + localStorage login with real server-side authentication using Lovable Cloud (Supabase Auth + RLS), fixing both security findings.

## Steps

### 1. Enable Lovable Cloud
Provision the backend so we have Auth, a database, and Edge Functions.

### 2. Database schema (migration)
- `profiles` table: `id (uuid, FK auth.users)`, `nome text`, `created_at`. Auto-populated via trigger on `auth.users` insert.
- `app_role` enum: `recepcao`, `enfermagem`, `medico`, `admin`.
- `user_roles` table: `id`, `user_id`, `role app_role`, `especialidade text null`, unique `(user_id, role)`.
- `has_role(_user_id uuid, _role app_role)` SECURITY DEFINER function (avoids RLS recursion).
- RLS policies:
  - `profiles`: users can select their own; admins can select all.
  - `user_roles`: users can select their own row; only admins can insert/update/delete.

### 3. Auth flow refactor (`src/pages/Login.tsx`)
- Replace PIN selector with **email + password** form.
- Use `supabase.auth.signInWithPassword`.
- After login, fetch the user's role from `user_roles` and route to `/recepcao`, `/enfermagem`, `/medico`, or admin panel.
- Remove all hardcoded `SENHAS_PADRAO` and `FUNCIONARIOS_*` lists.

### 4. Admin panel — create employees
- Replace local `addFuncionarioCustom` with an Edge Function `create-employee` (uses service role key) that:
  - Verifies the caller is `admin` via `has_role`.
  - Creates a new `auth.users` (email + password), inserts `profiles` row, inserts `user_roles` row.
- Admin form collects: nome, email, senha, setor, (especialidade if médico).

### 5. Session handling
- Replace `getSession()` / `setSession()` in `src/lib/store.ts` with a `useAuth` hook that reads from `supabase.auth` + `user_roles`.
- Each protected page (`Recepcao`, `Enfermagem`, `Medico`) gates render on real session + role check; unauthenticated → redirect to `/`.
- Listen with `onAuthStateChange` so logout/refresh works.

### 6. Bootstrap admin
After migration, document that the first admin must be created via the Cloud Users panel (or seed one in the migration with a known temp password the user rotates). I'll seed one admin: email `admin@clinica.local` / password `Admin1234!` with role `admin`, and tell the user to change it.

### 7. Cleanup
- Remove `funcionariosCustom` localStorage logic from `store.ts`.
- Keep patient/queue data (`pacientes`, etc.) in localStorage for now — those weren't flagged and changing them is out of scope.

## Out of scope
- Migrating patient/triage data to the database.
- Email verification / password reset flows (can be added later).
- Google / SSO providers.

## Result
- Passwords stored as hashes in Supabase Auth (not in JS bundle).
- Roles enforced server-side via RLS + `has_role`.
- Both security findings resolved.