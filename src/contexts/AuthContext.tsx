import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { captureUserCountry } from '@/utils/geo';
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, referralCode?: string) => Promise<{ needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Backfill the user's country in the background (non-blocking)
          const uid = currentSession?.user?.id;
          if (uid) setTimeout(() => { captureUserCountry(uid); }, 0);
          // Arriving from an email verification link: confirm it and go to the app
          const hash = window.location.hash || '';
          const search = window.location.search || '';
          const cameFromEmailLink =
            hash.includes('type=signup') ||
            hash.includes('type=email_change') ||
            new URLSearchParams(search).has('code');
          if (cameFromEmailLink && sessionStorage.getItem('authRedirectPending') !== '1') {
            toast.success('Email verified. Welcome to Viralin AI!');
          }
          // Only redirect when sign-in was explicitly initiated from UI
          const shouldHandleRedirect = sessionStorage.getItem('authRedirectPending') === '1';
          if (shouldHandleRedirect) {
            sessionStorage.removeItem('authRedirectPending');
            const redirectPath = sessionStorage.getItem('postLoginRedirect') || '/';
            sessionStorage.removeItem('postLoginRedirect');
            toast.success('Successfully signed in');
            navigate(redirectPath);
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info('You have been signed out');
          navigate('/login');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    sessionStorage.setItem('authRedirectPending', '1');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      sessionStorage.removeItem('authRedirectPending');
      const unconfirmed =
        error?.code === 'email_not_confirmed' ||
        /confirm/i.test(error?.message || '') && /email/i.test(error?.message || '');
      if (unconfirmed) {
        const e = new Error('Please verify your email first. Check your inbox for the verification link.');
        (e as any).code = 'email_not_confirmed';
        toast.error(e.message);
        throw e;
      }
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast.error(error.message || 'Could not resend the verification email');
      throw error;
    }
    toast.success('Verification email sent. Please check your inbox.');
  };

  const signUp = async (email: string, password: string, name?: string, referralCode?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            referral_code: referralCode
          }
        }
      });
      if (error) throw error;

      // Referral attribution now happens in the signup database trigger,
      // because there is no session until the email is confirmed.

      // Admin "new signup" alert is sent server-side by a database trigger.

      const needsConfirmation = !data.session;
      if (!needsConfirmation) toast.success('Account created successfully!');
      return { needsConfirmation };
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Ignore session_not_found errors - user is already logged out
      if (error && !error.message?.includes('session_not_found') && !error.message?.includes('Auth session missing')) {
        throw error;
      }
      // Clear local state even if there's a session error
      setSession(null);
      setUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        resendConfirmation,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe defaults instead of throwing to prevent blank screens
    // during HMR or transient re-render cycles
    return {
      session: null,
      user: null,
      loading: true,
      signIn: async () => { throw new Error('AuthProvider not available'); },
      signUp: async () => { throw new Error('AuthProvider not available'); },
      resendConfirmation: async () => { throw new Error('AuthProvider not available'); },
      signOut: async () => { throw new Error('AuthProvider not available'); },
    } as AuthContextType;
  }
  return context;
};
