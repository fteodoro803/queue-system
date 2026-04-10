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
} from "@heroicons/react/24/solid";
import { Outlet, useLocation } from "react-router-dom";
import { NavLinkItem } from "/imports/ui/navigation/NavLinkItem";
import { useDateTime } from "/imports/contexts/DateTimeContext";
import { formatDateToLocale } from "/imports/utils/utils";
import { TEST_SETTINGS } from "/imports/dev/settings";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export const Sidebar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  const isPatient = location.pathname.startsWith("/patient");
  const now = useDateTime();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

            {TEST_SETTINGS.ENABLE_TEST_PAGES && (
              <NavLinkItem link="/" label="Home" icon={HomeIcon} />
            )}

            {/*Admin Sidebar*/}
            {isAdmin && (
              <>
                {/*Dashboard Button*/}
                <NavLinkItem
                  link="/admin/dashboard"
                  label="Dashboard"
                  icon={PresentationChartLineIcon}
                />

                {/*Appointments Button*/}
                {TEST_SETTINGS.ENABLE_TEST_PAGES && (
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
                {TEST_SETTINGS.ENABLE_TEST_PAGES && (
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

                {/* Test Page Button */}
                {TEST_SETTINGS.ENABLE_TEST_PAGES && (
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
