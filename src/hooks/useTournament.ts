import { useState, useEffect } from "react";
import { Player, MatchEntry, ActiveMatch, isActiveMatch } from "@/types/type";
import { getGameParticipants, submitGameResults, cancelGameResults } from "@/utils/api";
import { generateRoundRobinMatches } from "@/utils/matchGenerator";

// 순수 함수: ActiveMatch만 필터링하여 API 형식으로 변환
const prepareMatchResults = (entries: MatchEntry[]) => {
  return entries.filter(isActiveMatch).map((match: ActiveMatch) => ({
    player1_id: match.player1.id,
    player2_id: match.player2.id,
    score1: match.score1,
    score2: match.score2,
  }));
};

export const useTournament = (gameId: number) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<MatchEntry[][]>([]);
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
    setMatches((prevMatches) =>
      prevMatches.map((round, ri) =>
        ri !== roundIndex
          ? round
          : round.map((entry, mi) => {
              if (mi !== matchIndex || entry.kind !== "match") return entry;
              return { ...entry, [player]: value };
            }),
      ),
    );
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
