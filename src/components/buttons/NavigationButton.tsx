import React, { ButtonHTMLAttributes } from "react";

interface NavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "prev" | "next";
}

const NavigationButton = ({ direction, disabled, onClick, ...props }: NavigationButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm font-medium"
      {...props}
    >
      {direction === "prev" ? "이전" : "다음"}
    </button>
  );
};

export default NavigationButton;
