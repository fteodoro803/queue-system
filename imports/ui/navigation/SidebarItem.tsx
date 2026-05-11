import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLinkItem } from "/imports/ui/navigation/NavLink";

export const SidebarItem = ({
  navLink,
  isTestFlagEnabled,
}: {
  navLink: NavLinkItem;
  isTestFlagEnabled: boolean;
}) => {
  const location = useLocation();
  const highlight = "bg-primary text-primary-content rounded";

  const isActive: boolean = (() => {
    const activePath = location.pathname;
    return activePath === navLink.link;
  })();

  // Don't render if the nav link is marked as test-only and the test flag is not enabled
  if (navLink.isTestOnly && !isTestFlagEnabled) return null;

  return (
    // Highlight if active, otherwise default styling
    <li className={isActive ? highlight : ""}>
      <Link to={navLink.link}>
        <navLink.icon className="h-5 w-5 text-base" />
        <span>{navLink.label}</span>
      </Link>
    </li>
  );
};
