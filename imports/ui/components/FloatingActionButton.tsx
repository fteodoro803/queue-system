import React from "react";
import { NavLinkItem } from "/imports/ui/navigation/NavLink";
import { Link } from "react-router-dom";

export const FloatingActionButton = ({
  pages,
  isTestFlagEnabled,
}: {
  pages: NavLinkItem[];
  isTestFlagEnabled: boolean;
}) => {
  return (
    <div className="fab">
      {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-lg btn-circle btn-info"
      >
        F
      </div>

      {/* close button should not be focusable so it can close the FAB when clicked. It's just a visual placeholder */}
      <div className="fab-close">
        Close <span className="btn btn-circle btn-lg btn-error">✕</span>
      </div>

      {/* buttons that show up when FAB is open */}
      {pages.map(({ link, label, icon: Icon, isTestOnly }) => {
        if (isTestOnly && !isTestFlagEnabled) {
          return null;
        }

        return (
          <div key={link}>
            {label}
            <button className="btn btn-lg btn-circle">
              <Link to={link}>
                <Icon className="h-6 w-6" />
              </Link>
            </button>
          </div>
        );
      })}
    </div>
  );
};
