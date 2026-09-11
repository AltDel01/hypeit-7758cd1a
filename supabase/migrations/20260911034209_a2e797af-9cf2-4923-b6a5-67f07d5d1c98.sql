CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_ref_code text;
  v_referrer uuid;
BEGIN
  INSERT INTO public.profiles (id, email, display_name, monthly_generation_limit)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 500);

  BEGIN
    v_ref_code := NULLIF(new.raw_user_meta_data->>'referral_code', '');
    IF v_ref_code IS NOT NULL THEN
      SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = v_ref_code LIMIT 1;
      IF v_referrer IS NOT NULL AND v_referrer <> new.id THEN
        UPDATE public.profiles
          SET referred_by = v_referrer, bonus_credits = COALESCE(bonus_credits, 0) + 10
          WHERE id = new.id;

        UPDATE public.referrals
          SET referred_id = new.id, status = 'signed_up'
          WHERE referrer_id = v_referrer
            AND referral_code = v_ref_code
            AND referred_id IS NULL;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'referral linking failed for %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$function$;