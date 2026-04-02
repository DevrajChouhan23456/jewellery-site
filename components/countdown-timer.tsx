"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endTime?: Date;
  className?: string;
}

export function CountdownTimer({ endTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Default to 24 hours from now if no endTime provided
    const targetTime = endTime || new Date(Date.now() + 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium ${className}`}
    >
      <Clock className="size-3" />
      <span>
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    </motion.div>
  );
}

// Hook for random FOMO timers
export function useFomoTimer() {
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    // Show timer randomly (30% chance)
    const shouldShow = Math.random() < 0.3;
    setShowTimer(shouldShow);
  }, []);

  return showTimer;
}