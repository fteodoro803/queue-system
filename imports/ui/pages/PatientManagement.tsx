import React, { useState } from "react";
import { PatientTable } from "/imports/ui/patient/PatientTable";
import { AddPatientModal } from "/imports/ui/patient/AddPatientModal";

export const PatientManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/*<div className="flex items-center justify-between px-50">*/}
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
        >
          Add Patient
        </button>
      </div>

      <PatientTable />

      {/*Add Patient Modal*/}
      <AddPatientModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
};
