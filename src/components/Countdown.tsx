import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  onComplete: () => void;
  duration?: number; // Duration in seconds (default: 3)
}

export default function Countdown({ onComplete, duration = 3 }: CountdownProps) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 600); // Faster countdown: 0.6s instead of 1s

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 animate-in">
        <div className={cn(
          "text-9xl font-bold font-mono transition-all duration-300 tabular-nums",
          count === 3 && "text-destructive animate-pulse",
          count === 2 && "text-warning",
          count === 1 && "text-success"
        )}>
          {count}
        </div>
        <div className="text-xl font-medium text-muted-foreground tracking-wide">
          Get ready...
        </div>
      </div>
    </div>
  );
}

