import React, { useState } from "react";
import { Calendar } from "../../components/Calendar";
import { Service } from "/imports/api/service";

export const SelectDateTime = ({
  date,
  setDate,
  service,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  service: Service | undefined;
}) => {
  if (!service)
    return <p className="text-2xl text-red-500">Select a Service first</p>;

  return (
    <>
      <Calendar date={date} setDate={setDate} previousDatesDisabled />
    </>
  );
};
