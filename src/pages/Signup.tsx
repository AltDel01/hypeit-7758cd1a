
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { Mail } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const { signUp, resendConfirmation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [searchParams] = useSearchParams();

  // Capture referral code from URL or localStorage
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const refCode = localStorage.getItem('referralCode') || undefined;
      const { needsConfirmation } = await signUp(values.email, values.password, values.name, refCode);
      // Clear referral code after successful signup
      localStorage.removeItem('referralCode');
      if (needsConfirmation) {
        setPendingEmail(values.email);
        setCooldown(60);
      }
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || cooldown > 0) return;
    try {
      await resendConfirmation(pendingEmail);
      setCooldown(60);
    } catch (error) {
      console.error('Resend failed:', error);
    }
  }

  if (pendingEmail) {
    return (
      <AuroraBackground>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#8c52ff]/15">
                <Mail className="h-7 w-7 text-[#8c52ff]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
              <p className="text-gray-400">
                We sent a verification link to{' '}
                <span className="text-white font-medium">{pendingEmail}</span>. Click the link to
                activate your account, then you can log in.
              </p>
              <p className="text-gray-500 text-sm mt-3">
                Can't find it? Check your spam or promotions folder.
              </p>
              <Button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="w-full mt-6 bg-[#8c52ff] hover:bg-[#7a45e6]"
              >
                {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend email'}
              </Button>
              <div className="mt-6">
                <Link to="/login" className="text-[#8c52ff] hover:underline">
                  Back to log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign up for Viralin AI</h1>

            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
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
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#8c52ff] hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
