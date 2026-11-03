import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Participant, DbMatch, ActiveMatch, isActiveMatch } from "@/types/type";
import {
  getGameParticipants,
  getGameMatches,
  updateMatchScore,
  submitRound as apiSubmitRound,
  cancelRound as apiCancelRound,
  createNextLap,
} from "@/utils/api";
import { groupMatchesByRound } from "@/utils/matchGrouper";
import { computeTournamentStandings } from "@/utils/standings";
import { createScoreSync } from "@/utils/scoreSync";
import { toUserMessage, toLoadErrorView, LoadErrorView } from "@/utils/errorMessage";

export const useTournament = (gameId: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allMatches, setAllMatches] = useState<DbMatch[]>([]); // 전체 Lap 원본
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<LoadErrorView | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // 점수 저장 실패 시 롤백 판단 (매치별 확정 점수 · 최신 요청 추적)
  const scoreSyncRef = useRef(createScoreSync());

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

  // 현재 Lap/전체 Lap 순위 (클라이언트 집계 — API 호출 없음)
  const { currentLapStandings: standings, overallStandings } = useMemo(
    () => computeTournamentStandings(allMatches, participants, currentLap),
    [allMatches, participants, currentLap],
  );

  // ── 초기 데이터 로드 (새로고침 복원) ─────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setLoadError(null);
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
    } catch (e) {
      console.error("토너먼트 불러오기 실패:", e);
      setLoadError(toLoadErrorView(e));
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── 점수 업데이트 (로컬 state 즉시 반영 + DB 저장, 실패 시 롤백) ──────────
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

      const matchId = targetMatch.id;
      const sync = scoreSyncRef.current;
      const requestSeq = sync.begin(matchId, {
        score1: targetMatch.score1,
        score2: targetMatch.score2,
      });

      // 로컬 state 즉시 반영 (score1, score2 동시에)
      setError(null);
      setAllMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, score1, score2 } : m)));

      try {
        await updateMatchScore(matchId, score1, score2);
        sync.succeed(matchId, requestSeq, { score1, score2 });
      } catch (e) {
        console.error("점수 저장 실패:", e);
        const rollback = sync.fail(matchId, requestSeq);
        // 더 최근 요청이 진행 중이면 그 결과를 따르므로 되돌리지 않는다
        if (!rollback) return;

        setAllMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...rollback } : m)));
        setError(
          `${toUserMessage(`${targetMatch.round_number}라운드 점수 저장`, e)} 점수는 이전 값으로 되돌렸습니다.`,
        );
      }
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
      setError(null);
      try {
        await apiSubmitRound(gameId, currentLap, targetRoundNumber);
      } catch (e) {
        console.error("라운드 제출 실패:", e);
        setError(toUserMessage(`${targetRoundNumber}라운드 제출`, e));
        return;
      }

      // submitted_at 로컬 갱신 → standings는 useMemo로 자동 재계산
      const now = new Date().toISOString();
      setAllMatches((prev) =>
        prev.map((m) =>
          m.lap_number === currentLap && m.round_number === targetRoundNumber && !m.is_bye
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
      setError(null);
      try {
        await apiCancelRound(gameId, currentLap, targetRoundNumber);
      } catch (e) {
        console.error("라운드 취소 실패:", e);
        setError(toUserMessage(`${targetRoundNumber}라운드 제출 취소`, e));
        return;
      }

      // submitted_at → null 로컬 갱신 → standings는 useMemo로 자동 재계산
      setAllMatches((prev) =>
        prev.map((m) =>
          m.lap_number === currentLap && m.round_number === targetRoundNumber
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
    setError(null);
    let newMatches: DbMatch[];
    try {
      const res = await createNextLap(gameId, nextLap);
      newMatches = res.matches ?? [];
    } catch (e) {
      console.error("다음 회차 생성 실패:", e);
      setError(toUserMessage(`${nextLap}회차 시작`, e));
      return;
    }
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
    overallStandings,
    rounds,
    lapList,
    currentLap,
    setCurrentLap,
    loading,
    loadError,
    retryLoad: fetchAll,
    error,
    clearError,
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
