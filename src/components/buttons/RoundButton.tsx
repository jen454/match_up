import React, { ButtonHTMLAttributes } from "react";

interface RoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "submit" | "cancel";
  roundNumber: number;
}

const RoundButton = ({
  variant = "submit",
  roundNumber,
  disabled,
  onClick,
  ...props
}: RoundButtonProps) => {
  const variantStyles = {
    submit: "bg-green-600 text-white hover:bg-green-700",
    cancel: "bg-red-600 text-white hover:bg-red-700",
  };

  const disabledStyles = disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
        disabled ? disabledStyles : variantStyles[variant]
      }`}
      {...props}
    >
      {variant === "submit" ? `라운드 ${roundNumber} 종료` : "취소"}
    </button>
  );
};

export default RoundButton;
