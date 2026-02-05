import React from "react";

export const ModalButtons = ({
  onClose,
  hasChanges,
  handleSave,
  handleCancel,
}: {
  onClose: () => void;
  hasChanges?: boolean;
  handleSave?: () => void;
  handleCancel?: () => void;
}) => {
  return (
    <div className="flex gap-2 justify-end">
      {!hasChanges ? (
        <>
          {/* Close Button */}
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </>
      ) : (
        <>
          {/* Save Button */}
          <button
            type="button"
            className="btn bg-green-400"
            onClick={handleSave}
          >
            Save
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className="btn bg-red-400"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};
