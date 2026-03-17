import React, { useState } from "react";
import { Appointment } from "/imports/api/appointment";
import { AppointmentListItem } from "/imports/ui/appointment/AppointmentListItem";
import { AppointmentDetailsModal } from "/imports/ui/appointment/AppointmentDetailsModal";

export const AppointmentList = ({
  appointments,
}: {
  appointments: Appointment[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  return (
    <div>
      {/* List */}
      <ul className="list bg-base-100 rounded-box shadow-md">
        {appointments.map((appointment) => (
          <AppointmentListItem
            key={appointment._id}
            appointment={appointment}
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsModalOpen(true);
            }}
          />
        ))}
      </ul>

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          setOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};
