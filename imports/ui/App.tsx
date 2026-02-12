import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { PatientManagement } from "./pages/PatientManagement";
import { Sidebar } from "/imports/ui/navigation/Sidebar";
import { AdminDashboard } from "/imports/ui/pages/AdminDashboard";
import { ServiceManagement } from "/imports/ui/pages/ServiceManagement";
import { AppointmentManagement } from "./pages/AppointmentManagement";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<Home />} />

        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patientManagement" element={<PatientManagement />} />
          <Route path="serviceManagement" element={<ServiceManagement />} />
          <Route
            path="appointmentManagement"
            element={<AppointmentManagement />}
          />
        </Route>

        {/* Patient Routes */}
        <Route path="patient" element={<PatientManagement />} />

        {/* Service Provider Routes */}
        <Route path="service" element={<PatientManagement />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
