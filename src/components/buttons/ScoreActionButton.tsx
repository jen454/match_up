import React, { ButtonHTMLAttributes } from "react";

interface ScoreActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state: "submit" | "edit" | "disabled";
}

const ScoreActionButton = ({ state, onClick, ...props }: ScoreActionButtonProps) => {
  const buttonConfig = {
    submit: {
      text: "점수 입력",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    edit: {
      text: "점수 수정",
      className: "bg-gray-600 text-white hover:bg-gray-700",
    },
    disabled: {
      text: "제출됨",
      className: "bg-gray-300 text-gray-500 cursor-not-allowed",
    },
  };

  const config = buttonConfig[state];

  return (
    <button
      onClick={onClick}
      disabled={state === "disabled"}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${config.className}`}
      {...props}
    >
      {config.text}
    </button>
  );
};

export default ScoreActionButton;
