/**
 * Shared "your result is ready" notifier.
 *
 * The result email used to be sent only when a human editor uploaded a file
 * from the workspace, so requests finished by the automatic pipeline
 * (Wan video, Qwen image, inpaint, creative workflow) never notified the user.
 * Every completion path calls this helper instead.
 */

type AdminClient = {
  from: (t: string) => any;
};

export async function notifyResultReady(admin: AdminClient, requestId: string) {
  try {
    const { data: row } = await admin
      .from('generation_requests')
      .select('id, user_id, user_email, user_name, request_type, prompt')
      .eq('id', requestId)
      .maybeSingle();

    if (!row) return;

    let email: string | null = row.user_email || null;
    let name: string | null = row.user_name || null;

    if (!email && row.user_id) {
      const { data: profile } = await admin
        .from('profiles')
        .select('email, display_name')
        .eq('id', row.user_id)
        .maybeSingle();
      email = profile?.email || null;
      name = name || profile?.display_name || null;
    }

    if (!email || email === 'unknown@user') return;

    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-result-ready`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        userEmail: email,
        userName: name || '',
        requestType: row.request_type === 'video' ? 'video' : 'image',
        prompt: row.prompt || '',
        siteUrl: 'https://viralin.ai',
        requestId: row.id,
      }),
    });
    if (!res.ok) {
      console.error('[resultEmail] send failed', res.status, (await res.text()).slice(0, 200));
    }
  } catch (e) {
    // Never let a notification failure break a finished generation.
    console.error('[resultEmail] exception', e);
  }
}
