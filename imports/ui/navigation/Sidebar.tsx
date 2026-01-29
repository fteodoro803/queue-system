import React from "react";
import { HomeIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Link, Outlet } from "react-router-dom";

export const Sidebar = () => (
  <>
    {/* Floating button - only shows on small screens */}
    <div className="fixed bottom-4 left-4 lg:hidden z-50">
      <label htmlFor="my-drawer-3" className="btn btn-circle btn-xl shadow-lg">
        <EllipsisVerticalIcon className="h-6 w-6 text-black/80"/>
      </label>
    </div>

    {/* Drawer - sidebar hidden on small, always visible on large */}
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle"/>

      {/* Main content area */}
      <div className="drawer-content flex flex-col">
        <div className="p-6 lg:p-8">
          <Outlet/>
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <Link to="/">
            <li>
              <a className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-black/80"/>
                <span>Home</span>
              </a>
            </li>
          </Link>

          <li><a>Link 1</a></li>
          <li><a>Link 2</a></li>
        </ul>
      </div>
    </div>
  </>
);
