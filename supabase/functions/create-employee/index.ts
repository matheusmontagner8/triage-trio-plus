import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const ROLES = ['recepcao', 'enfermagem', 'medico'] as const;
type Role = typeof ROLES[number];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claimsData?.claims) return json({ error: 'Unauthorized' }, 401);
    const callerId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller is admin
    const { data: roleRows, error: rErr } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .limit(1);
    if (rErr) return json({ error: rErr.message }, 500);
    if (!roleRows || roleRows.length === 0) return json({ error: 'Forbidden' }, 403);

    const { email, password, nome, role, especialidade } = await req.json();

    if (typeof email !== 'string' || !email.includes('@') || email.length > 255) return json({ error: 'Email inválido.' }, 400);
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) return json({ error: 'Senha deve ter entre 8 e 72 caracteres.' }, 400);
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 100) return json({ error: 'Nome inválido.' }, 400);
    if (!ROLES.includes(role)) return json({ error: 'Setor inválido.' }, 400);
    if (role === 'medico' && (typeof especialidade !== 'string' || !especialidade.trim())) {
      return json({ error: 'Especialidade obrigatória para médicos.' }, 400);
    }

    const { data: created, error: uErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome.trim() },
    });
    if (uErr || !created.user) return json({ error: uErr?.message ?? 'Falha ao criar usuário.' }, 500);

    const { error: insErr } = await admin
      .from('user_roles')
      .insert({
        user_id: created.user.id,
        role: role as Role,
        especialidade: role === 'medico' ? especialidade.trim() : null,
      });
    if (insErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: insErr.message }, 500);
    }

    return json({ ok: true, user_id: created.user.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
