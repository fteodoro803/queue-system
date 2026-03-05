import React from "react";
import { formatDateToLocale } from "/imports/utils/utils";
import { useDateTime } from "../../contexts/DateTimeContext";

/**
 * Clock component that displays the current time.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS classes to apply to the wrapper div
 *
 * @example
 * // Standalone clock
 * <Clock />
 *
 * @example
 * // Clock with custom styling
 * <Clock className="text-lg" />
 */
export const Clock = ({ className }: { className?: string }) => {
  const time = useDateTime();

  return (
    <div className={className}>
      <p className="">{formatDateToLocale(time)}</p>
    </div>
  );
};
