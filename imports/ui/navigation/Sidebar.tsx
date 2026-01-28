import React from "react";
import { HomeIcon } from '@heroicons/react/24/solid'
import {Outlet} from "react-router-dom";

export const Sidebar = () => (
    // <div className="drawer">
    //   <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
    //   <div className="drawer-content">
    //     {/* Page content here */}
    //     <label htmlFor="my-drawer-1" className="btn drawer-button">Sidebar</label>
    //   </div>
    //   <div className="drawer-side">
    //     <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
    //     <ul className="menu bg-base-200 min-h-full w-min p-4">
    //       {/* Sidebar content here */}
    //       <li>
    //         <div className={"rounded-full h-10 w-10 bg-accent/50"}/>
    //         Peter Robson
    //
    //       </li>
    //       <li>
    //         <div className={"flex items-center h-full py-2"}>
    //           <HomeIcon className="h-5 w-5 text-black/80"/>
    //           <p>Home </p>
    //         </div>
    //       </li>
    //       <li><a><HomeIcon className="h-5 w-5 text-black/80"/> Book </a></li>
    //     </ul>
    //   </div>
    // </div>

  <div className="drawer lg:drawer-open">
    <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content flex flex-col p-6">
      {/* Page content here */}
      <Outlet />

    </div>
    <div className="drawer-side">
      <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
      <ul className="menu bg-base-200 min-h-full w-80 p-4">
        {/* Sidebar content here */}
        <li><a>Sidebar Item 1</a></li>
        <li><a>Sidebar Item 2</a></li>
      </ul>
    </div>
  </div>
  )
