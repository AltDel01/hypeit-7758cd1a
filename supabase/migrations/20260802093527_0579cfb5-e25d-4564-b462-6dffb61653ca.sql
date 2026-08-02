-- Credit packs
CREATE TABLE public.credit_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  credits integer NOT NULL,
  price_idr integer NOT NULL,
  price_usd numeric,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_packs TO anon;
GRANT SELECT ON public.credit_packs TO authenticated;
GRANT ALL ON public.credit_packs TO service_role;
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active packs" ON public.credit_packs FOR SELECT USING (active = true);
CREATE POLICY "Admins manage packs" ON public.credit_packs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment orders
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  pack_key text NOT NULL,
  pack_name text NOT NULL,
  credits integer NOT NULL,
  base_amount_idr integer NOT NULL,
  unique_amount_idr integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  proof_url text,
  matched_email_id uuid,
  matched_at timestamptz,
  approved_by uuid,
  rejection_reason text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX payment_orders_pending_amount_idx
  ON public.payment_orders (unique_amount_idr)
  WHERE status = 'pending';
CREATE INDEX payment_orders_user_idx ON public.payment_orders (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.payment_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.payment_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Payment email events
CREATE TABLE public.payment_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_message_id text NOT NULL UNIQUE,
  sender text,
  subject text,
  snippet text,
  amount_idr integer,
  received_at timestamptz,
  matched_order_id uuid REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'unmatched',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_email_events TO authenticated;
GRANT ALL ON public.payment_email_events TO service_role;
ALTER TABLE public.payment_email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view email events" ON public.payment_email_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payment settings (single row)
CREATE TABLE public.payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  qris_image_url text,
  merchant_name text,
  instructions text,
  bank_senders text[] NOT NULL DEFAULT ARRAY[]::text[],
  order_ttl_minutes integer NOT NULL DEFAULT 30,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_settings TO anon;
GRANT SELECT ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view payment settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage payment settings" ON public.payment_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.payment_settings (id, merchant_name) VALUES (true, 'Viralin AI');

INSERT INTO public.credit_packs (key, name, credits, price_idr, price_usd, sort_order) VALUES
  ('starter', 'Starter', 3000, 249000, 15, 1),
  ('pro', 'Pro', 8000, 415000, 25, 2),
  ('specialist', 'Specialist', 26000, 2075000, 125, 3);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER credit_packs_touch BEFORE UPDATE ON public.credit_packs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER payment_orders_touch BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_orders;