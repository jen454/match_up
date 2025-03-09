"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, PlayerScore, TournamentTable } from "@/components";
import { getGameParticipants, submitGameResults } from "@/utils/api";

interface Player {
  id: number;
  game_id: number;
  name: string;
  handicap: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface Match {
  player1: { id: number; name: string } | null;
  player2: { id: number; name: string } | null;
  restPlayer: { id: number; name: string } | null; // 휴식 선수
  score1: number;
  score2: number;
}

const TournamentPage = () => {
  const params = useParams();
  const gameId = Number(params.gameId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedRounds, setSubmittedRounds] = useState<boolean[]>([]); // 라운드 제출 여부 저장

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

  // 라운드 로빈 방식으로 매칭 생성
  const generateRoundRobinMatches = (players: Player[]): Match[][] => {
    const totalPlayers = players.length;
    const isOdd = totalPlayers % 2 !== 0;
    const totalRounds = isOdd ? totalPlayers : totalPlayers - 1; // 짝수일 때는 -1 라운드

    const schedule: Match[][] = [];
    const usedMatches = new Set<string>(); // 중복 매칭 방지용 Set

    if (isOdd) {
      // 홀수일 경우: 기존 로직 (휴식자 포함)
      for (let round = 0; round < totalRounds; round++) {
        const roundMatches: Match[] = [];
        const restPlayer = players[round]; // 각 라운드별 휴식자 지정
        const availablePlayers = players.filter((p) => p !== restPlayer); // 휴식자를 제외한 리스트

        const paired = new Set<number>(); // 이번 라운드에서 매칭된 선수 ID들

        for (let i = 0; i < availablePlayers.length; i++) {
          const player1 = availablePlayers[i];

          if (paired.has(player1.id)) continue; // 이미 매칭된 선수라면 스킵

          for (let j = i + 1; j < availablePlayers.length; j++) {
            const player2 = availablePlayers[j];

            if (paired.has(player2.id)) continue; // 이미 매칭된 선수라면 스킵

            const matchKey1 = `${player1.id}-${player2.id}`;
            const matchKey2 = `${player2.id}-${player1.id}`;

            if (!usedMatches.has(matchKey1) && !usedMatches.has(matchKey2)) {
              // 새로운 매치 추가
              roundMatches.push({
                player1: { id: player1.id, name: player1.name },
                player2: { id: player2.id, name: player2.name },
                restPlayer: null,
                score1: 0,
                score2: 0,
              });

              // 사용한 매치 기록
              usedMatches.add(matchKey1);
              usedMatches.add(matchKey2);

              // 이번 라운드에서 매칭된 선수들 등록
              paired.add(player1.id);
              paired.add(player2.id);

              break; // player1은 한 명과만 매칭해야 하므로 break
            }
          }
        }

        // 휴식 선수 추가
        roundMatches.push({
          player1: null,
          player2: null,
          restPlayer: { id: restPlayer.id, name: restPlayer.name },
          score1: 0,
          score2: 0,
        });

        schedule.push(roundMatches);
      }
    } else {
      // 짝수일 경우: 원형 방식으로 매칭
      let arrangedPlayers = [...players];

      for (let round = 0; round < totalRounds; round++) {
        const roundMatches: Match[] = [];

        for (let i = 0; i < totalPlayers / 2; i++) {
          const player1 = arrangedPlayers[i];
          const player2 = arrangedPlayers[totalPlayers - 1 - i];

          roundMatches.push({
            player1: { id: player1.id, name: player1.name },
            player2: { id: player2.id, name: player2.name },
            restPlayer: null, // 짝수일 때는 휴식 없음
            score1: 0,
            score2: 0,
          });
        }

        schedule.push(roundMatches);

        // 참가자 순환 (맨 마지막 선수를 제외하고 로테이션)
        arrangedPlayers = [
          arrangedPlayers[0], // 첫 번째 선수는 고정
          ...arrangedPlayers.slice(2), // 두 번째부터 마지막 전까지 이동
          arrangedPlayers[1], // 원래 두 번째 선수를 마지막으로 이동
        ];
      }
    }

    return schedule;
  };

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

  const onClickButton = async (roundIndex: number): Promise<void> => {
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
      console.log(`Round ${roundIndex + 1} 게임 결과 저장 완료`);

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

  if (loading) return <div className="flex items-center justify-center">로딩 중...</div>;
  if (error) return <div className="text-red-500">오류 발생: {error}</div>;

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="flex flex-col items-center gap-12 mt-32 w-full max-w-7xl">
        <div className="text-3xl font-bold text-center">토너먼트 매치</div>

        {/* 전체 레이아웃 조정 */}
        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* 왼쪽: 매치 리스트 */}
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
                            reverse={false} // 이름 먼저
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
                            reverse={true} // 입력칸 먼저
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
                <div className="flex justify-center mt-4">
                  <Button
                    text={`Round ${roundIndex + 1} 종료`}
                    onClick={() => onClickButton(roundIndex)}
                    disabled={submittedRounds[roundIndex]} // 이미 제출한 경우 비활성화
                  />
                </div>
              </div>
            ))}
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
