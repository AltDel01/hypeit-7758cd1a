import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Upload, Check, X } from 'lucide-react';

interface Order {
  id: string;
  user_email: string | null;
  pack_name: string;
  credits: number;
  unique_amount_idr: number;
  status: string;
  proof_url: string | null;
  created_at: string;
  rejection_reason: string | null;
}

interface EmailEvent {
  id: string;
  sender: string | null;
  subject: string | null;
  amount_idr: number | null;
  status: string;
  received_at: string | null;
  note: string | null;
}

const formatIDR = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const statusTone: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  review: 'bg-primary/15 text-primary border-primary/30',
  expired: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-muted text-muted-foreground border-border',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const AdminPaymentsSection = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [proofPreviews, setProofPreviews] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const [qrisPath, setQrisPath] = useState<string | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [senders, setSenders] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: orderRows }, { data: eventRows }, { data: settings }] = await Promise.all([
      supabase.from('payment_orders').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('payment_email_events').select('*').order('received_at', { ascending: false }).limit(50),
      supabase.from('payment_settings').select('*').maybeSingle(),
    ]);
    setOrders((orderRows as Order[]) ?? []);
    setEvents((eventRows as EmailEvent[]) ?? []);
    if (settings) {
      setQrisPath(settings.qris_image_url);
      setMerchantName(settings.merchant_name ?? '');
      setInstructions(settings.instructions ?? '');
      setSenders((settings.bank_senders ?? []).join(', '));
      if (settings.qris_image_url) {
        const { data: signed } = await supabase.storage
          .from('payment-assets')
          .createSignedUrl(settings.qris_image_url, 3600);
        setQrisPreview(signed?.signedUrl ?? null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const needsReview = orders.filter((o) => o.status === 'review');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        needsReview
          .filter((o) => o.proof_url && !o.proof_url.toLowerCase().endsWith('.pdf'))
          .map(async (o) => {
            const { data } = await supabase.storage
              .from('payment-assets')
              .createSignedUrl(o.proof_url!, 3600);
            return [o.id, data?.signedUrl ?? ''] as const;
          }),
      );
      if (cancelled) return;
      setProofPreviews(Object.fromEntries(entries.filter(([, url]) => url)));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);



  const act = async (orderId: string, action: 'approve' | 'reject') => {
    let reason = 'Payment could not be verified.';
    if (action === 'reject') {
      const input = window.prompt('Reason shown to the buyer:', reason);
      if (input === null) return;
      if (input.trim()) reason = input.trim();
    }
    setBusyId(orderId);
    const { data, error } = await supabase.functions.invoke('qris-admin-order', {
      body: { orderId, action, reason },
    });
    setBusyId(null);
    if (error || data?.error) {
      toast({ title: 'Action failed', description: data?.error ?? 'Please try again.', variant: 'destructive' });
      return;
    }
    toast({ title: action === 'approve' ? 'Credits granted' : 'Order rejected' });
    load();
  };

  const openProof = async (path: string) => {
    const { data } = await supabase.storage.from('payment-assets').createSignedUrl(path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };


  const runScan = async () => {
    setScanning(true);
    const { data, error } = await supabase.functions.invoke('qris-reconcile', { body: {} });
    setScanning(false);
    if (error || data?.error) {
      toast({ title: 'Scan failed', description: data?.error ?? 'Please try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Inbox scanned', description: `${data.scanned} new emails, ${data.matched} matched.` });
    load();
  };

  const uploadQris = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `qris/code.${ext}`;
    const { error } = await supabase.storage.from('payment-assets').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    setQrisPath(path);
    const { data: signed } = await supabase.storage.from('payment-assets').createSignedUrl(path, 3600);
    setQrisPreview(signed?.signedUrl ?? null);
    toast({ title: 'QRIS image uploaded', description: 'Remember to save settings.' });
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from('payment_settings')
      .update({
        qris_image_url: qrisPath,
        merchant_name: merchantName,
        instructions,
        bank_senders: senders.split(',').map((s) => s.trim()).filter(Boolean),
      })
      .eq('id', true);
    setSavingSettings(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Payment settings saved' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">QRIS setup</CardTitle>
          <Button size="sm" variant="secondary" onClick={runScan} disabled={scanning}>
            {scanning ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
            Scan bank inbox
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">QRIS image</label>
              <div className="mt-1 flex items-center gap-3">
                {qrisPreview && (
                  <img src={qrisPreview} alt="Current QRIS code" className="h-20 w-20 rounded-md object-cover" />
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadQris(file);
                    }}
                  />
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs">
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Merchant name</label>
              <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Bank notification senders (comma separated)
              </label>
              <Input
                value={senders}
                onChange={(e) => setSenders(e.target.value)}
                placeholder="noreply@bca.co.id, notifikasi@bri.co.id"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Checkout instructions</label>
              <Textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </div>
            <Button size="sm" onClick={saveSettings} disabled={savingSettings}>
              {savingSettings && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
              Save settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle className="text-base">
            Needs review {needsReview.length > 0 && `(${needsReview.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {needsReview.length === 0 && (
            <p className="text-sm text-muted-foreground">No receipts waiting for approval.</p>
          )}
          {needsReview.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {proofPreviews[order.id] ? (
                  <img
                    src={proofPreviews[order.id]}
                    alt={`Payment receipt from ${order.user_email ?? 'buyer'}`}
                    className="h-16 w-16 cursor-pointer rounded-md object-cover"
                    onClick={() => order.proof_url && openProof(order.proof_url)}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.user_email ?? 'Unknown user'}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.pack_name} , {order.credits.toLocaleString('en-US')} credits ,{' '}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {formatIDR(order.unique_amount_idr)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {order.proof_url && (
                  <Button size="sm" variant="ghost" onClick={() => openProof(order.proof_url!)}>
                    View receipt
                  </Button>
                )}
                <Button size="sm" disabled={busyId === order.id} onClick={() => act(order.id, 'approve')}>
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busyId === order.id}
                  onClick={() => act(order.id, 'reject')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.user_email ?? 'Unknown user'}</p>
                <p className="text-xs text-muted-foreground">
                  {order.pack_name} , {formatIDR(order.unique_amount_idr)} ,{' '}
                  {order.credits.toLocaleString('en-US')} credits ,{' '}
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusTone[order.status] ?? ''}>
                  {order.status}
                </Badge>
                {order.proof_url && (
                  <Button size="sm" variant="ghost" onClick={() => openProof(order.proof_url!)}>
                    Proof
                  </Button>
                )}
                {['pending', 'review', 'expired'].includes(order.status) && (
                  <>
                    <Button size="sm" disabled={busyId === order.id} onClick={() => act(order.id, 'approve')}>
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === order.id}
                      onClick={() => act(order.id, 'reject')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank emails read</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">No bank notifications processed yet.</p>
          )}
          {events.map((event) => (
            <div key={event.id} className="rounded-lg border border-border p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{event.subject ?? '(no subject)'}</span>
                <Badge variant="outline" className={statusTone[event.status] ?? ''}>
                  {event.status}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                {event.sender} , {event.amount_idr ? formatIDR(event.amount_idr) : 'no amount'} ,{' '}
                {event.received_at ? new Date(event.received_at).toLocaleString() : ''}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsSection;
