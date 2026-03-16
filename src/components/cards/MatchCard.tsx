import React from "react";
import { ActiveMatch } from "@/types/type";
import { PlayerScore } from "@/components";
import { ScoreActionButton } from "@components/buttons";

interface MatchCardProps {
  match: ActiveMatch;
  roundIndex: number;
  matchIndex: number;
  isSubmitted: boolean;
  onScoreClick: (roundIndex: number, matchIndex: number, match: ActiveMatch) => void;
}

const MatchCard = ({
  match,
  roundIndex,
  matchIndex,
  isSubmitted,
  onScoreClick,
}: MatchCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <PlayerScore
            player={match.player1}
            score={match.score1}
            readonly={true}
            showHandicap={true}
          />
          <div className="text-gray-400 font-medium">VS</div>
          <PlayerScore
            player={match.player2}
            score={match.score2}
            readonly={true}
            showHandicap={true}
          />
        </div>

        <div className="ml-4">
          <ScoreActionButton
            state={
              isSubmitted
                ? "disabled"
                : match.score1 !== undefined && match.score2 !== undefined
                  ? "edit"
                  : "submit"
            }
            onClick={() => onScoreClick(roundIndex, matchIndex, match)}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
