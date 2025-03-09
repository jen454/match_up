import React from "react";

interface PlayerScoreProps {
  player: { id: number; name: string } | null;
  score: number;
  onChange: (value: number) => void;
  reverse?: boolean;
}

export const PlayerScore: React.FC<PlayerScoreProps> = ({
  player,
  score,
  onChange,
  reverse = false,
}) => {
  if (!player) return null; // 휴식자일 경우 렌더링 안 함

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onChange(Math.max(0, value)); // 0 이하로 내려가지 않도록 설정
  };

  return (
    <div className="flex items-center gap-4">
      {reverse ? ( // reverse가 true면 input 먼저
        <>
          <input
            type="number"
            value={score}
            onChange={onChangeInput}
            className="w-12 p-1 text-center border rounded"
          />
          <span className="font-semibold">{player.name}</span>
        </>
      ) : (
        <>
          <span className="font-semibold">{player.name}</span>
          <input
            type="number"
            value={score}
            onChange={onChangeInput}
            className="w-12 p-1 text-center border rounded"
          />
        </>
      )}
    </div>
  );
};
