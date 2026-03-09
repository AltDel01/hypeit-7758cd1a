import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FileUploader from '@/components/admin/FileUploader';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const refundSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  issue: z.string().trim().min(10, 'Please describe your issue in at least 10 characters').max(2000),
});

type RefundFormValues = z.infer<typeof refundSchema>;

const RefundRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      issue: '',
    },
  });

  const onSubmit = async (values: RefundFormValues) => {
    setIsSubmitting(true);
    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `refund-requests/${user?.id || 'anonymous'}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload screenshot. Submitting without it.');
        } else {
          screenshotUrl = filePath;
        }
      }

      // Send notification email to admin
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'refund_request',
          userName: values.name,
          userEmail: values.email,
          issue: values.issue,
          screenshotUrl,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success('Your refund request has been submitted! We will review it and get back to you shortly.');
      form.reset();
      setFile(null);
    } catch (error: any) {
      console.error('Refund request error:', error);
      toast.error('Failed to submit request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#8c52ff]/10">
              <ShieldCheck className="h-6 w-6 text-[#8c52ff]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Token Refund Request
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            If the system crashed or failed during generation and your tokens were deducted unintentionally, 
            please fill out the form below. We will review the issue and refund or replenish your tokens accordingly.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
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
                    <FormLabel>Email (used for your account)</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe what happened — e.g. the generation failed, the page crashed, tokens were deducted but no result was produced..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Upload file or screenshot (optional)</Label>
                <FileUploader file={file} setFile={setFile} className="min-h-[140px]" />
              </div>

              <Button
                type="submit"
                variant="newPurple"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Refund Request
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RefundRequest;
