import React from "react";

interface PlayerScoreProps {
  player: { id: number; name: string; handicap?: number } | null;
  score: number | undefined | null;
  onChange?: (value: number) => void;
  reverse?: boolean;
  readonly?: boolean;
  showHandicap?: boolean;
}

const PlayerScore: React.FC<PlayerScoreProps> = ({
  player,
  score,
  onChange,
  reverse = false,
  readonly = false,
  showHandicap = false,
}) => {
  if (!player) return null;

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const value = Number(e.target.value);
      onChange(Math.max(0, value));
    }
  };

  const displayScore = score !== undefined && score !== null ? score : "-";

  return (
    <div className={`text-center min-w-0 flex-1 ${reverse ? "order-last" : ""}`}>
      <div className="font-medium text-gray-900 truncate">{player.name}</div>
      {showHandicap && player.handicap !== undefined && player.handicap !== 0 && (
        <div className="text-xs text-gray-500">
          H: {player.handicap > 0 ? "+" : ""}
          {player.handicap}
        </div>
      )}
      <div className="text-2xl font-bold mt-1 text-gray-900">
        {readonly ? (
          displayScore
        ) : (
          <input
            type="number"
            min="0"
            value={score ?? ""}
            onChange={onChangeInput}
            className="w-20 text-center border border-gray-300 rounded-lg p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        )}
      </div>
    </div>
  );
};

export default PlayerScore;
