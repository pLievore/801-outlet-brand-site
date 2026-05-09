/**
 * Confirm a user's email and optionally add them to admin_users.
 * Usage: tsx --env-file=.env.local scripts/confirm-user.ts <email>
 */
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: tsx --env-file=.env.local scripts/confirm-user.ts <email>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // 1. Find user by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error(listErr.message); process.exit(1); }

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  // 2. Confirm email
  const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (updateErr) { console.error('Failed to confirm email:', updateErr.message); process.exit(1); }
  console.log(`✓ Email confirmed for ${email}`);

  // 3. Add to admin_users if not already there
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!existing) {
    const { error: insertErr } = await supabase.from('admin_users').insert({
      auth_user_id: user.id,
      email,
      full_name: email.split('@')[0],
      role: 'admin',
    });
    if (insertErr) {
      console.error('Could not add to admin_users:', insertErr.message);
    } else {
      console.log(`✓ Added ${email} to admin_users with role=admin`);
    }
  } else {
    console.log(`ℹ  ${email} already in admin_users`);
  }

  console.log('\nDone. You can now log in at /admin/login');
}

main().catch((e) => { console.error(e); process.exit(1); });
