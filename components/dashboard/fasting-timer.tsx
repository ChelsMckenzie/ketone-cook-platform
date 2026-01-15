"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface FastingTimerProps {
  fastingGoal: number; // in hours (e.g., 16 for 16:8)
}

export function FastingTimer({ fastingGoal }: FastingTimerProps) {
  const [timeFasted, setTimeFasted] = useState(0); // in hours
  const [timeUntilEating, setTimeUntilEating] = useState(0); // in hours
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if there's an active fast
    const startTime = localStorage.getItem("fastingStartTime");
    
    if (startTime) {
      setIsActive(true);
      const start = new Date(startTime);
      const now = new Date();
      const hoursFasted = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
      setTimeFasted(hoursFasted);
      setTimeUntilEating(Math.max(0, fastingGoal - hoursFasted));
    }

    const interval = setInterval(() => {
      if (startTime) {
        const start = new Date(startTime);
        const now = new Date();
        const hoursFasted = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
        setTimeFasted(hoursFasted);
        setTimeUntilEating(Math.max(0, fastingGoal - hoursFasted));
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [fastingGoal]);

  const startFast = () => {
    const now = new Date();
    localStorage.setItem("fastingStartTime", now.toISOString());
    setIsActive(true);
    setTimeFasted(0);
    setTimeUntilEating(fastingGoal);
  };

  const stopFast = () => {
    localStorage.removeItem("fastingStartTime");
    setIsActive(false);
    setTimeFasted(0);
    setTimeUntilEating(0);
  };

  const formatTime = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  const fastedTime = formatTime(timeFasted);
  const remainingTime = formatTime(timeUntilEating);
  
  // Calculate clock angle (0-360 degrees for 24 hours)
  const clockAngle = (timeFasted / 24) * 360;

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg rainbow-gradient p-2">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold rainbow-text">Fasting Timer</h2>
        </div>
        {!isActive ? (
          <button
            onClick={startFast}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Start Fast
          </button>
        ) : (
          <button
            onClick={stopFast}
            className="rounded-lg border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          >
            End Fast
          </button>
        )}
      </div>

      {isActive ? (
        <div className="space-y-6">
          {/* Clock Visualization */}
          <div className="flex justify-center">
            <div className="relative h-48 w-48">
              {/* Clock face */}
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="oklch(0.9 0.02 200)"
                  strokeWidth="8"
                />
                {/* Progress arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#rainbow-gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(timeFasted / fastingGoal) * 565} 565`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.7 0.15 25)" />
                    <stop offset="16.66%" stopColor="oklch(0.75 0.12 55)" />
                    <stop offset="33.33%" stopColor="oklch(0.85 0.1 95)" />
                    <stop offset="50%" stopColor="oklch(0.7 0.15 145)" />
                    <stop offset="66.66%" stopColor="oklch(0.65 0.15 250)" />
                    <stop offset="83.33%" stopColor="oklch(0.7 0.15 300)" />
                    <stop offset="100%" stopColor="oklch(0.75 0.12 340)" />
                  </linearGradient>
                </defs>
                {/* Clock hand */}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 70 * Math.cos((clockAngle - 90) * (Math.PI / 180))}
                  y2={100 + 70 * Math.sin((clockAngle - 90) * (Math.PI / 180))}
                  stroke="oklch(0.65 0.18 145)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
              {/* Time display in center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold rainbow-text">
                  {String(fastedTime.h).padStart(2, "0")}:
                  {String(fastedTime.m).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground">hours</div>
              </div>
            </div>
          </div>

          {/* Time Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Time Fasted</p>
              <p className="text-3xl font-bold">
                {String(fastedTime.h).padStart(2, "0")}h {String(fastedTime.m).padStart(2, "0")}m{" "}
                {String(fastedTime.s).padStart(2, "0")}s
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Time Until Eating Window</p>
              <p className="text-2xl font-semibold text-primary">
                {remainingTime.h > 0 || remainingTime.m > 0 || remainingTime.s > 0
                  ? `${String(remainingTime.h).padStart(2, "0")}h ${String(remainingTime.m).padStart(2, "0")}m ${String(remainingTime.s).padStart(2, "0")}s`
                  : "🎉 Eating Window Open!"}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-sm font-medium text-primary">
              Goal: {fastingGoal} hours ({fastingGoal}:{24 - fastingGoal})
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rainbow-gradient transition-all duration-1000"
                style={{ width: `${Math.min((timeFasted / fastingGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-muted p-8">
              <Clock className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Ready to start your {fastingGoal}-hour fast?
          </p>
          <button
            onClick={startFast}
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:scale-105"
          >
            Start Fasting Now
          </button>
        </div>
      )}
    </div>
  );
}
