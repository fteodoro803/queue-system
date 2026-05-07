import React, { useEffect, useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Patient, PatientsCollection } from "/imports/api/patient";
import { PatientDetailsModal } from "/imports/ui/patient/PatientDetailsModal";
import { Avatar } from "/imports/ui/components/Avatar";
import { Loading } from "/imports/ui/components/Loading";
import { styles } from "/imports/utils/styles";

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

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientDetailsModalOpen(true);
  };

  // Loading
  if (isPatientsLoading()) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="overflow-x-auto rounded-xl">
        <table
          className={`table w-full min-w-160 ${styles.outline} rounded-xl overflow-hidden`}
        >
          {/* head */}
          <thead className="bg-base-300 text-xs sm:text-sm">
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Number</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const modalId: string = `my_modal_${p._id}`;
              return (
                <tr
                  key={modalId}
                  className="bg-base-100 hover:bg-base-300 cursor-pointer"
                  onClick={() => handleSelect(p)}
                >
                  {/*Avatar*/}
                  <th className="w-14">
                    <Avatar profile={p} />
                  </th>

                  {/*Name*/}
                  <td className="max-w-48 truncate" title={p.name}>
                    {p.name}
                  </td>

                  {/*Email*/}
                  <td className="max-w-64 truncate" title={p.email ?? "-"}>
                    {p.email ? p.email : "-"}
                  </td>

                  {/*Number*/}
                  <td className="whitespace-nowrap">{p.number ? p.number : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
