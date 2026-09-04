/**
 * Shared "new generation request" notifier for the admin inbox.
 *
 * The admin alert used to be sent only from the browser when a request was
 * submitted through the chat composer. Requests created server-side (creative
 * workflow assets, etc.) never notified the admin. Server code calls this
 * helper right after inserting a generation_requests row.
 */

const ADMIN_EMAIL = 'eka@viralin.ai'

type AdminClient = {
  storage: { from: (b: string) => any }
}

export async function notifyAdminNewRequest(
  admin: AdminClient,
  opts: {
    userName?: string | null
    userEmail?: string | null
    requestType: 'video' | 'image'
    prompt: string
    aspectRatio?: string | null
    referenceImageUrl?: string | null
  },
) {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('[notifyAdmin] RESEND_API_KEY not configured')
      return
    }

    // Resolve private storage refs into temporary signed links.
    const links: string[] = []
    if (opts.referenceImageUrl) {
      const parts = opts.referenceImageUrl.includes('||')
        ? opts.referenceImageUrl.split('||')
        : opts.referenceImageUrl.split(/,(?=(?:storage:|https?:\/\/))/g)
      for (const item of parts.map((p: string) => p.trim()).filter(Boolean)) {
        if (item.startsWith('storage:')) {
          const without = item.slice('storage:'.length)
          const slash = without.indexOf('/')
          if (slash === -1) continue
          const bucket = without.slice(0, slash)
          const path = without.slice(slash + 1)
          const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7)
          if (!error && data?.signedUrl) links.push(data.signedUrl)
        } else {
          links.push(item)
        }
      }
    }

    const emoji = opts.requestType === 'video' ? '🎬' : '🖼️'
    const typeLabel = opts.requestType.charAt(0).toUpperCase() + opts.requestType.slice(1)
    const subject = `${emoji} New ${typeLabel} Generation Request - Viralin AI`

    const attachmentsHtml = links.length === 0
      ? '<p><em>No file attached</em></p>'
      : `<p><strong>Attachment${links.length > 1 ? 's' : ''}:</strong></p>` +
        links.map((u, i) =>
          `<div style="margin: 8px 0;"><a href="${u}" style="color: #7c3aed; text-decoration: underline;">View Attached File ${links.length > 1 ? i + 1 : ''}</a></div>`
        ).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">New Generation Request</h1>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>User:</strong> ${opts.userName || 'Unknown'} (${opts.userEmail || 'unknown'})</p>
          <p><strong>Type:</strong> ${opts.requestType.toUpperCase()}</p>
          <p><strong>Prompt:</strong></p>
          <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">${opts.prompt}</div>
          ${opts.aspectRatio ? `<p><strong>Aspect Ratio:</strong> ${opts.aspectRatio}</p>` : ''}
          ${attachmentsHtml}
          <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; margin-top: 20px;">View and manage this request in the admin dashboard.</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Viralin AI <noreply@viralin.ai>',
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    })
    if (!res.ok) {
      console.error('[notifyAdmin] send failed', res.status, (await res.text()).slice(0, 200))
    }
  } catch (e) {
    // Never let a notification failure break generation.
    console.error('[notifyAdmin] exception', e)
  }
}
