import React, { useState } from "react";
import { MODAL_SIZES } from "/imports/utils/modalSizes";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Service, ServicesCollection } from "/imports/api/service";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { Loading } from "../components/Loading";
import { enqueue } from "/imports/api/queueEntryMethods";
import { useDateTime } from "/imports/contexts/DateTimeContext";

export const MakeQueueEntryModal = ({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) => {
  // Subscriptions
  const isServicesLoading = useSubscribe("services");
  const isPatientsLoading = useSubscribe("patients");
  const services = useFind(() => ServicesCollection.find({}));
  const patients = useFind(() => PatientsCollection.find({}));

  // States
  const now = useDateTime();
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);

  // Handlers
  const handleSubmit = async () => {
    if (!patient || !service) return;
    await enqueue({ patient, service }, now);
    setOpen(false);
  };

  if (isServicesLoading() || isPatientsLoading()) {
    return <Loading />;
  }

  return (
    <div className="modal modal-open" role={"dialog"}>
      {
        <div className={`modal-box ${MODAL_SIZES.booking} relative`}>
          {/* Close Button */}
          <button
            className="btn btn-circle btn-ghost absolute top-2 right-2 gap-2 p-2 z-50"
            onClick={() => setOpen(false)}
          >
            X
          </button>

          {/* Modal Content */}
          <div className="flex flex-col py-3 gap-6">
            <h2 className="text-2xl font-bold mb-4">Join Queue</h2>

            {/* Patients List */}
            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide flex">
                Patients
              </li>
              {patients.map((p) => (
                <li
                  className="list-row hover:bg-base-300"
                  key={p._id}
                  onClick={() => {
                    setPatient(p);
                  }}
                >
                  <div></div>
                  <div>
                    <div>{p.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      {p.email ?? "No email"} | {p.number ?? "No number"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Services List */}
            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide flex">
                Services
              </li>
              {services.map((s) => (
                <li
                  className="list-row hover:bg-base-300"
                  key={s._id}
                  onClick={() => {
                    setService(s);
                  }}
                >
                  <div></div>
                  <div>
                    <div>{s.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      {s.description}
                    </div>
                  </div>
                  <p>from ₱{s.cost}</p>
                  <p>{s.duration} minutes</p>
                </li>
              ))}
            </ul>

            {/* Confirm Details */}
            <div>
              <p>Patient: {patient?.name ?? "None selected"}</p>
              <p>Service: {service?.name ?? "None selected"}</p>
            </div>

            {/* Confirm Button */}
            <button className="btn btn-primary" onClick={handleSubmit}>
              Confirm
            </button>
          </div>
        </div>
      }

      {/* Closes modal when clicking outside */}
      <div className="modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  );
};
