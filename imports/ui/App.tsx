import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "/imports/ui/navigation/pages/Home";
import { PatientManagement } from "/imports/ui/navigation/pages/admin/PatientManagement";
import { Sidebar } from "/imports/ui/navigation/Sidebar";
import { AdminDashboard } from "/imports/ui/navigation/pages/admin/AdminDashboard";
import { ServiceManagement } from "/imports/ui/navigation/pages/admin/ServiceManagement";
import { AppointmentManagement } from "/imports/ui/navigation/pages/admin/AppointmentManagement";
import { TestPage } from "/imports/ui/navigation/pages/TestPage";
import { DateTimeProvider } from "/imports/contexts/DateTimeContext";
import { QueueManagement } from "/imports/ui/navigation/pages/admin/QueueManagement";
import { Queue } from "/imports/ui/navigation/pages/patient/Queue";
import { SettingsPage } from "/imports/ui/navigation/pages/admin/SettingsPage";
import { ProviderManagement } from "/imports/ui/navigation/pages/admin/ProviderManagement";
import { Statistics } from "/imports/ui/navigation/pages/admin/Statistics";
import { StatisticsDemo } from "/imports/ui/navigation/pages/admin/StatisticsDemo";

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
            <Route path="patients" element={<PatientManagement />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="providers" element={<ProviderManagement />} />
            <Route path="appointments" element={<AppointmentManagement />} />
            <Route path="queue" element={<QueueManagement />} />
            <Route path="test" element={<TestPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="statistics-demo" element={<StatisticsDemo />} />
          </Route>

          {/* Patient Routes */}
          <Route path="patient">
            <Route path="queue" element={<Queue />} />
          </Route>

          {/* Service Provider Routes */}
          <Route path="service" element={<ServiceManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </DateTimeProvider>
);
