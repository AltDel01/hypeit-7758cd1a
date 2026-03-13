import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ReviewFeedbackBoxProps {
  requestId: string;
  prompt?: string;
  resultUrl?: string;
  requestType?: string;
  initialRating?: number;
  initialFeedback?: string;
  alreadySubmitted?: boolean;
}

const ReviewFeedbackBox = ({ requestId, prompt, resultUrl, requestType, initialRating, initialFeedback, alreadySubmitted }: ReviewFeedbackBoxProps) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback || '');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(alreadySubmitted || false);
  const [isLoading, setIsLoading] = useState(!alreadySubmitted && !initialRating);

  // Self-fetch existing feedback if not provided by parent
  useEffect(() => {
    if (alreadySubmitted !== undefined || initialRating !== undefined) {
      setIsLoading(false);
      return;
    }
    const fetchExisting = async () => {
      try {
        const { data } = await supabase
          .from('review_feedback' as any)
          .select('rating, feedback')
          .eq('request_id', requestId)
          .maybeSingle();
        if (data) {
          const d = data as any;
          setRating(d.rating);
          setFeedback(d.feedback || '');
          setIsSent(true);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [requestId, alreadySubmitted, initialRating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to submit feedback');
        setIsSending(false);
        return;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('review_feedback' as any)
        .upsert({
          request_id: requestId,
          user_id: session.user.id,
          rating,
          feedback: feedback.trim(),
        } as any, { onConflict: 'request_id,user_id' } as any);

      if (dbError) throw dbError;

      // Send email notification
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'review_feedback',
          userName: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Unknown',
          userEmail: session.user.email || '',
          requestId,
          rating,
          feedback: feedback.trim(),
          prompt: prompt || '',
          resultUrl: resultUrl || '',
          requestType: requestType || 'video',
          timestamp: new Date().toISOString(),
        },
      });

      if (error) console.warn('Email notification failed but feedback saved:', error);

      setIsSent(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Failed to send feedback:', err);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return null;

  if (isSent) {
    return (
      <div className="rounded-lg border border-gray-700/50 bg-gray-900/60 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-400 font-medium">Your review</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-5 h-5',
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              )}
            />
          ))}
        </div>
        {feedback && (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/60 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-300">How's the result?</p>

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'w-6 h-6 transition-colors',
                (hoveredStar || rating) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              )}
            />
          </button>
        ))}
      </div>

      {/* Feedback */}
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your feedback, what can we improve.."
        className="min-h-[60px] bg-gray-800/60 border-gray-700/50 text-white placeholder:text-gray-500 resize-none text-sm"
      />

      {/* Send */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSending || rating === 0}
          size="sm"
          className="gap-1.5"
          style={{ backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' }}
        >
          {isSending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-3.5 h-3.5" /> Send Feedback</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewFeedbackBox;
