import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AuroraBackground from "@/components/effects/AuroraBackground";

// Supabase OAuth 2.1 authorization-server namespace (beta). Type it locally so we
// don't depend on generated types shipping this API.
type OAuthNs = {
  getAuthorizationDetails: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
};

function oauth(): OAuthNs {
  return (supabase.auth as unknown as { oauth: OAuthNs }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error: err } = await oauth().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (err) {
          setError(err.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Could not load authorization request");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error: err } = approve
        ? await oauth().approveAuthorization(authorizationId)
        : await oauth().denyAuthorization(authorizationId);
      if (err) {
        setBusy(false);
        setError(err.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("No redirect returned by the authorization server.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Authorization failed");
    }
  }

  return (
    <AuroraBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-black/70 p-8 shadow-lg backdrop-blur-sm">
          {error ? (
            <>
              <h1 className="mb-3 text-xl font-bold text-white">Authorization error</h1>
              <p className="text-sm text-gray-300">{error}</p>
            </>
          ) : !details ? (
            <p className="text-gray-300">Loading…</p>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-bold text-white">
                Connect {details.client?.name ?? "an app"} to your Viralin AI account
              </h1>
              <p className="mb-6 text-sm text-gray-300">
                This will let {details.client?.name ?? "this client"} act as you: read your
                generation history, credit balance, and posting history through the Viralin
                AI MCP tools.
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={busy}
                  onClick={() => decide(true)}
                  className="flex-1 bg-[#8c52ff] hover:bg-[#7a45e6]"
                >
                  {busy ? "Working…" : "Approve"}
                </Button>
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() => decide(false)}
                  className="flex-1"
                >
                  Deny
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuroraBackground>
  );
}
