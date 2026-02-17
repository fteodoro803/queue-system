import React, { useState } from "react";
import { Calendar } from "../../components/Calendar";
import { Service } from "/imports/api/service";
import { convertStrToHrs } from "/imports/utils/utils";

export const SelectDateTime = ({
  setDate,
  service,
}: {
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  service: Service | undefined;
}) => {
  const [currDate, setCurrDate] = useState<Date | undefined>(undefined);
  // const [currTime, setCurrTime] = useState<Date | undefined>(undefined);

  const placeholderTimes = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
  ];

  if (!service)
    return <p className="text-2xl text-red-500">Select a Service first</p>;

  return (
    <div className="flex gap-2">
      {/* Calendar */}
      <Calendar date={currDate} setDate={setCurrDate} previousDatesDisabled />

      {/* Appointment Times */}
      <div className="flex flex-col space-y-2 overflow-y-auto">
        {placeholderTimes.map((t) => {
          return (
            <div key={`time_${t}`}
              className="card sm:w-40 md:w-70 h-20 bg-base-100 card-xs shadow-sm gap-1 hover:bg-base-300"
              onClick={() => {
                const date = currDate;
                const convertedTime = convertStrToHrs(t);
                date?.setHours(convertedTime[0], convertedTime[1]);
                setDate(date);
              }}
            >
              <div className="card-body">
                <h2 className="card-title">{t}</h2>
                <p>Time</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
