import React from "react";

interface LapTabsProps {
  lapList: number[];
  currentLap: number;
  isLatestLap: boolean;
  isCurrentLapComplete: boolean;
  onLapChange: (lap: number) => void;
  onNextLap: () => void;
}

const LapTabs = ({
  lapList,
  currentLap,
  isLatestLap,
  isCurrentLapComplete,
  onLapChange,
  onNextLap,
}: LapTabsProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {lapList.map((lap) => (
        <button
          key={lap}
          onClick={() => onLapChange(lap)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentLap === lap
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {lap}회차
        </button>
      ))}

      {/* 최신 Lap에서만 다음 회차 버튼 표시 */}
      {isLatestLap && (
        <button
          onClick={onNextLap}
          disabled={!isCurrentLapComplete}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            isCurrentLapComplete
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          title={isCurrentLapComplete ? "다음 회차 시작" : "현재 회차를 모두 제출해야 합니다."}
        >
          <span>+</span>
          <span>다음 회차</span>
        </button>
      )}
    </div>
  );
};

export default LapTabs;
