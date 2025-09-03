import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUserStats } from '@/hooks/use-streaks';
import { STREAK_BADGES } from '@shared/schema';

interface StreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streakDay?: number;
}

export function StreakModal({ open, onOpenChange, streakDay }: StreakModalProps) {
  const { data: stats } = useUserStats();
  const [confettiVisible, setConfettiVisible] = useState(false);

  const currentStreak = streakDay || stats?.currentStreak || 0;
  const badge = STREAK_BADGES[currentStreak as keyof typeof STREAK_BADGES];

  useEffect(() => {
    if (open && badge) {
      setConfettiVisible(true);
      const timer = setTimeout(() => setConfettiVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, badge]);

  const handleShare = async () => {
    if (navigator.share && badge) {
      try {
        await navigator.share({
          title: 'Tasks Ahead Achievement',
          text: `I just earned the "${badge.name}" badge with a ${currentStreak}-day streak! 🎉`,
          url: window.location.origin,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(
          `I just earned the "${badge.name}" badge with a ${currentStreak}-day streak! 🎉 Check out Tasks Ahead: ${window.location.origin}`
        );
      }
    }
  };

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center" data-testid="dialog-streak-celebration">
        {confettiVisible && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="confetti-animation">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="p-8">
          <div className="text-6xl mb-4" data-testid="text-badge-emoji">
            {badge.emoji}
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-badge-name">
            {badge.name}!
          </h3>
          <p className="text-muted-foreground mb-6" data-testid="text-streak-message">
            You've maintained a {currentStreak}-day streak! Keep up the amazing work!
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleShare}
              className="w-full bg-accent hover:bg-accent/90"
              data-testid="button-share-achievement"
            >
              Share Achievement
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
              data-testid="button-continue"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
