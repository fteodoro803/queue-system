import React from 'react';
import { Hello } from './Hello';
import { Info } from './Info';
import { AddPatientForm } from "/imports/ui/AddPatientForm";

export const App = () => (
    <div>
        <h1>Welcome to Meteor!</h1>
        <Hello />
        <AddPatientForm />
        <Info />
    </div>
);
