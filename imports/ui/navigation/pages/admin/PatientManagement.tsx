import React, { useState } from "react";
import { PatientTable } from "/imports/ui/patient/PatientTable";
import { AddPatientModal } from "/imports/ui/patient/AddPatientModal";

export const PatientManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/*<div className="flex items-center justify-between px-50">*/}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setModalOpen(true)}
        >
          + New Patient
        </button>
      </div>

      <PatientTable />

      {/*Add Patient Modal*/}
      <AddPatientModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
};
