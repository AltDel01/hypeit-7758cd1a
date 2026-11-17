import { createClient } from 'npm:@supabase/supabase-js@2'

/** Message shown to free accounts while generation is paused for them. */
export const UPGRADE_REQUIRED_MESSAGE =
  'Generating is available on paid plans right now. Please upgrade to continue.'

/**
 * Paywall gate for every AI generation endpoint (chat, trends, copy, images, videos).
 * Returns a ready Response when the caller may not generate, or null to continue.
 * The rule itself lives in the database function can_generate (paid plan, settled
 * payment, or staff; everyone allowed when the free_generation_paused flag is off).
 */
export async function freePlanGate(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const reply = (status: number, error: string, code: string) =>
    new Response(JSON.stringify({ error, code }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token || token === anonKey) {
      return reply(401, 'Please sign in to continue.', 'sign_in_required')
    }

    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(token)
    const userId = claims?.claims?.sub as string | undefined
    if (claimsError || !userId) {
      return reply(401, 'Please sign in to continue.', 'sign_in_required')
    }

    const admin = createClient(url, serviceKey)
    const { data: allowed, error } = await admin.rpc('can_generate', { _user_id: userId })
    if (error) {
      console.error('[freePlanGate] access check failed', error.message)
      return reply(503, 'Service temporarily unavailable. Please try again.', 'unavailable')
    }
    if (allowed !== true) {
      return reply(403, UPGRADE_REQUIRED_MESSAGE, 'upgrade_required')
    }
    return null
  } catch (e) {
    console.error('[freePlanGate] unexpected error', e)
    return reply(503, 'Service temporarily unavailable. Please try again.', 'unavailable')
  }
}
