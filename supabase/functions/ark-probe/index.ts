// Temporary diagnostic: discovers ModelArk model IDs. Returns no secrets. Remove after setup.
const BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3';
Deno.serve(async (req) => {
  const key = Deno.env.get('ARK_API_KEY') ?? '';
  const h = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const url = new URL(req.url);
  const action = url.searchParams.get('a') ?? 'models';
  const out: Record<string, unknown> = {};
  if (action === 'models') {
    const r = await fetch(`${BASE}/models`, { headers: h });
    const t = await r.text();
    out.status = r.status;
    try {
      const j = JSON.parse(t);
      out.ids = (j.data ?? []).map((m: any) => m.id).filter((id: string) => /seed|dola|dreamina/i.test(id));
    } catch { out.body = t.slice(0, 500); }
  } else if (action === 'image') {
    const model = url.searchParams.get('m')!;
    const r = await fetch(`${BASE}/images/generations`, { method: 'POST', headers: h, body: JSON.stringify({ model, prompt: 'a red apple on a table', size: '2K', response_format: 'url', watermark: false }) });
    out.status = r.status; out.body = (await r.text()).slice(0, 600);
  } else if (action === 'video') {
    const model = url.searchParams.get('m')!;
    const dur = Number(url.searchParams.get('d') ?? '5');
    const r = await fetch(`${BASE}/contents/generations/tasks`, { method: 'POST', headers: h, body: JSON.stringify({ model, content: [{ type: 'text', text: 'a red apple rotating on a table' }], duration: dur, ratio: '16:9', resolution: url.searchParams.get('r') ?? '720p', watermark: false }) });
    out.status = r.status; out.body = (await r.text()).slice(0, 600);
  } else if (action === 'task') {
    const r = await fetch(`${BASE}/contents/generations/tasks/${url.searchParams.get('id')}`, { headers: h });
    out.status = r.status; out.body = (await r.text()).slice(0, 800);
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
});
