
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Navbar from '@/components/layout/Navbar';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const { signIn, resendConfirmation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [params] = useSearchParams();

  // If /login?next=/some/path is present, preserve it for the post-login redirect
  // so OAuth consent (and other deep links) return here after sign-in.
  useEffect(() => {
    const next = params.get('next');
    if (next && next.startsWith('/')) {
      sessionStorage.setItem('postLoginRedirect', next);
    }
  }, [params]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setUnconfirmedEmail(null);
    try {
      await signIn(values.email, values.password);
    } catch (error: any) {
      if (error?.code === 'email_not_confirmed') {
        setUnconfirmedEmail(values.email);
      }
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!unconfirmedEmail || cooldown > 0) return;
    try {
      await resendConfirmation(unconfirmedEmail);
      setCooldown(60);
    } catch (error) {
      console.error('Resend failed:', error);
    }
  }

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Log in to Viralin AI</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com" 
                          {...field} 
                          type="email"
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...field}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#8c52ff] hover:bg-[#7a45e6]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </Form>

            {unconfirmedEmail && (
              <div className="mt-5 rounded-lg border border-[#8c52ff]/40 bg-[#8c52ff]/10 p-4 text-center">
                <p className="text-sm text-gray-200">
                  Please verify your email first. We sent a link to{' '}
                  <span className="font-medium text-white">{unconfirmedEmail}</span>.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="mt-3 w-full border-[#8c52ff]/50 bg-transparent text-white hover:bg-[#8c52ff]/20"
                >
                  {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
                </Button>
              </div>
            )}


            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#8c52ff] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
