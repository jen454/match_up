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
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
      {reverse ? ( // reverse가 true면 input 먼저
        <>
          <input
            type="number"
            value={score}
            onChange={onChangeInput}
            className="w-14 text-center border rounded text-sm sm:text-base"
          />
          <span className="font-semibold text-sm sm:text-base">{player.name}</span>
        </>
      ) : (
        <>
          <span className="font-semibold text-sm sm:text-base">{player.name}</span>
          <input
            type="number"
            value={score}
            onChange={onChangeInput}
            className="w-14 text-center border rounded text-sm sm:text-base"
          />
        </>
      )}
    </div>
  );
};
