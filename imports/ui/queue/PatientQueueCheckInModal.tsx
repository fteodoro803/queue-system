import React, { useState } from "react";
import {
  CheckInResult,
  patientSelfCheckIn,
} from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export const PatientQueueCheckInModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();
  const [id, setId] = useState("");
  const [feedbackType, setFeedbackType] = useState<CheckInResult["result"]>();

  const handleCheckIn = async () => {
    try {
      const result = await patientSelfCheckIn({ id, time: now });

      setFeedbackType(result.result);
    } catch (error) {
      console.error("Check-in error:", error);
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

        {/* Feedback Messages */}
        {feedbackType && <FeedbackAlert feedback={feedbackType} />}

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

const FeedbackAlert = ({ feedback }: { feedback: CheckInResult["result"] }) => {
  if (feedback === "success") {
    return (
      <div className="alert alert-success mt-4 mb-4">
        <CheckCircleIcon className="h-6 w-6" />
        <span>You have successfully checked in!</span>
      </div>
    );
  } else if (feedback === "already-checked-in") {
    return (
      <div className="alert alert-success mt-4 mb-4">
        <CheckCircleIcon className="h-6 w-6" />
        <span>You are already checked in!</span>
      </div>
    );
  } else {
    return (
      <div className="alert alert-error mt-4 mb-4">
        <XCircleIcon className="h-6 w-6" />
        <div className={"flex flex-col gap-1"}>
          <span>Unable to check in.</span>

          <span>
            {feedback === "entry-not-found" && "ID not found."}
            {feedback === "invalid-status" &&
              "Your entry is not in a valid status for check-in."}
            {feedback === "unknown-error" && "An unknown error occurred."}
          </span>

          <span>Please try again or contact reception for assistance.</span>
        </div>
      </div>
    );
  }
};
