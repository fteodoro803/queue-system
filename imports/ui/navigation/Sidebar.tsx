import React, { useState } from "react";
import {
  HomeIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  BugAntIcon,
  NumberedListIcon,
  Cog6ToothIcon,
  IdentificationIcon,
  ChartPieIcon,
} from "@heroicons/react/24/solid";
import { Outlet, useLocation } from "react-router-dom";
import { NavLinkItem } from "/imports/ui/navigation/NavLinkItem";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { formatDateToLocale } from "/imports/utils/utils";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Flags, SettingsCollection } from "/imports/api/settings";
import { Loading } from "/imports/ui/components/Loading";

export const Sidebar = () => {
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

  return (
    <>
      {/* Floating button - only shows on small screens */}
      <div className="fixed bottom-4 left-4 lg:hidden z-50">
        <label
          htmlFor="my-drawer-3"
          className="btn btn-circle btn-xl swap swap-rotate shadow-lg"
        >
          <input
            type="checkbox"
            checked={drawerOpen}
            onChange={() => setDrawerOpen(!drawerOpen)}
          />

          {/* hamburger icon */}
          <Bars3Icon className="swap-off fill-current h-6 w-6" />

          {/* close icon */}
          <XMarkIcon className="swap-on fill-current h-6 w-6" />
        </label>
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
        <div className="drawer-content flex flex-col bg-base-200">
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

            {/*Admin Sidebar*/}
            {isAdmin && (
              <>
                {flags.ENABLE_TEST_FEATURES && (
                  <NavLinkItem link="/" label="Landing Page" icon={HomeIcon} />
                )}

                {/*Dashboard Button*/}
                <NavLinkItem
                  link="/admin/dashboard"
                  label="Dashboard"
                  icon={PresentationChartLineIcon}
                />

                {/*Appointments Button*/}
                {flags.ENABLE_TEST_FEATURES && (
                  <NavLinkItem
                    link="/admin/appointments"
                    label="Appointments"
                    icon={CalendarDaysIcon}
                  />
                )}

                {/* Queue Button */}
                <NavLinkItem
                  link="/admin/queue"
                  label="Queue"
                  icon={NumberedListIcon}
                />

                {/*Patients Button*/}
                {flags.ENABLE_TEST_FEATURES && (
                  <NavLinkItem
                    link="/admin/patients"
                    label="Patients"
                    icon={UserGroupIcon}
                  />
                )}

                {/*Services Button*/}
                <NavLinkItem
                  link="/admin/services"
                  label="Services"
                  icon={WrenchScrewdriverIcon}
                />

                {/*Service Providers Button*/}
                <NavLinkItem
                  link="/admin/providers"
                  label="Service Providers"
                  icon={IdentificationIcon}
                />

                {/*Stats Button*/}
                {flags.ENABLE_TEST_FEATURES && (
                  <NavLinkItem
                    link="/admin/statistics"
                    label="Actual Statistics"
                    icon={ChartPieIcon}
                  />
                )}

                {/* Statistics Demo Button */}
                <NavLinkItem
                  link="/admin/statistics-demo"
                  label="Statistics"
                  icon={ChartPieIcon}
                />

                {/* Test Page Button */}
                {flags.ENABLE_TEST_FEATURES && (
                  <NavLinkItem
                    link="/admin/test"
                    label="Test Page"
                    icon={BugAntIcon}
                  />
                )}

                <NavLinkItem
                  link="/admin/settings"
                  label="Settings"
                  icon={Cog6ToothIcon}
                />
              </>
            )}

            {/*Patient Sidebars*/}
            {isPatient && (
              <>
                {/*Join Queue Button*/}
                <NavLinkItem
                  link="/patient/queue"
                  label="Queue"
                  icon={NumberedListIcon}
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};
