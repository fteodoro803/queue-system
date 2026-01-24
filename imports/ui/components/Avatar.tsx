import {Profile} from "/imports/api/profile";
import React from "react";

interface IconProps {
  profile: Profile;
}

export const Avatar: React.FC<IconProps> = ({profile}) => {
  const size: string = "w-14";
  const nameInitial: string = profile.name[0];

  return (
    // Profile's Avatar
    (profile.avatar) &&
    <div className="avatar">
        <div className={`${size} rounded-full`}>
            <img src={profile.avatar} alt="User Avatar"/>
        </div>
    </div>

    ||

    // Fallback Avatar
    <div className="avatar avatar-placeholder">
        <div className={`${size} rounded-full bg-neutral text-neutral-content`}>
          <span className="text-xl">{nameInitial}</span>
        </div>
    </div>
  )
}