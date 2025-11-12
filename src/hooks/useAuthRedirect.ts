
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthRedirect(shouldRedirect: boolean = true): { 
  isAuthorized: boolean, 
  redirectToSignup: () => void 
} {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Function to redirect unauthenticated users to signup
  const redirectToSignup = () => {
    if (!user && !loading) {
      // Save current path to know where to return after auth
      localStorage.setItem('authRedirectPath', window.location.pathname);
      navigate('/signup');
    }
  };
  
  // If shouldRedirect is true, automatically redirect on component mount
  useEffect(() => {
    if (shouldRedirect) {
      redirectToSignup();
    }
  }, [navigate, user, loading, shouldRedirect]);
  
  return { 
    isAuthorized: !!user, 
    redirectToSignup 
  };
}
