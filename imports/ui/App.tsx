import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { PatientManagement } from "./pages/PatientManagement";
import { Sidebar } from "/imports/ui/navigation/Sidebar";
import { AdminDashboard } from "/imports/ui/pages/AdminDashboard";
import { ServiceManagement } from "/imports/ui/pages/ServiceManagement";
import { AppointmentManagement } from "./pages/AppointmentManagement";
import { TestPage } from "./pages/TestPage";
import { DateTimeProvider } from "../contexts/DateTimeContext";
import { QueueManagement } from "./pages/QueueManagement";
import { Queue } from "./pages/patient/Queue";

export const App = () => (
  <DateTimeProvider>
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
            <Route path="queueManagement" element={<QueueManagement />} />
            <Route path="test" element={<TestPage />} />
          </Route>

          {/* Patient Routes */}
          <Route path="patient">
            <Route path="Queue" element={<Queue />} />
          </Route>

          {/* Service Provider Routes */}
          <Route path="service" element={<ServiceManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </DateTimeProvider>
);
