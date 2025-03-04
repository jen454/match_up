import React, { ChangeEvent } from "react";
import Image from "next/image";

interface Player {
    id: number;
    name: string;
    handicap: number;
}

interface PlayerCardProps {
    player: Player;
    updatePlayer: (id: number, updatedData: Partial<Player>) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, updatePlayer }) => {
    return (
        <div className="flex flex-col p-4 w-72 bg-gray-100 border-[#8c8c8c] rounded-lg shadow-lg gap-2.5">
            {/* 플레이어 */}
            <div className="flex items-center gap-2.5">
                <Image src="/SoccerBallIcon.svg" alt="Soccer" width={25} height={25} />
                <span className="text-lg font-bold">player {player.id}</span>
            </div>

            {/* 이름 입력 */}
            <div className="flex items-center gap-2.5">
                <Image src="/UserIcon.svg" alt="User" width={25} height={25} />
                <span className="text-sm font-medium">이름:</span>
                <input
                    type="text"
                    value={player.name}
                    onChange={(e:ChangeEvent<HTMLInputElement>): void => updatePlayer(player.id, { name: e.target.value })}
                    className="flex-1 p-1 border rounded-md text-sm"
                    placeholder="이름 입력"
                />
            </div>

            {/* 핸디캡 적용 */}
            <div className="flex items-center gap-2.5">
                <Image src="/HandicapIcon.svg" alt="Handicap" width={25} height={25} />
                <span className="text-sm font-medium">핸디캡:</span>
                <button
                    onClick={(): void => updatePlayer(player.id, { handicap: Math.max(player.handicap - 1, 0) })}
                    className="bg-white rounded-full"
                >
                    <Image src="/MinusIcon.svg" alt="Minus" width={25} height={25} />
                </button>
                <span className="bg-white px-3 py-1 text-center rounded-xl border-[1px] border-[#8c8c8c]">{player.handicap}</span>
                <button
                    onClick={(): void => updatePlayer(player.id, { handicap: player.handicap + 1 })}
                    className="bg-white rounded-full"
                >
                    <Image src="/PlusIcon.svg" alt="Plus" width={25} height={25} />
                </button>
            </div>
        </div>
    );
};
