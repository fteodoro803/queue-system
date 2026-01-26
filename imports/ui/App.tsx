import React from 'react';
import {AddPatientForm} from "/imports/ui/patient/AddPatientForm";
import {PatientTable} from "/imports/ui/patient/PatientTable";

export const App = () => (
  <div>
    <h1>Patients</h1>
    <AddPatientForm/>
            <PatientTable/>

  </div>
);
