import React, { useState, useEffect, useRef } from "react";
import { TEST_DATE, TEST_SETTINGS } from "/imports/dev/settings";
import { formatDateToLocale } from "/imports/utils/utils";

/**
 * Clock component that displays the current time and optionally syncs with parent state.
 *
 * @param {Object} props - Component props
 * @param {(time: Date) => void} [props.setTime] - Optional callback to sync time with parent component. Called every 10 seconds with the current time.
 * @param {string} [props.className] - Optional CSS classes to apply to the wrapper div
 *
 * @example
 * // Standalone clock
 * <Clock />
 *
 * @example
 * // Clock that syncs with parent state
 * const [currentTime, setCurrentTime] = useState(new Date());
 * <Clock setTime={setCurrentTime} className="text-lg" />
 */
export const Clock = ({
  setTime,
  className,
}: {
  setTime?: (time: Date) => void;
  className?: string;
}) => {
  const [currentTime, setCurrentTime] = useState(TEST_DATE ?? new Date());
  const updateTime = 1000; // Update every 1 second (in ms)

  const startedAt = useRef(Date.now());
  useEffect(() => {
    if (TEST_SETTINGS.FREEZE_TIME) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const now = TEST_DATE
        ? new Date(TEST_DATE.getTime() + elapsed)
        : new Date();

      setCurrentTime(now);
      setTime?.(now);
    }, updateTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      <p className="">{formatDateToLocale(currentTime)}</p>
    </div>
  );
};
