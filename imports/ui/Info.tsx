import React from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";

export const Info = () => {
  const isLoading = useSubscribe("patients");
  const patients = useFind(() => PatientsCollection.find());

  if (isLoading()) {
    return <div>Loading...</div>;
  }

  const makePatient = (patient: Patient) => {
    return (
      <li key={ patient._id }>
        <p>Name: {patient.name} | Email: {patient.email ?? "null"} | Number: {patient.number ?? "null"}</p>
      </li>
    );
  }

  return (
    <div>
      <h2>Learn Meteor!</h2>
      <ul>{ patients.map(makePatient) }</ul>
    </div>
  );
};
