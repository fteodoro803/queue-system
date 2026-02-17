import React from "react";
import { Loading } from "../../components/Loading";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";

export const SelectPatient = ({
  setPatient,
}: {
  setPatient: (patient: Patient) => void;
}) => {
  // Get list of Patients
  const isLoading = useSubscribe("patients");
  const patients = useTracker(() => PatientsCollection.find({}).fetch());

  if (isLoading()) {
    return <Loading />;
  }

  return (
    <div>
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
    </div>
  );
};
