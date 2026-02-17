import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkItemProps {
  link: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NavLinkItem = ({ link, label, icon: Icon }: NavLinkItemProps) => {
  const location = useLocation();
  const highlight = "bg-primary text-primary-content rounded";

  const isActive: boolean = (() => {
    const activePath = location.pathname;
    return activePath === link;
  })();

  return (
    // Highlight if active, otherwise default styling
    <li className={isActive ? highlight : ""}>
      <Link to={link}>
        <Icon className="h-5 w-5 text-base" />
        <span>{label}</span>
      </Link>
    </li>
  );
};
