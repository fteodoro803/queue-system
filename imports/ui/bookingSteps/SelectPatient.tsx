import React from "react";
import { Loading } from "/imports/ui/components/Loading";
import { useFind, useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { AddPatientForm } from "/imports/ui/patient/AddPatientForm";
import { Flags, SettingsCollection } from "/imports/api/settings";

export const SelectPatient = ({
  setPatient,
}: {
  setPatient: (patient: Patient) => void;
}) => {
  // Get list of Patients
  const isLoading = useSubscribe("patients");
  const patients = useTracker(() => PatientsCollection.find({}).fetch());

  const isSettingsLoading = useSubscribe("settings");
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;

  if (isLoading() || isSettingsLoading()) {
    return <Loading />;
  }

  if (!flags) {
    console.log("Flags not found");
    return <Loading />;
  }

  return (
    <div>
      {flags.ENABLE_TEST_FEATURES && (
        <ul className="list bg-base-100 rounded-box shadow-md">
          <li className="p-4 pb-2 text-xs bg-base-200 opacity-60 tracking-wide flex">
            Patients
          </li>
          {patients.map((p) => (
            <li
              className="list-row rounded-none bg-base/50 hover:bg-base-200"
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
      )}

      <AddPatientForm flat setPatient={setPatient} />
    </div>
  );
};
