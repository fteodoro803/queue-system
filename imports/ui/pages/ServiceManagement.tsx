import React from "react";
import { ServiceDetails } from "/imports/ui/service/ServiceDetails";
import { AddServiceForm } from "/imports/ui/service/AddServiceForm";

export const ServiceManagement = () => {
  return (
    <>
      {/*<div className="flex items-center justify-between px-50">*/}
      <div className="flex justify-between">

        <h1 class="text-3xl font-bold">Service Management</h1>
      </div>
      <AddServiceForm/>

      <ServiceDetails/>
    </>
  );
};