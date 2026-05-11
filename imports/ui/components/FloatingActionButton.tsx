import React from "react";
import { NavLink } from "/imports/ui/navigation/NavLink";
import { Link, useLocation } from "react-router-dom";

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

  const highlightLabel = "bg-base-300";
  const highlightButton = "btn-base-300";

  return (
    <div className="fab">
      {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-lg btn-circle btn-primary"
      >
        F
      </div>

      {/* close button should not be focusable so it can close the FAB when clicked. It's just a visual placeholder */}
      <div className="fab-close">
        Close <span className="btn btn-circle btn-lg btn-error">✕</span>
      </div>

      {/* buttons that show up when FAB is open */}
      {reversedPages.map((page) => {
        const active = isActive(page);

        if (page.isTestOnly && !isTestFlagEnabled) {
          return null;
        }

        return (
          <div key={page.link}>
            {/* Label */}
            <span
              className={`rounded-full px-3 py-1 ${active ? highlightLabel : "bg-base-100"} text-sm font-medium shadow-md whitespace-nowrap`}
            >
              {page.label}
            </span>

            {/* Button */}
            <Link to={page.link}>
              <button
                className={`btn btn-lg btn-circle ${active ? highlightButton : "bg-base-100"}`}
              >
                <page.icon className="h-6 w-6" />
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
