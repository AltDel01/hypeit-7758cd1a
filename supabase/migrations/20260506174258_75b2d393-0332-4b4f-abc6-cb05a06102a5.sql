UPDATE public.profiles
SET monthly_generation_limit = 999999999,
    generations_this_month = 0,
    bonus_credits = 0
WHERE email = 'putra.ekadarma@gmail.com';