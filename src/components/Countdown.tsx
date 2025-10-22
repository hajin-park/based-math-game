import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-9xl font-bold font-mono tabular-nums",
              count === 3 && "text-muted-foreground",
              count === 2 && "text-foreground",
              count === 1 && "text-primary"
            )}
          >
            {count}
          </motion.div>
        </AnimatePresence>
        <p className="text-xl font-medium text-muted-foreground">
          Get ready...
        </p>
      </div>
    </div>
  );
}

