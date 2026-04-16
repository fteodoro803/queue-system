import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TIME_MULTIPLIER } from "/imports/dev/settings";
import { Flags, SettingsCollection } from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";

export const DateTimeContext = createContext<Date | null>(null);

export const DateTimeProvider = ({ children }: { children: ReactNode }) => {
  const isSettingsLoading = useSubscribe("settings");
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;

  const [time, setTime] = useState(
    flags?.USE_TEST_DATE ? flags.TEST_DATE : new Date(),
  );
  const updateTime = 1000; // Update every 1 second (in ms)

  // Update time every second, applying time multiplier if enabled
  const startedAt = useRef(Date.now());
  useEffect(() => {
    if (flags?.FREEZE_TIME) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt.current) * TIME_MULTIPLIER;
      // use test date, if enabled
      const now = flags?.USE_TEST_DATE
        ? new Date(flags.TEST_DATE.getTime() + elapsed)
        : new Date();

      setTime(now);
    }, updateTime);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [flags?.USE_TEST_DATE, flags?.TEST_DATE]);

  if (isSettingsLoading()) return <Loading />;
  if (!flags) return <Loading />;

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
