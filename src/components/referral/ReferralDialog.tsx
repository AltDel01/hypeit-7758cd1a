import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReferral } from '@/hooks/useReferral';
import { Zap, Share2, Crown, MessageSquare, Link2, X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferralDialog: React.FC<ReferralDialogProps> = ({ open, onOpenChange }) => {
  const { referralCode, referralLink, signedUp, converted, isLoading, generateCode } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAndCopy = async () => {
    if (!referralCode) {
      await generateCode();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        {/* Hero section */}
        <div className="relative p-6 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
            Earn 50+ credits
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground mb-1">
            Spread the word
          </DialogTitle>
          <p className="text-muted-foreground text-sm">and earn free credits</p>

          {/* Decorative gradient blob */}
          <div className="absolute top-4 right-4 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/60 via-pink-500/50 to-orange-400/60 blur-sm opacity-80" />
        </div>

        {/* How it works */}
        <div className="px-6 pb-4 space-y-4">
          <p className="text-muted-foreground text-sm font-medium">How it works:</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Share2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground text-sm font-medium">Share your invite link</span>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground text-sm">
                They sign up and get <strong>extra 10 credits</strong>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground text-sm">
                You get <strong>50 credits</strong> once they subscribe to a qualifying paid plan
              </span>
            </div>
          </div>

          {/* Stats */}
          <p className="text-primary text-sm font-medium pt-2">
            {signedUp} signed up, {converted} converted
          </p>

          {/* Referral link */}
          {referralCode ? (
            <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-3">
              <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground text-sm flex-1 truncate font-mono">
                {referralLink}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0 gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGenerateAndCopy}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate my referral link
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            <a href="/terms" className="underline hover:text-foreground transition-colors">
              View Terms and Conditions
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralDialog;
