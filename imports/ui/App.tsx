import React from 'react';
import {AddPatientForm} from "/imports/ui/patient/AddPatientForm";
import {PatientTable} from "/imports/ui/patient/PatientTable";
import {AddServiceForm} from "/imports/ui/service/addServiceForm";
import {AddAppointmentForm} from "/imports/ui/appointment/AddAppointmentForm";

export const App = () => (
  <div>
    <h1>Service Type</h1>
    <AddServiceForm/>

    <h1>Appointment</h1>
    <AddAppointmentForm />

    <h1>Patients</h1>
    <AddPatientForm/>
    <PatientTable/>

  </div>
);
