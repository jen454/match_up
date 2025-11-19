import React from "react";
import { Match } from "@/types/type";
import { PlayerScoreInput } from "@/components";

interface ScoreInputModalProps {
  match: Match;
  homeScore: string;
  awayScore: string;
  onHomeScoreChange: (value: string) => void;
  onAwayScoreChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const ScoreInputModal = ({
  match,
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  onSubmit,
  onClose,
}: ScoreInputModalProps) => {
  const isEditing = match.score1 !== undefined && match.score2 !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {isEditing ? "경기 결과 수정" : "경기 결과 입력"}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <PlayerScoreInput
              player={match.player1 || undefined}
              score={homeScore}
              onScoreChange={onHomeScoreChange}
            />

            <div className="text-2xl font-bold text-gray-400 mx-4">-</div>

            <PlayerScoreInput
              player={match.player2 || undefined}
              score={awayScore}
              onScoreChange={onAwayScoreChange}
            />
          </div>

          {(match.player1?.handicap !== 0 || match.player2?.handicap !== 0) && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-700">승점 핸디캡이 최종 순위에 반영됩니다</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={homeScore === "" || awayScore === ""}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isEditing ? "수정 완료" : "결과 저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreInputModal;
