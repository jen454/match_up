import React from "react";

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean; // ✅ 버튼 비활성화 여부 추가
}

export const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined} // ✅ 비활성화 시 클릭 방지
      disabled={disabled} // ✅ 버튼 비활성화 상태 적용
      className={`flex justify-center items-center px-5 py-2 rounded-xl border-3 border-[#8C8C8C] bg-white 
        shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)] mb-16
        hover:bg-[#f0f0f0] hover:border-[#e5e5e5] hover:shadow-lg transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400 shadow-none" : ""}`} // ✅ 비활성화 스타일 추가
    >
      {text}
    </button>
  );
};
