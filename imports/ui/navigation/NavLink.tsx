import { ComponentType } from "react";
import {
  BugAntIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  HomeIcon,
  IdentificationIcon,
  NumberedListIcon,
  PresentationChartLineIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

export type NavLinkItem = {
  link: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isTestOnly?: boolean;
};

const LandingPage = {
  link: "/",
  label: "Landing Page",
  icon: HomeIcon,
};

const AdminDashboardPage = {
  link: "/admin/dashboard",
  label: "Dashboard",
  icon: PresentationChartLineIcon,
};

const AdminAppointmentsPage = {
  link: "/admin/appointments",
  label: "Appointments",
  icon: CalendarDaysIcon,
};

const AdminQueuePage = {
  link: "/admin/queue",
  label: "Queue",
  icon: NumberedListIcon,
};

const AdminPatientsPage = {
  link: "/admin/patients",
  label: "Patients",
  icon: UsersIcon,
  isTestOnly: true,
};

const AdminServicesPage = {
  link: "/admin/services",
  label: "Services",
  icon: WrenchScrewdriverIcon,
};

const AdminServiceProvidersPage = {
  link: "/admin/providers",
  label: "Service Providers",
  icon: IdentificationIcon,
};

const AdminStatisticsPage = {
  link: "/admin/statistics",
  label: "Actual Statistics",
  icon: ChartPieIcon,
  isTestOnly: true,
};

const AdminStatisticsDemoPage = {
  link: "/admin/statistics-demo",
  label: "Statistics",
  icon: ChartPieIcon,
};

const AdminTestPage = {
  link: "/admin/test",
  label: "Test Page",
  icon: BugAntIcon,
};

const AdminSettingsPage = {
  link: "/admin/settings",
  label: "Settings",
  icon: Cog6ToothIcon,
};

const PatientQueuePage = {
  link: "/patient/queue",
  label: "Queue",
  icon: NumberedListIcon,
};

export const AdminPages: NavLinkItem[] = [
  LandingPage,
  AdminDashboardPage,
  AdminAppointmentsPage,
  AdminQueuePage,
  AdminPatientsPage,
  AdminServicesPage,
  AdminServiceProvidersPage,
  AdminStatisticsDemoPage,
  AdminStatisticsPage,
  AdminTestPage,
  AdminSettingsPage,
];

export const PatientPages: NavLinkItem[] = [PatientQueuePage];
