import React from "react";

export const ThemeController = ({
  theme,
  onChange,
}: {
  theme: string;
  onChange?: (value: string) => void;
}) => {
  return (
    <select
      value={theme}
      onChange={(e) => {
        if (onChange) onChange(e.target.value);
      }}
      className="select select-bordered theme-controller w-full sm:max-w-xs"
    >
      {/* Theme Options */}
      {/* To add more, add them to client/main.css, and a corresponding option here */}
      <option value="default">Default</option>
      <option value="dark">Dark</option>
      <option value="corporate">Corporate</option>
      <option value="pastel">Pastel</option>
      <option value="silk">Silk</option>
    </select>
  );
};
