import React, { ComponentType, ReactNode } from "react";

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
  return (
    <div
      className="card w-3xs h-35 p-6 rounded-xl border shadow-lg hover:-translate-y-1 transition-transform duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold mb-1">{header}</p>

          {/* Body */}
          <h3 className="text-3xl font-bold">{body}</h3>

          {/* Footer */}
          {footer && (
            <p className="text-sm text-primary mt-2 font-semibold">{footer}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
