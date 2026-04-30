import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/src/style.css";
import { styles } from "/imports/utils/styles";
import { useDateTime } from "/imports/contexts/DateTimeContext";

// TODO: add tagalog localisation
interface CalendarProps {
  date?: Date;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  startMonth?: Date;
  disabledDates?: Matcher[];
  previousDatesDisabled?: boolean;
}

export const Calendar = ({
  date,
  setDate,
  startMonth,
  disabledDates,
  previousDatesDisabled,
}: CalendarProps) => {
  // 1) Read the app's current effective time from DateTimeContext.
  //    This means Calendar now follows USE_TEST_DATE / FREEZE_TIME too,
  //    instead of reading settings flags on its own.
  const today = useDateTime();

  // 2) Derive the first day of the currently active month.
  //    We memoize using year + month only, so this does NOT recompute every second,
  //    only when the visible month actually changes.
  const currentMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today.getFullYear(), today.getMonth()],
  );

  // 3) Keep the calendar's currently displayed month in local state.
  //    - startMonth wins if the parent supplies one
  //    - otherwise we default to the month from the shared app time
  const [month, setMonth] = useState<Date>(startMonth ?? currentMonth);

  // 4) If startMonth changes, or the app clock moves into a different month,
  //    re-sync the visible month.
  useEffect(() => {
    setMonth(startMonth ?? currentMonth);
  }, [startMonth, currentMonth]);

  // 5) Build the disabled-date rules.
  //    When previousDatesDisabled is true, dates before "today" are disabled,
  //    and "today" here respects the shared simulated clock.
  const previousDates = { before: today };
  const combinedDisabledDates: Matcher[] = [
    disabledDates ?? [],
    previousDatesDisabled && previousDates,
  ]
    .flat()
    .filter(Boolean) as Matcher[];


  return (
    <DayPicker
      className={`react-day-picker ${styles.outline}`}
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month} // the visible month on the calendar
      onMonthChange={setMonth}
      today={today}

      disabled={combinedDisabledDates}
      ISOWeek={true} // week starts on Monday
      fixedWeeks={true} // consistent window size
      footer={<p>Selected: {date ? `${date.toLocaleString()}` : "None"}</p>}
      classNames={{
        today: `text font-bold underline`, // make text normal-coloured instead of highlighted
        selected: `bg-accent border-accent text-accent-content rounded-lg`, // Highlight the selected day
        chevron: `fill-primary`,
      }}
    />
  );
};
