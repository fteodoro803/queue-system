import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarItem } from "/imports/ui/navigation/SidebarItem";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { formatDateToLocale } from "/imports/utils/utils";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Flags, SettingsCollection } from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";
import { AdminPages, PatientPages } from "/imports/ui/navigation/NavLink";
import { FloatingActionButton } from "/imports/ui/navigation/FloatingActionButton";

export const AppLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  const isPatient = location.pathname.startsWith("/patient");
  const now = useDateTime();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSettingsLoading = useSubscribe("settings");
  const flags = useFind(() =>
    SettingsCollection.find({ _id: "app_flags" }),
  )[0] as Flags | undefined;

  if (isSettingsLoading()) return <Loading />;

  if (!flags) {
    console.log("Flags not found");
    return <Loading />;
  }

  // Home Screen - don't show dashboard
  if (isHome) return <Outlet />;

  // Admin Pages
  const adminPages = () => {
    return AdminPages.map((page) => (
      <SidebarItem
        key={page.link}
        navLink={page}
        isTestFlagEnabled={flags.ENABLE_TEST_FEATURES}
      />
    ));
  };

  // Patient Pages
  const patientPages = () => {
    return PatientPages.map((page) => (
      <SidebarItem
        key={page.link}
        navLink={page}
        isTestFlagEnabled={flags.ENABLE_TEST_FEATURES}
      />
    ));
  };

  return (
    <>
      {/* Floating button - only shows on small screens */}
      <div className="fixed bottom-4 left-4 lg:hidden z-50">
        {/* hamburger icon */}
        {isAdmin && (
          <FloatingActionButton
            pages={AdminPages}
            isTestFlagEnabled={flags.ENABLE_TEST_FEATURES}
          />
        )}
        {isPatient && (
          <FloatingActionButton
            pages={PatientPages}
            isTestFlagEnabled={flags.ENABLE_TEST_FEATURES}
          />
        )}
      </div>

      {/* Drawer - sidebar hidden on small, always visible on large */}
      <div className="drawer lg:drawer-open">
        <input
          id="my-drawer-3"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={() => setDrawerOpen(!drawerOpen)}
        />

        {/* Main content area */}
        <div className="drawer-content flex flex-col min-h-screen bg-base-200">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>

        {/* Sidebar */}
        <div className="drawer-side z-40 shadow-sm">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-100 min-h-full w-80 p-4">
            {/* Date and Time */}
            <div className="flex justify-center">
              <p className="text-sm">{`${now.toLocaleDateString()} ${formatDateToLocale(now, true)}`}</p>
            </div>

            {/* Admin Sidebar */}
            {isAdmin && adminPages()}

            {/* Patient Sidebar */}
            {isPatient && patientPages()}
          </ul>
        </div>
      </div>
    </>
  );
};
