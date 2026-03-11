import React, { useState } from "react";
import { ThemeController } from "../components/ThemeController";

export const Settings = () => {
  const [acceptAfterHours, setAcceptAfterHours] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Text Frequency */}
      <div className="flex flex-col">
        <p>Text Message Frequency:</p>
        <select className="select select-bordered w-full max-w-xs">
          <option value="15">every 15 minutes</option>
          <option value="30">every 30 minutes</option>
          <option value="60">every hour</option>
        </select>
      </div>

      {/* Text Message */}
      <div className="flex flex-col">
        <p>Text Message:</p>
        <textarea
          className="textarea"
          placeholder="Your appointment is estimated to start in 15 minutes. Please check in with the receptionist when you arrive."
        ></textarea>
      </div>

      {/* Emergency Settings */}
      {/* TODO: ask dutah about this one */}
      <div className="flex flex-col">
        <p>Emergency Handling:</p>
        <select className="select select-bordered w-full max-w-xs">
          <option value="1">option1</option>
          <option value="2">option2</option>
        </select>
      </div>

      {/* Accept Queue Patients after Work Hours */}
      <div className="flex flex-row items-center gap-2">
        <p>Accept Queue Patients after Work Hours:</p>
        <input
          type="checkbox"
          checked={acceptAfterHours}
          onChange={(e) => setAcceptAfterHours(e.target.checked)}
          className="toggle checked:toggle-success"
        />
      </div>

      {/* Theme Controller */}
      <div className="flex flex-col">
        <p>Theme:</p>
        <ThemeController />
      </div>
    </div>
  );
};
