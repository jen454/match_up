import { ChangeEvent } from "react";
import { Participant } from "@/types/type";
import { NumberStepper, LabelWithIcon } from "@/components";

interface PlayerCardProps {
  player: Participant;
  updatePlayer: (id: number, updatedData: Partial<Participant>) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, updatePlayer }) => {
  const getHandicapText = (handicap: number) => {
    if (handicap === 0) return "핸디캡 없음";
    if (handicap > 0) return `승점 +${handicap}점 보너스`;
    return `승점 ${handicap}점 페널티`;
  };

  const handleHandicapChange = (newHandicap: number) => {
    updatePlayer(player.id, { handicap: newHandicap });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 플레이어 이름 입력 */}
        <div className="md:col-span-1">
          <LabelWithIcon icon="/SoccerBallIcon.svg" label={`플레이어 ${player.id}`} alt="Player" />
          <input
            type="text"
            value={player.name}
            onChange={(e: ChangeEvent<HTMLInputElement>): void =>
              updatePlayer(player.id, { name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="플레이어 이름 입력"
          />
        </div>

        {/* 핸디캡 조정 */}
        <div className="md:col-span-1">
          <LabelWithIcon icon="/HandicapIcon.svg" label="핸디캡" alt="Handicap" />
          <NumberStepper
            value={player.handicap}
            min={-5}
            max={5}
            onChange={handleHandicapChange}
            showSign={true}
          />
        </div>

        {/* 핸디캡 설명 */}
        <div className="md:col-span-1 flex items-end">
          <div className="text-sm text-gray-500">{getHandicapText(player.handicap)}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
