import React from "react";
import {useFind, useSubscribe} from "meteor/react-meteor-data";
import {PatientsCollection} from "/imports/api/patient";

export const PatientTable = () => {
  const isPatientsLoading = useSubscribe("patients");
  const patients = useFind(() => PatientsCollection.find());

  // Loading
  if (isPatientsLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <table className="table">
        {/* head */}
        <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Number</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {
          patients.map((p) => (
            <tr key={p._id} className="hover:bg-base-300">
              <td>{p.name}</td>
              <td>{p.email ?? "-"}</td>
              <td>{p.number ?? "-"}</td>
              <td>
                <button className="btn btn-circle btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                       strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    </div>
  );

};