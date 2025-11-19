import { useState, useEffect } from "react";
import { Player, Match } from "@/types/type";
import { getGameParticipants, submitGameResults, cancelGameResults } from "@/utils/api";
import { generateRoundRobinMatches } from "@/utils/matchGenerator";

// 순수 함수: 매치 결과를 API 형식으로 변환
const prepareMatchResults = (matches: Match[]) => {
  return matches
    .filter((match) => match.player1 && match.player2)
    .map((match) => ({
      player1_id: match.player1!.id,
      player2_id: match.player2!.id,
      score1: match.score1,
      score2: match.score2,
    }));
};

export const useTournament = (gameId: number) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[][]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedRounds, setSubmittedRounds] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!gameId) return;
      setLoading(true);

      const data = await getGameParticipants(gameId);
      setPlayers(data.players);

      const generatedMatches = generateRoundRobinMatches(data.players);
      setMatches(generatedMatches);
      setLoading(false);
    };

    if (gameId !== null) {
      fetchData();
    }
  }, [gameId]);

  // 라운드 제출 상태를 업데이트하는 헬퍼 함수
  const updateRoundStatus = (roundIndex: number, isSubmitted: boolean) => {
    setSubmittedRounds((prev) => {
      const updated = [...prev];
      updated[roundIndex] = isSubmitted;
      return updated;
    });
  };

  // 최신 플레이어 데이터를 다시 가져오는 헬퍼 함수
  const refreshPlayerData = async () => {
    const data = await getGameParticipants(gameId);
    setPlayers(data.players);
  };

  const updateScore = (
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

  const submitRound = async (roundIndex: number) => {
    try {
      const results = prepareMatchResults(matches[roundIndex]);
      await submitGameResults(gameId, results);
      updateRoundStatus(roundIndex, true);
      await refreshPlayerData();
    } catch (error) {
      console.error("라운드 제출 에러:", error);
      throw error;
    }
  };

  const cancelRound = async (roundIndex: number) => {
    try {
      const results = prepareMatchResults(matches[roundIndex]);
      await cancelGameResults(gameId, results);
      updateRoundStatus(roundIndex, false);
      await refreshPlayerData();
    } catch (error) {
      console.error("라운드 취소 에러:", error);
      throw error;
    }
  };

  return {
    players,
    matches,
    loading,
    submittedRounds,
    updateScore,
    submitRound,
    cancelRound,
  };
};
