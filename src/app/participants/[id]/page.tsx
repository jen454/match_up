"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button, PlayerCard } from "@/components";

interface Player {
  id: number;
  name: string;
  handicap: number;
}

const ParticipantsPage = () => {
  const params = useParams();
  const numParticipants = Number(params.id);

  if (!numParticipants) {
    return <div className="flex items-center justify-center">Loading...</div>; // id가 없으면 로딩 메시지 표시
  }

  // 모든 참가자의 정보를 관리하는 상태
  const [players, setPlayers] = useState<Player[]>(
      Array.from({ length: numParticipants }, (_, index) => ({
        id: index + 1,
        name: "",
        handicap: 0,
      }))
  );

  // 개별 참가자 정보 업데이트 함수
  const updatePlayer = (id: number, updatedData: Partial<Player>) => {
    setPlayers((prev) =>
        prev.map((player) =>
            player.id === id ? { ...player, ...updatedData } : player
        )
    );
  };

  const onClickButton = (): void => {
    console.log(players);
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="flex flex-col items-center gap-12 mt-32">
        <div className="text-3xl font-bold text-center">게임 참가자 정보 입력</div>
        <div className="flex flex-col gap-6">
          {players.map((player) => (
              <PlayerCard
                  key={player.id}
                  player={player}
                  updatePlayer={updatePlayer}
              />
          ))}
        </div>
        <Button text={"대진표 생성하기"} onClick={onClickButton} />
      </div>
    </div>
  );
};

export default ParticipantsPage;
