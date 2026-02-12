import React, { useEffect, useState } from "react";
import { AddAppointmentForm } from "../appointment/AddAppointmentForm";
import { Calendar } from "../components/Calendar";
import { selectService } from "../appointment/makeAppointment/SelectService";
import { Service } from "/imports/api/service";
import { Steps } from "../components/Steps";
import { MakeAppointmentModal } from "../appointment/MakeAppointmentModal";

export const AppointmentManagement = () => {
  const [service, setService] = useState<Service | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [step, setStep] = useState<number>(1);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    useState<boolean>(false);

  useEffect(() => {}, [step]);

  const testDates: Date[] = [
    new Date("2026-02-10"),
    new Date("2026-02-16"),
    new Date("2026-02-20"),
  ];

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
      </div>


      <button
        className="btn"
        onClick={() => {
          setIsAppointmentModalOpen(true);
        }}
      >
        Make Appointment
      </button>

      {isAppointmentModalOpen && (
        <MakeAppointmentModal setOpen={setIsAppointmentModalOpen} />
      )}
    </>
  );
};
