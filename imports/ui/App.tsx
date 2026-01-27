import React from 'react';
import {AddPatientForm} from "/imports/ui/patient/AddPatientForm";
import {PatientTable} from "/imports/ui/patient/PatientTable";
import {AddServiceForm} from "/imports/ui/service/AddServiceForm";
import {AddAppointmentForm} from "/imports/ui/appointment/AddAppointmentForm";
import {ServiceDetails} from "/imports/ui/service/ServiceDetails";

export const App = () => (
  <div>
    <h1>Services</h1>
    <AddServiceForm/>
    <br/>
    <ServiceDetails/>

    <br/>

    <h1>Appointment</h1>
    <AddAppointmentForm/>

    <br/>


    <h1>Patients</h1>
    <AddPatientForm/>
    <PatientTable/>

  </div>
);
