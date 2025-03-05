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

  // 모든 참가자의 정보를 관리하는 상태
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: numParticipants }, (_, index) => ({
      id: index + 1,
      name: "",
      handicap: 0,
    })),
  );

  // 개별 참가자 정보 업데이트 함수
  const updatePlayer = (id: number, updatedData: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, ...updatedData } : player)),
    );
  };

  const onClickButton = async (): Promise<void> => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: players.map((player) => ({
            name: player.name,
            handicap: player.handicap,
          })),
        }),
      });

      const data = await response.json();
      console.log("서버 응답 데이터", data);

      if (!response.ok) {
        console.error("응답이 실패한 이유:", data.error || "게임 생성 실패");
        throw new Error(data.error || "게임 생성 실패");
      }

      console.log("게임 생성 성공:", data);
    } catch (error) {
      console.error("게임 생성 실패:", error);
    }
  };

  if (!numParticipants) {
    return <div className="flex items-center justify-center">Loading...</div>; // id가 없으면 로딩 메시지 표시
  }

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="flex flex-col items-center gap-12 mt-32">
        <div className="text-3xl font-bold text-center">게임 참가자 정보 입력</div>
        <div className="flex flex-col gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} updatePlayer={updatePlayer} />
          ))}
        </div>
        <Button text={"게임 생성하기"} onClick={onClickButton} />
      </div>
    </div>
  );
};

export default ParticipantsPage;
