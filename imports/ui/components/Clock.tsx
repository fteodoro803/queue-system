import React, { useState, useEffect } from "react";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const updateTime = 10000; // Update every 10 seconds (in ms)

  // Continuously update the current time at the specified interval
  useEffect(() => {
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
        })}
      </p>
    </div>
  );
};
