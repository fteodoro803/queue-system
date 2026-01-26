import React from 'react';
import {AddPatientForm} from "/imports/ui/patient/AddPatientForm";
import {PatientTable} from "/imports/ui/patient/PatientTable";
import {CreateServiceTypeForm} from "/imports/ui/serviceType/createServiceTypeForm";

export const App = () => (
  <div>
    <h1>Service Type</h1>
    <CreateServiceTypeForm />

    <h1>Patients</h1>
    <AddPatientForm/>
    <PatientTable/>

  </div>
);
