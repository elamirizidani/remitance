import { createSupabaseServerClient } from './supabase/server';

export async function requireAdmin(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(user.email.toLowerCase()) ? user.id : null;
}
