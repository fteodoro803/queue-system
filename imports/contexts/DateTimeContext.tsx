import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TEST_DATE, TEST_SETTINGS, TIME_MULTIPLIER } from "/imports/dev/settings";

export const DateTimeContext = createContext<Date | null>(null);

export const DateTimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  return (
    <DateTimeContext.Provider value={time}>{children}</DateTimeContext.Provider>
  );
};

// Custom hook for consuming date and time context
export const useDateTime = (): Date => {
  const context = useContext(DateTimeContext);
  if (!context)
    throw new Error("useDateTime must be used inside <DateTimeProvider>");
  return context;
};
