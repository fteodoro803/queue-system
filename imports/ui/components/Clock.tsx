import React, { useState, useEffect } from "react";
import { TEST_TIME } from "/imports/dev/settings";

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
  const [currentTime, setCurrentTime] = useState(TEST_TIME ?? new Date());
  const updateTime = 1000; // Update every 1 second (in ms)

  // Continuously update the current time at the specified interval
  useEffect(() => {
    // Don't start interval if using test time
    if (TEST_TIME) return;

    const interval = setInterval(() => {
      const now = new Date();

      setCurrentTime(now);
      setTime?.(now);
    }, updateTime);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className={className}>
      <p className="">
        {currentTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
        })}
      </p>
    </div>
  );
};
