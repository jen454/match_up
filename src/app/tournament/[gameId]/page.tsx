"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, PlayerScore, TournamentTable, BackHeader } from "@/components";
import { getGameParticipants, submitGameResults, cancelGameResults } from "@/utils/api";
import { generateRoundRobinMatches } from "@/utils/matchGenerator";
import { Player, Match } from "@/types/type";

const TournamentPage = () => {
  const params = useParams();
  const gameId = Number(params.gameId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedRounds, setSubmittedRounds] = useState<boolean[]>([]); // 라운드 제출 여부 저장
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px 이하일 때 모바일로 간주
    };

    handleResize(); // 초기 렌더링 시 체크
    window.addEventListener("resize", handleResize); // 윈도우 크기 변경 시 확인

    return () => window.removeEventListener("resize", handleResize); // 클린업
  }, []);

  useEffect(() => {
    const getParticipants = async () => {
      try {
        if (!gameId) return;
        setLoading(true);

        const data = await getGameParticipants(gameId);
        setPlayers(data.players);

        // 라운드 로빈 매칭 생성
        const generatedMatches = generateRoundRobinMatches(data.players);
        setMatches(generatedMatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    if (gameId !== null) {
      getParticipants();
    }
  }, [gameId]);

  // 점수 업데이트 핸들러
  const onChangeScore = (
    roundIndex: number,
    matchIndex: number,
    player: "score1" | "score2",
    value: number,
  ) => {
    setMatches((prevMatches) => {
      const updatedMatches = [...prevMatches];
      updatedMatches[roundIndex][matchIndex][player] = value;
      return updatedMatches;
    });
  };

  const onClickRestartTournament = () => {
    window.location.reload(); // 페이지 새로고침
  };

  const onClickSubmitButton = async (roundIndex: number): Promise<void> => {
    try {
      // 해당 라운드의 결과만 제출
      const results = matches[roundIndex]
        .filter((match) => match.player1 && match.player2) // 휴식 플레이어 제외
        .map((match) => ({
          player1_id: match.player1!.id,
          player2_id: match.player2!.id,
          score1: match.score1,
          score2: match.score2,
        }));

      // 게임 결과를 서버에 제출
      await submitGameResults(gameId, results);
      console.log(`Round ${roundIndex + 1} 게임 결과 저장 완료`, matches);

      // 라운드가 제출되었음을 상태로 관리
      setSubmittedRounds((prev) => {
        const updated = [...prev];
        updated[roundIndex] = true;
        return updated;
      });

      // 라운드 결과 제출 후 갱신된 데이터 가져오기
      const data = await getGameParticipants(gameId);
      setPlayers(data.players); // 플레이어 업데이트
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  const onClickCancelButton = async (roundIndex: number): Promise<void> => {
    try {
      const results = matches[roundIndex]
        .filter((match) => match.player1 && match.player2)
        .map((match) => ({
          player1_id: match.player1!.id,
          player2_id: match.player2!.id,
          score1: match.score1,
          score2: match.score2,
        }));

      await cancelGameResults(gameId, results);
      console.log(`Round ${roundIndex + 1} 게임 결과 취소 완료`, matches);

      setSubmittedRounds((prev) => {
        const updated = [...prev];
        updated[roundIndex] = false;
        return updated;
      });

      const data = await getGameParticipants(gameId);
      setPlayers(data.players);
    } catch (error) {
      console.error("취소 에러:", error);
    }
  };

  // 완료된 라운드 수 계산
  const getCompletedMatchesCount = () => {
    return submittedRounds.filter((submitted) => submitted).length;
  };

  // 전체 라운드 수 계산
  const getTotalRounds = () => {
    return matches.length;
  };

  if (loading) return <div className="flex items-center justify-center">로딩 중...</div>;
  if (error) return <div className="text-red-500">오류 발생: {error}</div>;

  return (
    <div className="h-screen flex flex-col">
      <BackHeader
        title="토너먼트 매치"
        rightContent={
          <span>
            {getCompletedMatchesCount()} / {getTotalRounds()} 라운드 완료
          </span>
        }
      />

      <div className="flex flex-col items-center gap-12 mt-12 w-full max-w-7xl mx-auto">
        {/* 전체 레이아웃 조정 */}
        <div className="flex flex-col lg:flex-row w-full gap-8">
          <div className="flex-1 flex flex-col gap-8">
            {matches.map((round, roundIndex) => (
              <div key={roundIndex} className="w-full">
                <h2 className="text-xl font-bold text-center mb-4">Round {roundIndex + 1}</h2>
                <div
                  className={`grid gap-4 ${
                    round.some((match) => match.restPlayer)
                      ? "grid-cols-2"
                      : "grid-cols-1 max-w-sm mx-auto"
                  }`}
                >
                  {/* 라운드별 매치 */}
                  <div className="flex flex-col gap-4">
                    {round
                      .filter((match) => match.player1 && match.player2)
                      .map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="flex justify-between items-center p-4 border rounded-lg shadow"
                        >
                          {/* Player 1 */}
                          <PlayerScore
                            player={match.player1}
                            score={match.score1}
                            onChange={(value) =>
                              onChangeScore(roundIndex, matchIndex, "score1", value)
                            }
                            reverse={false}
                          />
                          {/* VS */}
                          <span className="font-bold mx-2">VS</span>
                          {/* Player 2 */}
                          <PlayerScore
                            player={match.player2}
                            score={match.score2}
                            onChange={(value) =>
                              onChangeScore(roundIndex, matchIndex, "score2", value)
                            }
                            reverse={!isMobile}
                          />
                        </div>
                      ))}
                  </div>

                  {/* ⏬ 휴식 선수 UI ⏬ */}
                  {round.some((match) => match.restPlayer) && (
                    <div className="flex flex-col gap-4">
                      {round
                        .filter((match) => match.restPlayer)
                        .map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="p-4 border rounded-lg shadow text-center text-gray-500"
                          >
                            {match.restPlayer?.name} (휴식)
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* 라운드 결과 저장 버튼 */}
                <div className="flex justify-center mt-4 gap-4">
                  <Button
                    text={`Round ${roundIndex + 1} 종료`}
                    onClick={() => onClickSubmitButton(roundIndex)}
                    disabled={submittedRounds[roundIndex]}
                  />
                  {submittedRounds[roundIndex] && (
                    <Button text="취소" onClick={() => onClickCancelButton(roundIndex)} />
                  )}
                </div>
              </div>
            ))}
            {/* 게임 재시작 버튼 */}
            <div className="flex justify-center max-w-sm mx-auto">
              <Button text="토너먼트 재진행" onClick={onClickRestartTournament} />
            </div>
          </div>

          {/* 오른쪽: 토너먼트 테이블 */}
          <div className="w-full lg:w-1/3">
            <TournamentTable players={players} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
