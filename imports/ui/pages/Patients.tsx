import React from "react";
import {PatientTable} from "/imports/ui/patient/PatientTable";

export const Patients = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Patient Management</h1>
        <button className="btn btn-primary">Add Patient</button>
      </div>

      <PatientTable/>
    </>
  );
}