import React, { useState } from "react";
import { AddProviderForm } from "./AddProviderForm";

export const AddProviderModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [name, setName] = useState("");

  // Closed
  if (!open) return null;

  // Open
  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className="modal-box">
        {/*Close Button*/}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <AddProviderForm />

        <div className=" flex gap-2 justify-end">
          {/*Close Button*/}
          <button
            className="btn"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
