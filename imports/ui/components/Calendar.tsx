import React, { Dispatch, SetStateAction, useState } from "react";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/src/style.css";
import { styles } from "/imports/utils/styles";
import { Flags, SettingsCollection } from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe } from "meteor/react-meteor-data";

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
  const isSettingsLoading = useSubscribe("settings");
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;
  const testDate: Date | undefined = flags?.USE_TEST_DATE
    ? flags?.TEST_DATE
    : undefined;

  const today: Date = testDate ?? new Date();
  const [month, setMonth] = useState<Date>(
    testDate ?? startMonth ?? new Date(),
  );

  // Date Options
  const previousDates = { before: today };
  const combinedDisabledDates: Matcher[] = [
    disabledDates ?? [],
    previousDatesDisabled && previousDates,
  ]
    .flat()
    .filter(Boolean) as Matcher[];

  if (isSettingsLoading()) return <Loading />;
  if (!flags) return <Loading />;

  return (
    <DayPicker
      className={`react-day-picker ${styles.outline}`}
      /* --- Modifiers --- */
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month} // the visible month on the calendar
      onMonthChange={setMonth}
      today={today}
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
