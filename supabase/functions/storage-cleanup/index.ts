import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cleanup-secret",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    // Paid accounts keep their assets forever unless explicitly overridden.
    const protectPaid: boolean = body.protectPaid !== false;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Build the set of paying users: non-free subscription tier, bonus credits
    // from a purchase, or at least one approved payment order.
    const paidUsers = new Set<string>();
    if (protectPaid) {
      const { data: paidProfiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, subscription_tier, bonus_credits")
        .limit(10000);
      if (profErr) throw profErr;
      for (const p of paidProfiles ?? []) {
        const tier = (p.subscription_tier ?? "free").toLowerCase();
        if (tier && tier !== "free") paidUsers.add(p.id as string);
      }

      const { data: orders, error: orderErr } = await supabase
        .from("payment_orders")
        .select("user_id, status")
        .eq("status", "approved")
        .limit(10000);
      if (orderErr) throw orderErr;
      for (const o of orders ?? []) if (o.user_id) paidUsers.add(o.user_id as string);
    }

    const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
    const result: Record<string, unknown> = {
      cutoff,
      dryRun,
      protectPaid,
      paidUsers: paidUsers.size,
      buckets: {},
    };

    for (const bucket of buckets) {
      const names: string[] = [];
      let bytes = 0;
      let skippedPaid = 0;
      let skippedPaidBytes = 0;
      let page = 0;
      // Walk the bucket root and nested folders.
      const walk = async (prefix: string, ownerId: string | null) => {
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
              // Folder: the first UUID-looking segment identifies the owner.
              const nextOwner = ownerId ?? (UUID_RE.test(entry.name) ? entry.name : null);
              await walk(path, nextOwner);
              continue;
            }
            if (!entry.created_at || entry.created_at >= cutoff) continue;
            const size = Number((entry.metadata as Record<string, unknown> | null)?.size ?? 0);
            if (protectPaid && ownerId && paidUsers.has(ownerId)) {
              skippedPaid += 1;
              skippedPaidBytes += size;
              continue;
            }
            names.push(path);
            bytes += size;
          }
          if (data.length < 1000) break;
          offset += 1000;
          if (++page > 50) break;
        }
      };
      await walk("", null);

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
        skippedPaid,
        skippedPaidBytes,
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
