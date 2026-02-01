import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { PatientDetailsModal } from "/imports/ui/patient/PatientDetailsModal";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";

export const PatientTable = () => {
  const isPatientsLoading = useSubscribe("patients");
  const patients = useFind(() => PatientsCollection.find());
  const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Loading
  if (isPatientsLoading()) {
    return <Loading />;
  }

  return (
    <div className="min-w-2xl max-w-7xl mx-auto px-8 py-8">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const modalId: string = `my_modal_${p._id}}`;
            return (
              <tr key={modalId} className="hover:bg-base-300">
                {/*Avatar*/}
                <th>
                  <Avatar profile={p} />
                </th>

                {/*Name*/}
                <td>{p.name}</td>

                {/*Email*/}
                <td>{p.email ? p.email : "-"}</td>

                {/*Number*/}
                <td>{p.number ? p.number : "-"}</td>

                {/*Edit Modal*/}
                <td>
                  <button
                    className="btn btn-circle btn-ghost"
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsPatientDetailsModalOpen(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          open={isPatientDetailsModalOpen}
          setOpen={setIsPatientDetailsModalOpen}
        />
      )}
    </div>
  );
};
