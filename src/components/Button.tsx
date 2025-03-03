import React from "react";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex justify-center items-center px-5 py-2 rounded-xl border-3 border-[#8C8C8C] bg-white shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)]"
    >
      {text}
    </button>
  );
};
