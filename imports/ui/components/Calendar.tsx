import React, { useState } from "react";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/src/style.css";
import { TEST_DATE } from "/imports/dev/settings";

// TODO: add tagalog localisation
interface CalendarProps {
  date?: Date;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  startMonth?: Date;
  disabledDates?: Matcher[];
  previousDatesDisabled?: boolean;
}

export const Calendar = ({
  date,
  setDate,
  startMonth = TEST_DATE ?? undefined, // default to current month if not provided, use TEST_DATE for testing purposes
  disabledDates,
  previousDatesDisabled,
}: CalendarProps) => {
  const [month, setMonth] = useState<Date>(startMonth ?? new Date());

  // Date Options
  const previousDates = { before: month };
  const combinedDisabledDates: Matcher[] = [
    disabledDates ?? [],
    previousDatesDisabled && previousDates,
  ]
    .flat()
    .filter(Boolean) as Matcher[];

  return (
    <DayPicker
      className="react-day-picker"
      /* --- Modifiers --- */
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month} // the visible month on the calendar
      onMonthChange={setMonth}
      today={TEST_DATE ?? new Date()}
      /* --- Style --- */
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
