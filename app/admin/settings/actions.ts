'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../src/lib/admin';
import { supabaseAdmin } from '../../../src/lib/supabase/admin';

export async function inviteAdmin(
  _prev: { error?: string; success?: string } | null,
  fd: FormData
): Promise<{ error?: string; success?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized.' };
  }

  const email = (fd.get('email') as string)?.trim().toLowerCase();
  const fullName = (fd.get('full_name') as string)?.trim() || null;
  const role = fd.get('role') === 'viewer' ? 'viewer' : 'admin';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Valid email required.' };
  }

  // Check if already an admin
  const { data: existing } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return { error: `${email} is already an admin.` };

  // Look up or invite the auth user
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existingAuthUser = listData?.users?.find((u) => u.email === email);

  let authUserId: string;

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
  } else {
    // Invite a new user (sends invite email)
    const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (inviteError || !invited?.user) {
      return { error: inviteError?.message ?? 'Failed to invite user.' };
    }
    authUserId = invited.user.id;
  }

  const { error: insertError } = await supabaseAdmin.from('admin_users').insert({
    auth_user_id: authUserId,
    email,
    full_name: fullName,
    role,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath('/admin/settings');
  return { success: `${email} added as ${role}.` };
}

export async function removeAdmin(adminId: string): Promise<{ error?: string }> {
  const current = await requireAdmin();
  if (current.id === adminId) {
    return { error: "You can't remove yourself." };
  }

  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', adminId);
  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return {};
}
