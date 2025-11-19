import React from "react";

interface ParticipantButtonProps {
  count: number;
  isSelected: boolean;
  onClick: (count: number) => void;
}

const ParticipantButton: React.FC<ParticipantButtonProps> = ({ count, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(count)}
      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
        isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
      }`}
    >
      <div className="font-semibold">{count}</div>
      <div className="text-sm text-gray-500">명</div>
    </button>
  );
};

export default ParticipantButton;
