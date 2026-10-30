import { arkGenerateImages, arkCreateVideoTask, pollVideoTask, ARK_PROVIDER } from '../_shared/modelark.ts';
Deno.serve(async (req) => {
  const u = new URL(req.url);
  const poll = u.searchParams.get('poll');
  if (poll) return Response.json(await pollVideoTask('alibaba', poll));
  const mode = u.searchParams.get('mode');
  if (mode === 'image') {
    const t = Date.now();
    const r = await arkGenerateImages({ prompt: 'A bottle of iced coffee on a wooden table, product photo', size: '1440x2560', fast: true });
    return Response.json({ provider: ARK_PROVIDER, ms: Date.now() - t, r });
  }
  const img = u.searchParams.get('img');
  const r = await arkCreateVideoTask({ prompt: 'Iced coffee bottle on a table, camera slowly zooms in', duration: -1, ratio: '9:16', resolution: '720p',
    images: img ? [{ url: img, role: 'reference_image' }] : [] });
  return Response.json(r);
});
