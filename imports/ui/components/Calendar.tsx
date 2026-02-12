import React, { useState } from "react";
import { DayPicker, getDefaultClassNames, Matcher } from "react-day-picker";
import "react-day-picker/src/style.css";

// TODO: add tagalog localisation
interface CalendarProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
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
  const defaultClassNames = getDefaultClassNames();
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date>(startMonth ?? new Date());

  // Date Options
  const previousDates = { before: new Date() };
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
      /* --- Style --- */
      disabled={combinedDisabledDates}
      ISOWeek={true} // week starts on Monday
      fixedWeeks={true} // consistent window size
      footer={
        <button className="btn" onClick={() => setMonth(new Date())}>
          Today
        </button>
      }
      classNames={{
        selected: `${defaultClassNames.selected}`,
      }}
    />
  );
};
