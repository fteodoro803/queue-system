import React from "react";

export const ModalButtons = ({
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
  return (
    <div className="flex gap-2 justify-end">
      {!hasChanges ? (
        <>
          {/* Close Button */}
          <button
            className="btn"
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
            className="btn btn-success"
            onClick={handleSave}
          >
            Save
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className="btn btn-error"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};
