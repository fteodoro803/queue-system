import React, { useState } from "react";
import { patientSelfCheckIn } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const PatientQueueCheckInModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();
  const [id, setId] = useState("");

  const handleCheckIn = async () => {
    // TODO: Implement check-in functionality
    const result = await patientSelfCheckIn({ id, time: now });
    console.log("Check-in result:", result);

    if (result.isReady) {
      alert("Check-in successful!");
      setOpen(false);
    } else {
      alert("Check-in failed. Please try again, or go through reception.");
    }
  };

  return (
    <div className="modal modal-open" role={"dialog"}>
      <div className={`modal-box relative`}>
        {/* Close Button */}
        <button
          className="btn btn-circle btn-ghost absolute top-2 right-2 gap-2 p-2 z-50"
          onClick={() => setOpen(false)}
        >
          X
        </button>

        <h3 className="text-lg font-bold">Check In</h3>

        {/* Patient ID Input */}
        <div className="form-control w-full py-4">
          <label className="label">
            <span className="label-text font-medium">Enter Your ID</span>
          </label>
          {/* TODO: change this to a Field type */}
          <input
            type="text"
            placeholder="Your patient ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input input-bordered w-full focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-action gap-2">
          <button
            className="btn btn-primary"
            onClick={handleCheckIn}
            disabled={!id}
          >
            Check In
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
