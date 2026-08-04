import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, CheckCircle2, Upload, Clock } from 'lucide-react';

interface Order {
  id: string;
  pack_name: string;
  credits: number;
  unique_amount_idr: number;
  status: string;
  expires_at: string;
}

interface Props {
  packKey: string | null;
  onOpenChange: (open: boolean) => void;
}

const formatIDR = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const QrisCheckoutDialog = ({ packKey, onOpenChange }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const open = !!packKey;

  useEffect(() => {
    if (!open || !packKey || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOrder(null);
    (async () => {
      const { data, error: fnError } = await supabase.functions.invoke('qris-create-order', {
        body: { packKey },
      });
      if (cancelled) return;
      setLoading(false);
      if (fnError || data?.error) {
        setError(data?.error ?? 'Could not start checkout. Please try again.');
        return;
      }
      setOrder(data.order);
      setQrisUrl(data.qrisImageUrl);
      setMerchant(data.merchantName);
      setInstructions(data.instructions);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, packKey, user]);

  // Countdown to expiry.
  useEffect(() => {
    if (!order) return;
    const tick = () => {
      const ms = new Date(order.expires_at).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order]);

  // Live confirmation as soon as reconciliation marks the order paid.
  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel(`payment-order-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payment_orders', filter: `id=eq.${order.id}` },
        (payload) => setOrder((prev) => (prev ? { ...prev, ...(payload.new as Order) } : prev)),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const copyAmount = useCallback(() => {
    if (!order) return;
    navigator.clipboard.writeText(String(order.unique_amount_idr));
    toast({ title: 'Amount copied', description: formatIDR(order.unique_amount_idr) });
  }, [order, toast]);

  const uploadProof = async (file: File) => {
    if (!order || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `proofs/${user.id}/${order.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-assets')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setUploading(false);
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return;
    }
    const { data, error: fnError } = await supabase.functions.invoke('qris-submit-proof', {
      body: { orderId: order.id, proofPath: path },
    });
    setUploading(false);
    if (fnError || data?.error) {
      toast({ title: 'Could not submit', description: data?.error ?? 'Please try again.', variant: 'destructive' });
      return;
    }
    setOrder((prev) => (prev ? { ...prev, status: 'review' } : prev));
    toast({ title: 'Proof received', description: 'We are verifying your payment now.' });
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const paid = order?.status === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{paid ? 'Payment confirmed' : 'Pay with QRIS'}</DialogTitle>
          <DialogDescription>
            {paid
              ? 'Your credits have been added to your account.'
              : 'Scan with any Indonesian bank or e-wallet app, then pay the exact amount shown.'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && <p className="py-6 text-center text-sm text-destructive">{error}</p>}

        {order && paid && (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="text-lg font-semibold">
              {order.credits.toLocaleString('en-US')} credits added
            </p>
            <Button className="mt-2 w-full" onClick={() => onOpenChange(false)}>
              Start creating
            </Button>
          </div>
        )}

        {order && !paid && (
          <div className="space-y-4">
            {qrisUrl && (
              <div className="rounded-xl bg-background p-3">
                <img
                  src={qrisUrl}
                  alt={`QRIS payment code for ${merchant ?? 'Viralin AI'}`}
                  className="mx-auto w-full max-w-[260px] rounded-lg"
                  loading="lazy"
                />
              </div>
            )}

            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Pay this exact amount</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatIDR(order.unique_amount_idr)}
                </span>
                <Button size="sm" variant="secondary" onClick={copyAmount}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The last digits identify your order, so do not round the amount.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {order.pack_name} , {order.credits.toLocaleString('en-US')} credits
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {remaining > 0 ? `${mm}:${ss}` : 'Expired'}
              </span>
            </div>

            {instructions && <p className="text-xs text-muted-foreground">{instructions}</p>}

            <div
              className={`rounded-lg border p-3 ${
                order.status === 'review'
                  ? 'border-primary/40 bg-primary/5'
                  : order.status === 'rejected'
                    ? 'border-destructive/40 bg-destructive/5'
                    : 'border-primary/40 bg-primary/5'
              }`}
            >
              <p className="text-sm font-medium">
                {order.status === 'review'
                  ? 'We are verifying your payment'
                  : order.status === 'rejected'
                    ? 'We could not verify this payment'
                    : 'Paid? Upload your receipt to get your credits'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {order.status === 'review'
                  ? 'Your receipt is with our team. Credits are added as soon as it is confirmed, and this window updates automatically.'
                  : order.status === 'rejected'
                    ? 'Upload a clearer receipt or contact us at hello@viralin.ai.'
                    : 'Upload the payment receipt from your bank or e-wallet app. Our team confirms it and your credits are added.'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadProof(file);
                }}
              />
              <Button
                size="sm"
                className="mt-3 w-full"
                variant={order.status === 'review' ? 'secondary' : 'default'}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-1 h-3.5 w-3.5" />
                )}
                {order.status === 'review' ? 'Replace receipt' : 'Upload payment receipt'}
              </Button>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QrisCheckoutDialog;
