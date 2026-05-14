import React, { useState } from "react";
import { patientSelfCheckIn } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";

type FeedbackType = "success" | "already-checked-in" | "error" | null;

export const PatientQueueCheckInModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  const now = useDateTime();
  const [id, setId] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

  const handleCheckIn = async () => {
    try {
      const result = await patientSelfCheckIn({ id, time: now });

      if (result.result === "success") {
        setFeedbackType("success");
      } else if (result.result === "already-checked-in") {
        setFeedbackType("already-checked-in");
      } else {
        setFeedbackType("error");
      }
    } catch (error) {
      setFeedbackType("error");
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
        {feedbackType === "success" && (
          <div className="alert alert-success mt-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>You have successfully checked in!</span>
          </div>
        )}

        {feedbackType === "already-checked-in" && (
          <div className="alert alert-info mt-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>You are already checked in!</span>
          </div>
        )}

        {feedbackType === "error" && (
          <div className="alert alert-error mt-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-2l2 2m0 0l2 2m-2-2l-2 2m2-2l2-2"
              />
            </svg>
            <div>
              <span>
                Unable to check in. Please try again or contact reception for
                assistance.
              </span>
            </div>
          </div>
        )}

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
