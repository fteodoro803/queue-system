import React, { ComponentType, ReactNode } from "react";
import { styles } from "/imports/utils/styles";

interface DashboardCardProps {
  header: string;
  body: ReactNode;
  footer?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export const DashboardCard = ({
  header,
  body,
  footer,
  icon: Icon,
  onClick,
}: DashboardCardProps) => {
  const animation: string =
    "hover:-translate-y-1 transition-transform duration-200";

  return (
    <>
      {/* Phone Layout */}
      <div
        className={`card w-40 h-25 p-4 bg-base-100 rounded-xl ${styles.outline} shadow-lg ${animation} sm:hidden`}
        onClick={onClick}
      >
        <div className="flex flex-col h-full">
          <p className="text-xs font-semibold">{header}</p>

          <div className={"flex flex-1 items-center justify-center"}>
            <h3 className="w-full font-bold text-center whitespace-nowrap text-[clamp(0.75rem,7vw,1.875rem)] line-clamp-2 wrap-break-word">
              {body}
            </h3>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className={`card hidden sm:block w-3xs h-35 p-6 bg-base-100 rounded-xl ${styles.outline} shadow-lg ${animation}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">{header}</p>

            {/* Body */}
            <h3 className="text-3xl font-bold">{body}</h3>

            {/* Footer */}
            {footer && (
              <div className="text-sm text-primary mt-2 font-semibold">
                {footer}
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </>
  );
};
