"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayerCard } from "@/components/cards";
import { BackHeader } from "@components/headers";
import { createGame } from "@/utils/api";
import { Participant } from "@/types/type";
import { RiTrophyLine } from "@remixicon/react";

const ParticipantsPage = () => {
  const params = useParams();
  const numParticipants = Number(params.count);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // 모든 참가자의 정보를 관리하는 상태
  const [players, setPlayers] = useState<Participant[]>(
    Array.from({ length: numParticipants }, (_, index) => ({
      id: index + 1,
      game_id: 0, // DB 저장 전 임시값
      name: "",
      handicap: 0,
    })),
  );

  // 개별 참가자 정보 업데이트 함수
  const updatePlayer = (id: number, updatedData: Partial<Participant>) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, ...updatedData } : player)),
    );
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return players.every((player) => player.name.trim() !== "");
  };

  // 게임 생성 버튼 클릭 시 API 호출
  const onCreateGame = async (): Promise<void> => {
    if (!isFormValid()) return;

    try {
      setIsCreating(true);
      const data = await createGame(
        players.map((player) => ({
          name: player.name.trim(),
          handicap: player.handicap,
        })),
      );

      console.log("게임 생성 성공:", data);
      router.push(`/tournament/${data.gameId}`);
    } catch (error) {
      console.error("게임 생성 실패:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!numParticipants) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <BackHeader title="참가자 정보" backButtonLabel="뒤로" />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">참가자 정보를 입력하세요</h2>
          <p className="text-gray-600">{numParticipants}명의 참가자 이름과 핸디캡을 설정하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Handicap Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">핸디캡에 대해</h4>
              <p className="text-sm text-blue-700">
                핸디캡은 실력 차이를 균형있게 맞추는 데 도움이 됩니다.{" "}
                <b>양수 값은 승점 보너스를, 음수 값은 승점 페널티를 줍니다.</b>
                <br /> 예시: +2 핸디캡을 가진 플레이어는 최종 순위 계산 시 승점에 +2점이 추가됩니다.
              </p>
            </div>

            {/* Players Form */}
            <div className="grid gap-4">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} updatePlayer={updatePlayer} />
              ))}
            </div>

            {/* Create Button */}
            <div className="pt-6 border-t">
              <button
                onClick={onCreateGame}
                disabled={!isFormValid() || isCreating}
                className="w-full px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <RiTrophyLine size={20} />
                    토너먼트 생성
                  </>
                )}
              </button>

              {!isFormValid() && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  모든 참가자의 이름을 입력해주세요
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
