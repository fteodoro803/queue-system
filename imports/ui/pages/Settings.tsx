import React from "react";
import { ThemeController } from "../components/ThemeController";

export const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p>Settings page coming soon...</p>

      {/* Theme Controller */}
      <div className="flex flex-row items-center">
        <p className="mr-2">Theme:</p>
        <ThemeController />
      </div>
    </div>
  );
};
