import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cleanup-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secret = Deno.env.get("STORAGE_CLEANUP_SECRET");
  if (!secret || req.headers.get("x-cleanup-secret") !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const buckets: string[] = body.buckets ?? [];
    const olderThanDays: number = Number(body.olderThanDays ?? 45);
    const dryRun: boolean = body.dryRun === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
    const result: Record<string, unknown> = { cutoff, dryRun, buckets: {} };

    for (const bucket of buckets) {
      const names: string[] = [];
      let bytes = 0;
      let page = 0;
      // Walk the bucket root and one level of folders.
      const walk = async (prefix: string) => {
        let offset = 0;
        while (true) {
          const { data, error: listErr } = await supabase.storage
            .from(bucket)
            .list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
          if (listErr) throw listErr;
          if (!data || data.length === 0) break;
          for (const entry of data) {
            const path = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (!entry.id) {
              await walk(path); // folder
              continue;
            }
            if (entry.created_at && entry.created_at < cutoff) {
              names.push(path);
              bytes += Number((entry.metadata as Record<string, unknown> | null)?.size ?? 0);
            }
          }
          if (data.length < 1000) break;
          offset += 1000;
          if (++page > 50) break;
        }
      };
      await walk("");

      let removed = 0;
      if (!dryRun) {
        for (let i = 0; i < names.length; i += 100) {
          const chunk = names.slice(i, i + 100);
          const { error: delErr } = await supabase.storage.from(bucket).remove(chunk);
          if (delErr) throw delErr;
          removed += chunk.length;
        }
      }

      (result.buckets as Record<string, unknown>)[bucket] = {
        matched: names.length,
        removed,
        bytes,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("storage-cleanup failed", err);
    return new Response(JSON.stringify({ error: "Cleanup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
