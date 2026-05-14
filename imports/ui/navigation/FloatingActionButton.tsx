import React from "react";
import { NavLink } from "/imports/ui/navigation/NavLink";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";

export const FloatingActionButton = ({
  pages,
  isTestFlagEnabled,
}: {
  pages: NavLink[];
  isTestFlagEnabled: boolean;
}) => {
  const location = useLocation();
  const reversedPages = [...pages].reverse(); // Reverse the pages so that the first page in the array is at the bottom of the FAB

  const isActive = (page: NavLink): boolean => {
    const activePath = location.pathname;
    return activePath === page.link;
  };

  const baseColor = "group-hover:bg-base-100";
  const activeColor = "bg-base-300 scale-[1.1]";
  const hoverColor = "group-hover:bg-base-300";
  const baseLabel =
    "bg-base-100 text-base-content group-hover:bg-base-300 transition-all";
  const border = "border-1 border-base-content/10";

  return (
    <div className="fab">
      {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-lg btn-circle btn-primary"
      >
        <Bars3Icon className="h-6 w-6" />
      </div>

      {/* close button should not be focusable so it can close the FAB when clicked. It's just a visual placeholder */}
      <div className="fab-close group">
        <span
          className={`rounded-full px-3 py-1 ${baseLabel} text-sm font-medium shadow-md whitespace-nowrap`}
        >
          Close
        </span>
        <span className="btn btn-circle btn-lg btn-error shadow-lg">✕</span>
      </div>

      {/* buttons that show up when FAB is open */}
      {reversedPages.map((page) => {
        const active = isActive(page);

        if (page.isTestOnly && !isTestFlagEnabled) {
          return null;
        }

        return (
          <div key={page.link} className="group">
            {/* Label */}
            <span
              className={`rounded-full px-3 py-1 text-sm ${border} shadow-lg whitespace-nowrap ${baseLabel}`}
            >
              {page.label}
            </span>

            {/* Button */}
            <Link to={page.link}>
              <button
                className={`btn btn-lg btn-circle ${border} shadow-lg ${active ? activeColor : baseColor} ${hoverColor}`}
              >
                <page.icon className="h-6 w-6" />
                {active && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary" />
                )}
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
