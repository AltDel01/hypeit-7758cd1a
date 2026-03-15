
-- Referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted')),
  credits_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Users can insert referrals (to generate their code)
CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Add referral_code to profiles for quick lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_credits INTEGER NOT NULL DEFAULT 0;
