import React from "react";

interface PlayerScoreInputProps {
  player: { id: number; name: string; handicap: number } | undefined;
  score: string;
  onScoreChange: (value: string) => void;
}

const PlayerScoreInput = ({ player, score, onScoreChange }: PlayerScoreInputProps) => {
  return (
    <div className="text-center flex-1">
      <div className="font-medium text-gray-900">{player?.name}</div>
      {player?.handicap !== 0 && (
        <div className="text-xs text-gray-500 mt-1">
          승점 핸디캡: {(player?.handicap ?? 0) > 0 ? "+" : ""}
          {player?.handicap}
        </div>
      )}
      <input
        type="number"
        min="0"
        value={score}
        onChange={(e) => onScoreChange(e.target.value)}
        className="mt-3 w-20 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0"
      />
    </div>
  );
};

export default PlayerScoreInput;
