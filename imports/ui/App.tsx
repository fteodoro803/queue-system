import React from 'react';
import { Info } from './Info';
import { AddPatientForm } from "/imports/ui/AddPatientForm";
import {AddAppointmentForm} from "/imports/ui/AddAppointmentForm";

export const App = () => (
    <div>
        <h1>Welcome to Meteor!</h1>
        <AddPatientForm />
        <AddAppointmentForm />
        <Info />
    </div>
);
