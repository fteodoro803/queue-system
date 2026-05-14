import React from "react";

export const DetailsModalButtons = ({
  setOpen,
  hasChanges,
  handleSave,
  handleCancel,
}: {
  setOpen: (value: boolean) => void;
  hasChanges?: boolean;
  handleSave?: () => void;
  handleCancel?: () => void;
}) => {
  const ghostButtonClass =
    "btn btn-sm border border-base-300 bg-base-100 px-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-base-200";
  const saveButtonClass =
    "btn btn-sm border border-success bg-success/10 px-5 text-success shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-success/20";
  const cancelButtonClass =
    "btn btn-sm border border-error bg-error/10 px-5 text-error shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-error/20";

  return (
    <div className="flex gap-2 justify-end">
      {!hasChanges ? (
        <>
          {/* Close Button */}
          <button
            type="button"
            className={ghostButtonClass}
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </>
      ) : (
        <>
          {/* Save Button */}
          <button
            type="button"
            className={saveButtonClass}
            onClick={handleSave}
          >
            Save
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className={cancelButtonClass}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};
