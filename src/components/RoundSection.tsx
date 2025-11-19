import React from "react";
import { Match } from "@/types/type";
import { RoundButton } from "@/components/buttons";
import { MatchCard } from "@components";

interface RoundSectionProps {
  round: Match[];
  actualRoundIndex: number;
  showRoundTitle: boolean;
  isSubmitted: boolean;
  showButtons: boolean;
  onScoreClick: (roundIndex: number, matchIndex: number, match: Match) => void;
  onSubmit: (roundIndex: number) => void;
  onCancel: (roundIndex: number) => void;
}

const RoundSection = ({
  round,
  actualRoundIndex,
  showRoundTitle,
  isSubmitted,
  showButtons,
  onScoreClick,
  onSubmit,
  onCancel,
}: RoundSectionProps) => {
  const restPlayerMatch = round.find((match) => match.restPlayer);

  return (
    <div key={actualRoundIndex}>
      {showRoundTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">라운드 {actualRoundIndex + 1}</h3>
      )}

      <div className="space-y-3">
        {round
          .filter((match) => match.player1 && match.player2)
          .map((match, matchIndex) => (
            <MatchCard
              key={matchIndex}
              match={match}
              roundIndex={actualRoundIndex}
              matchIndex={matchIndex}
              isSubmitted={isSubmitted}
              onScoreClick={onScoreClick}
            />
          ))}

        {/* 휴식 플레이어 */}
        {restPlayerMatch && (
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50 text-center">
            <span className="text-gray-700 font-medium">
              {restPlayerMatch.restPlayer?.name} (휴식)
            </span>
          </div>
        )}
      </div>

      {/* 라운드 제출/취소 버튼 */}
      {showButtons && (
        <div className="flex justify-center mt-6 gap-4">
          <RoundButton
            variant="submit"
            roundNumber={actualRoundIndex + 1}
            onClick={() => onSubmit(actualRoundIndex)}
            disabled={isSubmitted}
          />
          {isSubmitted && (
            <RoundButton
              variant="cancel"
              roundNumber={actualRoundIndex + 1}
              onClick={() => onCancel(actualRoundIndex)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RoundSection;
