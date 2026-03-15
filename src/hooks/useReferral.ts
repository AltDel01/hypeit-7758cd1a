import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralData {
  referralCode: string | null;
  referralLink: string;
  signedUp: number;
  converted: number;
  isLoading: boolean;
  generateCode: () => Promise<void>;
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useReferral(): ReferralData {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(0);
  const [converted, setConverted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }

    // Get or create referral code from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .maybeSingle();

    if ((profile as any)?.referral_code) {
      setReferralCode((profile as any).referral_code);
    }

    // Count referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', user.id);

    if (referrals) {
      setSignedUp(referrals.filter((r: any) => r.status === 'signed_up' || r.status === 'converted').length);
      setConverted(referrals.filter((r: any) => r.status === 'converted').length);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateCode = useCallback(async () => {
    if (!user) return;
    const code = generateRandomCode();

    await supabase
      .from('profiles')
      .update({ referral_code: code } as any)
      .eq('id', user.id);

    // Also create a referral row as a template
    await (supabase.from('referrals') as any).insert({
      referrer_id: user.id,
      referral_code: code,
    });

    setReferralCode(code);
  }, [user]);

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : '';

  return { referralCode, referralLink, signedUp, converted, isLoading, generateCode };
}
