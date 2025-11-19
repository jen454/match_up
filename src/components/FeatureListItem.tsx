import React from "react";
import { RemixiconComponentType } from "@remixicon/react";

interface FeatureListItemProps {
  icon: RemixiconComponentType;
  iconColor: string;
  text: string;
}

const FeatureListItem = ({ icon: Icon, iconColor, text }: FeatureListItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <Icon className={iconColor} size={18} />
      <span>{text}</span>
    </div>
  );
};

export default FeatureListItem;
