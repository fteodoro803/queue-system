import React from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { Appointment, AppointmentsCollection } from "/imports/api/appointment";

export const Info = () => {
  const isPatientsLoading = useSubscribe("patients");
  const isAppointmentsLoading = useSubscribe("appointments");

  const patients = useFind(() => PatientsCollection.find());
  const appointments = useFind(() => AppointmentsCollection.find());

  if (isPatientsLoading() && isAppointmentsLoading) {
    return <div>Loading...</div>;
  }

  const makePatient = (patient: Patient) => {
    return (
      <li key={ patient._id }>
        <p>Name: {patient.name} | Email: {patient.email ?? "null"} | Number: {patient.number ?? "null"}</p>
      </li>
    );
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
      <h2>Patients</h2>
      <ul>{ patients.map(makePatient) }</ul>
      <h2>Appointments</h2>
      <ul>{ appointments.map(makeAppointment) }</ul>
    </div>
  );
};
