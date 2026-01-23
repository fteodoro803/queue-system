import React from "react";
import {useFind, useSubscribe} from "meteor/react-meteor-data";
import {Appointment, AppointmentsCollection} from "/imports/api/appointment";

export const Info = () => {
  const isPatientsLoading = useSubscribe("patients");
  const isAppointmentsLoading = useSubscribe("appointments");

  const appointments = useFind(() => AppointmentsCollection.find());

  if (isPatientsLoading() && isAppointmentsLoading) {
    return <div>Loading...</div>;
  }

  const makeAppointment = (appointment: Appointment) => {
    return (
        <li key={ appointment._id}>
          <p>Type: {appointment.type}</p>
        </li>
    );
  }

  return (
    <div>
      <h2>Appointments</h2>
      <ul>{ appointments.map(makeAppointment) }</ul>
    </div>
  );
};
