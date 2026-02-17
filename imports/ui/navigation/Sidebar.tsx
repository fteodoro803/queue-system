import React from "react";
import {
  HomeIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  BugAntIcon,
} from "@heroicons/react/24/solid";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeController } from "../components/ThemeController";
import { NavLinkItem } from "./NavLinkItem";

export const Sidebar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");

  // Home Screen - don't show dashboard
  if (isHome) return <Outlet />;

  return (
    <>
      {/* Floating button - only shows on small screens */}
      <div className="fixed bottom-4 left-4 lg:hidden z-50">
        <label
          htmlFor="my-drawer-3"
          className="btn btn-circle btn-xl shadow-lg"
        >
          <EllipsisVerticalIcon className="h-6 w-6 text-base" />
        </label>
      </div>

      {/* Drawer - sidebar hidden on small, always visible on large */}
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        {/* Main content area */}
        <div className="drawer-content flex flex-col">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>

        {/* Sidebar */}
        <div className="drawer-side z-40">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base min-h-full w-80 p-4">
            <NavLinkItem link="/" label="Home" icon={HomeIcon} />

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
                <NavLinkItem
                  link="/admin/appointmentManagement"
                  label="Appointments"
                  icon={CalendarDaysIcon}
                />

                {/*Patients Button*/}
                <NavLinkItem
                  link="/admin/patientManagement"
                  label="Patients"
                  icon={UserGroupIcon}
                />

                {/*Services Button*/}
                <NavLinkItem
                  link="/admin/serviceManagement"
                  label="Services"
                  icon={WrenchScrewdriverIcon}
                />

                {/* Test Page Button */}
                <NavLinkItem
                  link="/admin/test"
                  label="Test Page"
                  icon={BugAntIcon}
                />
              </>
            )}

            {/*Patient Sidebars*/}

            {/* Theme Controller */}
            <ThemeController />
          </ul>
        </div>
      </div>
    </>
  );
};
