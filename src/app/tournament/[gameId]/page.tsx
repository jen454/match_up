"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { BackHeader } from "@/components/headers";
import { TournamentTable, ScoreInputModal, LoadingSpinner, RoundSection } from "@/components";
import { ToggleButton, NavigationButton } from "@/components/buttons";
import { useTournament } from "@/hooks/useTournament";
import { useScoreModal } from "@/hooks/useScoreModal";

const TournamentPage = () => {
  const params = useParams();
  const gameId = Number(params.gameId);

  // 커스텀 훅으로 로직 분리
  const { players, matches, loading, submittedRounds, updateScore, submitRound, cancelRound } =
    useTournament(gameId);

  const {
    selectedMatch,
    homeScore,
    awayScore,
    setHomeScore,
    setAwayScore,
    openModal,
    closeModal,
    submitScore,
  } = useScoreModal(updateScore);

  // UI 상태
  const [currentRound, setCurrentRound] = useState(0);
  const [showAllRounds, setShowAllRounds] = useState(false);

  // 유틸리티 함수
  const getCompletedRoundsCount = () => submittedRounds.filter(Boolean).length;
  const getTotalRounds = () => matches.length;

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="토너먼트 데이터 불러오는 중" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <BackHeader
        title="토너먼트 매치"
        rightContent={
          <span>
            {getCompletedRoundsCount()} / {getTotalRounds()} 라운드 완료
          </span>
        }
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 순위표 */}
          <div className="lg:col-span-1">
            <TournamentTable players={players} />
          </div>

          {/* 경기 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">경기</h2>
                <ToggleButton
                  isActive={showAllRounds}
                  activeText="라운드별 보기"
                  inactiveText="모든 라운드 보기"
                  onClick={() => setShowAllRounds(!showAllRounds)}
                />
              </div>

              {!showAllRounds && (
                <div className="flex items-center gap-4 mb-6">
                  <NavigationButton
                    direction="prev"
                    onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
                    disabled={currentRound === 0}
                  />
                  <span className="font-medium text-gray-900">라운드 {currentRound + 1}</span>
                  <NavigationButton
                    direction="next"
                    onClick={() => setCurrentRound(Math.min(matches.length - 1, currentRound + 1))}
                    disabled={currentRound === matches.length - 1}
                  />
                </div>
              )}

              <div className="space-y-6">
                {showAllRounds
                  ? // 모든 라운드 표시
                    matches.map((round, roundIndex) => (
                      <RoundSection
                        key={roundIndex}
                        round={round}
                        actualRoundIndex={roundIndex}
                        showRoundTitle={true}
                        isSubmitted={submittedRounds[roundIndex]}
                        showButtons={roundIndex === currentRound}
                        onScoreClick={openModal}
                        onSubmit={submitRound}
                        onCancel={cancelRound}
                      />
                    ))
                  : // 현재 라운드만 표시
                    matches[currentRound] && (
                      <RoundSection
                        key={currentRound}
                        round={matches[currentRound]}
                        actualRoundIndex={currentRound}
                        showRoundTitle={false}
                        isSubmitted={submittedRounds[currentRound]}
                        showButtons={true}
                        onScoreClick={openModal}
                        onSubmit={submitRound}
                        onCancel={cancelRound}
                      />
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 점수 입력 모달 */}
      {selectedMatch && (
        <ScoreInputModal
          match={selectedMatch.match}
          homeScore={homeScore}
          awayScore={awayScore}
          onHomeScoreChange={setHomeScore}
          onAwayScoreChange={setAwayScore}
          onSubmit={submitScore}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TournamentPage;
