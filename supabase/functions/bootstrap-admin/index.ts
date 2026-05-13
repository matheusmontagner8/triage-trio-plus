import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, password, nome } = await req.json();

    if (typeof email !== 'string' || !email.includes('@') || email.length > 255) {
      return json({ error: 'Email inválido.' }, 400);
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return json({ error: 'Senha deve ter entre 8 e 72 caracteres.' }, 400);
    }
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 100) {
      return json({ error: 'Nome inválido.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Block if any admin already exists
    const { count, error: cErr } = await admin
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (cErr) return json({ error: cErr.message }, 500);
    if ((count ?? 0) > 0) return json({ error: 'Administrador já configurado.' }, 403);

    const { data: created, error: uErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome.trim() },
    });
    if (uErr || !created.user) return json({ error: uErr?.message ?? 'Falha ao criar usuário.' }, 500);

    const { error: rErr } = await admin
      .from('user_roles')
      .insert({ user_id: created.user.id, role: 'admin' });
    if (rErr) return json({ error: rErr.message }, 500);

    return json({ ok: true });
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
