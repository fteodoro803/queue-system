import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { TEST_DATE, TEST_SETTINGS, TIME_MULTIPLIER } from "../dev/settings";

export const TimeContext = createContext<Date | null>(null);

export const TimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState(TEST_DATE ?? new Date());
  const updateTime = 1000; // Update every 1 second (in ms)

  // Update time every second, applying time multiplier if enabled
  const startedAt = useRef(Date.now());
  useEffect(() => {
    if (TEST_SETTINGS.FREEZE_TIME) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt.current) * TIME_MULTIPLIER;
      const now = TEST_DATE
        ? new Date(TEST_DATE.getTime() + elapsed)
        : new Date();

      setTime(now);
    }, updateTime);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
};

// Custom hook for consuming time context
export const useTime = (): Date => {
  const context = useContext(TimeContext);
  if (!context) throw new Error("useTime must be used inside <TimeProvider>");
  return context;
};
