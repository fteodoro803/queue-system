import React, { useState } from "react";
import { AddPatientForm } from "/imports/ui/patient/AddPatientForm";

export const AddPatientModal = ({open, setOpen}: {
  open: boolean;
  setOpen: (boolean) => void;
}) => {
  const [name, setName] = useState("");

  // Closed
  if (!open) return null;

  // Open
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">

        <AddPatientForm/>

        <div className=" flex gap-2 justify-end">
          {/*Close Button*/}
          <button className="btn" onClick={() => {
            setOpen(false);
          }}>Close
          </button>
        </div>
      </div>
    </div>
  );
};