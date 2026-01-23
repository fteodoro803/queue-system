import {Profile} from "/imports/api/profile";
import React from "react";

interface IconProps {
  profile: Profile;
}

export const Icon: React.FC<IconProps> = ({profile}) => {
  const size: string = "w-14";
  const nameInitial: string = profile.name[0];

  return (
    // Profile's Icon
    (profile.icon) &&
    <div className="avatar">
        <div className={`${size} rounded-full`}>
            <img src={profile.icon} alt="User Avatar"/>
        </div>
    </div>

    ||

    // Fallback Icon
    <div className="avatar avatar-placeholder">
        <div className={`${size} rounded-full bg-neutral text-neutral-content`}>
          <span className="text-xl">{nameInitial}</span>
        </div>
    </div>
  )
}