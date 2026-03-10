import { useState, useEffect, useMemo, useCallback } from "react";
import { Participant, DbMatch, Standing, ActiveMatch, isActiveMatch } from "@/types/type";
import {
  getGameParticipants,
  getGameMatches,
  updateMatchScore,
  submitRound as apiSubmitRound,
  cancelRound as apiCancelRound,
  createNextLap,
} from "@/utils/api";
import { groupMatchesByRound } from "@/utils/matchGrouper";
import { computeStandings } from "@/utils/standings";

export const useTournament = (gameId: number) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allMatches, setAllMatches] = useState<DbMatch[]>([]); // 전체 Lap 원본
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // 참가자 Map (id → Participant) — groupMatchesByRound에 전달
  const participantMap = useMemo(() => new Map(participants.map((p) => [p.id, p])), [participants]);

  // 존재하는 Lap 번호 목록
  const lapList = useMemo(
    () => [...new Set(allMatches.map((m) => m.lap_number))].sort((a, b) => a - b),
    [allMatches],
  );

  // 가장 최신 Lap 번호
  const latestLap = useMemo(() => (lapList.length > 0 ? Math.max(...lapList) : 1), [lapList]);

  // 현재 보고 있는 Lap이 최신 Lap인지
  const isLatestLap = currentLap === latestLap;

  // 현재 Lap의 DbMatch[]
  const currentLapMatches = useMemo(
    () => allMatches.filter((m) => m.lap_number === currentLap),
    [allMatches, currentLap],
  );

  // 현재 Lap의 UI용 MatchEntry[][] (round_number 기준 그룹화)
  const rounds = useMemo(
    () => groupMatchesByRound(currentLapMatches, participantMap),
    [currentLapMatches, participantMap],
  );

  // 라운드 제출 여부 (현재 Lap 기준)
  const submittedRounds = useMemo<boolean[]>(() => {
    const roundNumbers = [...new Set(currentLapMatches.map((m) => m.round_number))].sort(
      (a, b) => a - b,
    );
    return roundNumbers.map((rn) => {
      const roundMatches = currentLapMatches.filter((m) => m.round_number === rn && !m.is_bye);
      return roundMatches.length > 0 && roundMatches.every((m) => m.submitted_at !== null);
    });
  }, [currentLapMatches]);

  // 현재 Lap의 모든 라운드가 제출되었는지
  const isCurrentLapComplete = useMemo(
    () => submittedRounds.length > 0 && submittedRounds.every(Boolean),
    [submittedRounds],
  );

  // 현재 Lap 기준 순위 (클라이언트 집계 — API 호출 없음)
  const standings = useMemo<Standing[]>(
    () => computeStandings(currentLapMatches, participants),
    [currentLapMatches, participants],
  );

  // ── 초기 데이터 로드 (새로고침 복원) ─────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const [participantsRes, matchesRes] = await Promise.all([
        getGameParticipants(gameId),
        getGameMatches(gameId),
      ]);
      setParticipants(participantsRes.players ?? []);
      setAllMatches(matchesRes.matches ?? []);

      // 가장 최신 Lap으로 초기화
      const laps: number[] = (matchesRes.matches ?? []).map((m: DbMatch) => m.lap_number);
      if (laps.length > 0) setCurrentLap(Math.max(...laps));
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── 점수 업데이트 (로컬 state 즉시 반영 + DB 저장) ───────────────────────
  const updateScore = useCallback(
    async (roundIndex: number, matchIndex: number, score1: number, score2: number) => {
      const roundNumbers = [...new Set(currentLapMatches.map((m) => m.round_number))].sort(
        (a, b) => a - b,
      );
      const targetRoundNumber = roundNumbers[roundIndex];
      const activeInRound = currentLapMatches.filter(
        (m) => m.round_number === targetRoundNumber && !m.is_bye,
      );
      const targetMatch = activeInRound[matchIndex];
      if (!targetMatch) return;

      // 로컬 state 즉시 반영 (score1, score2 동시에)
      setAllMatches((prev) =>
        prev.map((m) => (m.id === targetMatch.id ? { ...m, score1, score2 } : m)),
      );

      // DB 저장
      await updateMatchScore(targetMatch.id, score1, score2);
    },
    [currentLapMatches],
  );

  // ── 라운드 제출 ───────────────────────────────────────────────────────────
  const handleSubmitRound = useCallback(
    async (roundIndex: number) => {
      const roundNumbers = [...new Set(currentLapMatches.map((m) => m.round_number))].sort(
        (a, b) => a - b,
      );
      const targetRoundNumber = roundNumbers[roundIndex];
      await apiSubmitRound(gameId, currentLap, targetRoundNumber);

      // submitted_at 로컬 갱신 → standings는 useMemo로 자동 재계산
      const now = new Date().toISOString();
      setAllMatches((prev) =>
        prev.map((m) =>
          m.game_id === gameId &&
          m.lap_number === currentLap &&
          m.round_number === targetRoundNumber &&
          !m.is_bye
            ? { ...m, submitted_at: now }
            : m,
        ),
      );
    },
    [gameId, currentLap, currentLapMatches],
  );

  // ── 라운드 취소 ───────────────────────────────────────────────────────────
  const handleCancelRound = useCallback(
    async (roundIndex: number) => {
      const roundNumbers = [...new Set(currentLapMatches.map((m) => m.round_number))].sort(
        (a, b) => a - b,
      );
      const targetRoundNumber = roundNumbers[roundIndex];
      await apiCancelRound(gameId, currentLap, targetRoundNumber);

      // submitted_at → null 로컬 갱신 → standings는 useMemo로 자동 재계산
      setAllMatches((prev) =>
        prev.map((m) =>
          m.game_id === gameId &&
          m.lap_number === currentLap &&
          m.round_number === targetRoundNumber
            ? { ...m, submitted_at: null }
            : m,
        ),
      );
    },
    [gameId, currentLap, currentLapMatches],
  );

  // ── 다음 Lap 시작 ─────────────────────────────────────────────────────────
  const startNextLap = useCallback(async () => {
    const nextLap = lapList.length > 0 ? Math.max(...lapList) + 1 : 1;
    const res = await createNextLap(gameId, nextLap);
    const newMatches: DbMatch[] = res.matches ?? [];
    setAllMatches((prev) => [...prev, ...newMatches]);
    setCurrentLap(nextLap);
  }, [gameId, lapList]);

  // ── 현재 Lap 변경 ─────────────────────────────────────────────────────────
  // openModal에서 사용할 수 있도록 rounds + currentLap 기반의 match 참조
  const getActiveMatch = useCallback(
    (roundIndex: number, matchIndex: number): ActiveMatch | null => {
      const entry = rounds[roundIndex]?.[matchIndex];
      if (!entry || !isActiveMatch(entry)) return null;
      return entry;
    },
    [rounds],
  );

  return {
    participants,
    allMatches,
    standings,
    rounds,
    lapList,
    currentLap,
    setCurrentLap,
    loading,
    submittedRounds,
    isCurrentLapComplete,
    isLatestLap,
    updateScore,
    submitRound: handleSubmitRound,
    cancelRound: handleCancelRound,
    startNextLap,
    getActiveMatch,
  };
};
