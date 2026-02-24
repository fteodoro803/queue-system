import React, { useState } from "react";
import { Calendar } from "../../components/Calendar";
import { Service } from "/imports/api/service";
import {
  convertStrToHrs,
  createTimeSlots,
  timeStrToLocaleTime,
} from "/imports/utils/utils";
import { getEarliestAppointment } from "/imports/api/appointmentMethods";

export const SelectDateTime = ({
  setDate,
  service,
}: {
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  service: Service | undefined;
}) => {
  // TODO: replace placeholder times with actual available times based on provider's schedule and existing appointments
  const [startTime, endTime]: [number, number] = [9, 17]; // 9am to 5pm
  const placeholderTimes = createTimeSlots(startTime, endTime, 30); // every 30 mins
  const [currDate, setCurrDate] = useState<Date>();

  const setAppointmentTime = (timeStr: string) => {
    if (!currDate) return;

    const convertedTime = convertStrToHrs(timeStr);
    const newDate = new Date(currDate);
    newDate?.setHours(convertedTime[0], convertedTime[1], convertedTime[2]);
    setCurrDate(newDate);
  };

  // Selects the earliest available date and time
  const findEarliestAppointment = async (
    serviceId: string,
    providerId?: string,
  ): Promise<Date | undefined> => {
    const earliestDate = await getEarliestAppointment(serviceId, providerId);
    return earliestDate;
  };

  const confirmAppointmentTime = () => {
    setDate(currDate);
  };

  if (!service)
    return <p className="text-2xl text-warning">Select a Service first</p>;

  return (
    <div className="flex gap-2">
      {/* Calendar */}
      <Calendar date={currDate} setDate={setCurrDate} previousDatesDisabled />

      {/* Appointment Times */}
      <div className="">
        <select
          defaultValue={"No Time Selected"}
          className="select"
          onChange={(e) => setAppointmentTime(e.target.value)}
        >
          <option disabled={true}>No Time Selected</option>
          {placeholderTimes.map((t) => (
            <option key={`time_option_${t}`} value={t}>
              {timeStrToLocaleTime(t)}
            </option>
          ))}
        </select>

        {/* Earliest Available Time Button */}
        <p className="text-sm text-gray-500">
          Earliest Available: {currDate ? currDate.toLocaleString() : "N/A"}
        </p>
        <button
          className="btn"
          onClick={async () => {
            try {
              const earliest = await findEarliestAppointment(service._id);
              if (earliest) setCurrDate(earliest);
            } catch (e) {
              console.error("Failed to get earliest appointment:", e);
            }
          }}
        >
          Set Earliest Available
        </button>

        {/* Confirm Button */}
        <button className="btn btn-primary" onClick={confirmAppointmentTime}>
          Confirm
        </button>
      </div>
    </div>
  );
};
