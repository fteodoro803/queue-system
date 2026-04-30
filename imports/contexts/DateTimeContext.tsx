import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Flags, SettingsCollection } from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";

export const DateTimeContext = createContext<Date | null>(null);

export const DateTimeProvider = ({ children }: { children: ReactNode }) => {
  // 1) Read the current dev-time flags reactively from the settings collection.
  const isSettingsLoading = useSubscribe("settings");
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;

  // 2) Keep the currently displayed app time in state.
  //    This is the single source of truth consumed by useDateTime().
  const [time, setTime] = useState(new Date());

  // 3) Keep refs for values that need to survive re-renders without causing re-renders:
  //    - timeRef: the latest displayed time
  //    - previousFlags: previous settings snapshot so we can detect what changed
  //    - simulationAnchor: the pair of timestamps used to simulate time progression
  //      * realMs = the real-world moment we started this simulation segment
  //      * baseMs = the app/simulated time at that same moment
  const timeRef = useRef(time);
  const previousFlags = useRef<Flags | undefined>(undefined);
  const simulationAnchor = useRef({
    realMs: Date.now(),
    baseMs: Date.now(),
  });

  const updateTime = 1000; // Update every 1 second (in ms)

  // 4) Keep timeRef synced with the latest state so effects can read "current time"
  //    without suffering from stale closures.
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // 5) Rebase the simulation clock.
  //    This means: "from this real-world moment onward, pretend the app time starts at baseMs".
  //    We also immediately update state so the UI reflects the new base instantly.
  const rebaseClock = useCallback((baseMs: number) => {
    const realNow = Date.now();
    simulationAnchor.current = {
      realMs: realNow,
      baseMs,
    };
    setTime(new Date(baseMs));
  }, []);

  // 6) Whenever flags change, decide whether the simulated clock needs a new base.
  //    This fixes the original bug where the clock only used test-date values on first render.
  useEffect(() => {
    if (!flags) return;

    const prev = previousFlags.current;

    // 6a) Detect meaningful transitions.
    const testModeJustEnabled = !prev?.USE_TEST_DATE && flags.USE_TEST_DATE;
    const testModeJustDisabled = prev?.USE_TEST_DATE && !flags.USE_TEST_DATE;
    const testDateChanged = prev?.TEST_DATE?.getTime() !== flags.TEST_DATE.getTime();
    const multiplierChanged =
      prev?.USE_TIME_MULTIPLIER !== flags.USE_TIME_MULTIPLIER ||
      prev?.TIME_MULTIPLIER !== flags.TIME_MULTIPLIER;
    const freezeChanged = prev?.FREEZE_TIME !== flags.FREEZE_TIME;

    // 6b) Turning test mode off should snap the app back to real time.
    if (testModeJustDisabled) {
      rebaseClock(Date.now());

    // 6c) Turning test mode on, or changing the chosen TEST_DATE,
    //     should snap the app to that selected simulated date/time.
    } else if (testModeJustEnabled || testDateChanged) {
      rebaseClock(flags.TEST_DATE.getTime());

    // 6d) Changing freeze or multiplier should preserve the currently displayed simulated time,
    //     then continue from there using the new behavior.
    } else if (freezeChanged || multiplierChanged) {
      rebaseClock(timeRef.current.getTime());

    // 6e) On first load, initialize the app clock from either TEST_DATE or real time.
    } else if (!prev) {
      rebaseClock(flags.USE_TEST_DATE ? flags.TEST_DATE.getTime() : Date.now());
    }

    // 6f) Store current flags so the next run can compare against them.
    previousFlags.current = flags;
  }, [flags, rebaseClock]);

  // 7) Tick the clock every second, unless FREEZE_TIME is enabled.
  //    - In normal mode, we just mirror real time.
  //    - In test-date mode, we compute elapsed real time since the last rebase,
  //      multiply it if needed, and add it to the simulated base time.
  useEffect(() => {
    if (!flags) return;
    if (flags?.FREEZE_TIME) return;

    const interval = setInterval(() => {
      // 7a) Normal app mode: always reflect the actual current time.
      if (!flags.USE_TEST_DATE) {
        setTime(new Date());
        return;
      }

      // 7b) Test-date mode: scale elapsed real time if multiplier is enabled.
      const timeMultiplier = flags.USE_TIME_MULTIPLIER
        ? flags.TIME_MULTIPLIER
        : 1;
      const elapsed =
        (Date.now() - simulationAnchor.current.realMs) * timeMultiplier;

      // 7c) Build the simulated "now" from base time + scaled elapsed time.
      const now = new Date(simulationAnchor.current.baseMs + elapsed);

      setTime(now);
    }, updateTime);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [
    flags,
    flags?.FREEZE_TIME,
    flags?.USE_TEST_DATE,
    flags?.USE_TIME_MULTIPLIER,
    flags?.TIME_MULTIPLIER,
  ]);

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
