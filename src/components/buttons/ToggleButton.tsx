import React, { ButtonHTMLAttributes } from "react";

interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  activeText: string;
  inactiveText: string;
}

const ToggleButton = ({
  isActive,
  activeText,
  inactiveText,
  onClick,
  ...props
}: ToggleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
      {...props}
    >
      {isActive ? activeText : inactiveText}
    </button>
  );
};

export default ToggleButton;
