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
      {/* Floating Action Button - only shows on small screens */}
      <div className="fixed bottom-4 left-4 z-50 max-w-[calc(100vw-2rem)] lg:hidden">
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
        <div className="drawer-content flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-base-200">
          <div className="mx-4 my-5 sm:m-6 lg:m-8">
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
          <ul className="menu bg-base-100/95 flex min-h-full w-80 flex-col gap-1 border-r border-base-300/60 p-4 backdrop-blur-sm">
            {/* Logo slot */}
            <div className="mb-2 rounded-2xl border border-dashed border-base-300 bg-base-200/70 p-4">
              <div className="flex h-14 items-center justify-center rounded-xl bg-base-100/80 text-sm font-medium text-base-content/60">
                Logo Placeholder
              </div>
            </div>

            {/* Admin Sidebar */}
            {isAdmin && adminPages()}

            {/* Patient Sidebar */}
            {isPatient && patientPages()}

            {/* Date and Time */}
            <div className="mt-auto flex justify-center rounded-xl bg-base-200/70 px-3 py-2">
              <p className="text-xs font-medium tracking-wide text-base-content/70">{`${now.toLocaleDateString()} ${formatDateToLocale(now, true)}`}</p>
            </div>
          </ul>
        </div>
      </div>
    </>
  );
};
