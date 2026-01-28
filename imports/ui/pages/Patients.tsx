import React, {useState} from "react";
import {PatientTable} from "/imports/ui/patient/PatientTable";
import {LeftSidebar} from "/imports/ui/navigation/LeftBar";

export const Patients = () => {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Patient Management</h1>
        <button className="btn btn-primary">Add Patient</button>
      </div>
      <button className="btn btn-primary" onClick={() => setOpenSidebar(true)}>
        Sidebar
      </button>
      {openSidebar && <LeftSidebar />}

      <PatientTable/>
    </>
  );
}