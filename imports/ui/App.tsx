import React from 'react';
import {Info} from './Info';
import {AddPatientForm} from "/imports/ui/patient/AddPatientForm";
import {PatientTable} from "/imports/ui/patient/PatientTable";
import {AddAppointmentForm} from "/imports/ui/appointment/AddAppointmentForm";

export const App = () => (
    <div>
        <h1>Patients</h1>
        <AddPatientForm />
        <AddAppointmentForm />
        <Info />
    </div>
);
