import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "/imports/ui/navigation/NavLink";

export const SidebarItem = ({
  navLink,
  isTestFlagEnabled,
}: {
  navLink: NavLink;
  isTestFlagEnabled: boolean;
}) => {
  const location = useLocation();
  const activeItemClass = "bg-primary text-primary-content shadow-sm";
  const idleItemClass =
    "text-base-content/80 hover:bg-base-200 hover:text-base-content";
  const linkClass =
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const isActive: boolean = (() => {
    const activePath = location.pathname;
    return activePath === navLink.link;
  })();

  // Don't render if the nav link is marked as test-only and the test flag is not enabled
  if (navLink.isTestOnly && !isTestFlagEnabled) return null;

  return (
    // Highlight if active, otherwise default styling
    <li>
      <Link
        to={navLink.link}
        className={`${linkClass} ${isActive ? activeItemClass : idleItemClass}`}
      >
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${isActive ? "bg-primary-content/20" : "bg-base-200 text-base-content/70 group-hover:bg-base-300"}`}
        >
          <navLink.icon className="h-6 w-6" />
        </span>
        <span>{navLink.label}</span>
      </Link>
    </li>
  );
};
