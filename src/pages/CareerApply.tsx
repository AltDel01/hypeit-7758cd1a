import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';

const CareerApply = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const position = searchParams.get('position') || '';
  const type = searchParams.get('type') || 'full-time';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    portfolio_url: '',
    cover_letter: '',
  });
  const [personaType, setPersonaType] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.cover_letter || !personaType) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    if (!position) {
      toast({ title: 'No position selected', description: 'Please pick a role from the careers page.', variant: 'destructive' });
      return;
    }
    if (!cvFile) {
      toast({ title: 'CV is required', description: 'Please upload your CV (PDF, DOC or DOCX).', variant: 'destructive' });
      return;
    }
    const ext = (cvFile.name.split('.').pop() || '').toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast({ title: 'Unsupported file type', description: 'Please upload a PDF, DOC or DOCX file.', variant: 'destructive' });
      return;
    }
    if (cvFile.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum CV size is 10 MB.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let cv_url: string | null = null;

      {
        const fileExt = ext;
        const filePath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('career-applications')
          .upload(filePath, cvFile);

        if (uploadError) throw uploadError;
        cv_url = `storage:career-applications/${filePath}`;
      }

      const { error } = await supabase.from('career_applications').insert({
        full_name: form.full_name,
        email: form.email.trim(),
        phone: form.phone,
        position,
        application_type: type,
        cv_url,
        portfolio_url: form.portfolio_url || null,
        cover_letter: form.cover_letter,
        persona_type: personaType,
      });


      if (error) throw error;

      // Notify the team by email (never block the submission on this)
      supabase.functions.invoke('send-career-application', {
        body: {
          full_name: form.full_name,
          email: form.email.trim(),
          phone: form.phone,
          position,
          application_type: type,
          persona_type: personaType,
          portfolio_url: form.portfolio_url || null,
          cover_letter: form.cover_letter,
          has_cv: !!cv_url,
          cv_url,
          cv_filename: cvFile.name,
        },
      }).catch((e) => console.error('Notification failed:', e));

      toast({ title: 'Application submitted!', description: `Thanks for applying to ${position}. We will review your application and get back to you.` });
      navigate('/careers');

    } catch (err: any) {
      console.error('Application error:', err);
      const detail = err?.message || err?.error_description || 'Please try again later.';
      toast({ title: 'Failed to submit', description: detail, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => navigate('/careers')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Careers
          </button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Apply for {position}
            </h1>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {type === 'intern' ? 'Internship' : 'Full-Time'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+62 xxx xxxx xxxx" required />
            </div>


            <div className="space-y-2">
              <Label htmlFor="cv">Upload CV *</Label>
              <div className="relative">
                <label
                  htmlFor="cv"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-input bg-background cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {cvFile ? cvFile.name : 'Choose a file (PDF, DOC, DOCX, max 10MB)'}
                  </span>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio Link</Label>
              <Input id="portfolio_url" name="portfolio_url" value={form.portfolio_url} onChange={handleChange} placeholder="https://your-portfolio.com or drive link" />
            </div>

            <div className="space-y-3">
              <Label>Do you consider yourself: *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'creative', label: 'Creative person' },
                  { value: 'analytical', label: 'Analytical person' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPersonaType(opt.value)}
                    aria-pressed={personaType === opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
                      personaType === opt.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        personaType === opt.value ? 'border-primary' : 'border-muted-foreground/50'
                      }`}
                    >
                      {personaType === opt.value && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="cover_letter">Why do you want to apply for this position? *</Label>
              <Textarea
                id="cover_letter"
                name="cover_letter"
                value={form.cover_letter}
                onChange={handleChange}
                placeholder="Tell us about yourself and why you're interested in this role..."
                className="min-h-[160px]"
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full py-6 text-base font-semibold">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : 'Submit Application'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareerApply;
