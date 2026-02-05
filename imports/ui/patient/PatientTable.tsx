import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { PatientDetailsModal } from "/imports/ui/patient/PatientDetailsModal";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export const PatientTable = () => {
  const isPatientsLoading = useSubscribe("patients");
  const patients = useFind(() => PatientsCollection.find());
  const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Sync selected patient when patients array updates
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find((p) => p._id === selectedPatient._id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients]);

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
                    <EllipsisHorizontalIcon className="h-6 w-6" />
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
