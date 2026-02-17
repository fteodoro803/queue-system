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
import { Link, Outlet, useLocation } from "react-router-dom";
import { ThemeController } from "../components/ThemeController";

export const Sidebar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  // Determine active path for highlighting
  const activePath = location.pathname;
  const highlight = "bg-primary text-primary-content rounded";

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
            <Link to="/">
              <li className={activePath === "/" ? highlight : ""}>
                <a className="flex items-center gap-2">
                  <HomeIcon className="h-5 w-5 text-base" />
                  <span>Home</span>
                </a>
              </li>
            </Link>

            {/*Admin Sidebar*/}
            {isAdmin && (
              <>
                {/*Dashboard Button*/}
                <li
                  className={
                    activePath === "/admin/dashboard" ? highlight : ""
                  }
                >
                  <Link to="admin/dashboard">
                    <PresentationChartLineIcon className="h-5 w-5 text-base" />
                    <span>Dashboard</span>
                  </Link>
                </li>

                {/*Appointments Button*/}
                <li
                  className={
                    activePath === "/admin/appointmentManagement"
                      ? highlight
                      : ""
                  }
                >
                  <Link to="admin/appointmentManagement">
                    <CalendarDaysIcon className="h-5 w-5 text-base" />
                    <span>Appointments</span>
                  </Link>
                </li>

                {/*Patients Button*/}
                <li
                  className={
                    activePath === "/admin/patientManagement" ? highlight : ""
                  }
                >
                  <Link to="admin/patientManagement">
                    <UserGroupIcon className="h-5 w-5 text-base" />
                    <span>Patients</span>
                  </Link>
                </li>

                {/*Services Button*/}
                <li
                  className={
                    activePath === "/admin/serviceManagement" ? highlight : ""
                  }
                >
                  <Link to="admin/serviceManagement">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-base" />
                    <span>Services</span>
                  </Link>
                </li>
              </>
            )}

            {/* Test Page Button */}
            <li className={activePath === "/admin/test" ? highlight : ""}>
              <Link to="admin/test">
                <BugAntIcon className="h-5 w-5 text-base" />
                <span>Test Page</span>
              </Link>
            </li>

            {/*Patient Sidebars*/}

            {/* Theme Controller */}
            <ThemeController />
          </ul>
        </div>
      </div>
    </>
  );
};
