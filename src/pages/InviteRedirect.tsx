import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InviteRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Store referral code and redirect to signup
      localStorage.setItem('referralCode', code);
      navigate(`/signup?ref=${code}`, { replace: true });
    } else {
      navigate('/signup', { replace: true });
    }
  }, [code, navigate]);

  return null;
}
