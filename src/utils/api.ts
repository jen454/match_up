// API 요청을 위한 Helper 함수
import type { DbMatch, Participant, Standing } from "@/types/type";

/** API 실패 — HTTP 상태 코드를 함께 보관한다 (status 0 = 네트워크 오류) */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * fetch 공통 래퍼
 * - 네트워크 오류 → ApiError(status 0)
 * - !response.ok → 본문의 error 메시지(없거나 JSON이 아니면 fallback)로 ApiError
 */
export const request = async <T>(url: string, init: RequestInit, fallback: string): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "네트워크 오류");
  }

  if (!response.ok) {
    // Vercel 타임아웃 등 HTML 응답이 올 수 있으므로 JSON 파싱 실패를 허용한다
    const body = await response.json().catch(() => null);
    const message = typeof body?.error === "string" && body.error ? body.error : fallback;
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
};

// 게임 생성 함수
export const createGame = (players: { name: string; handicap: number }[]) =>
  request<{ message: string; gameId: string }>(
    "/api/games",
    { method: "POST", body: JSON.stringify({ players }) },
    "게임 생성 실패",
  );

// 특정 게임 참가자 불러오기 함수
export const getGameParticipants = (gameId: string) =>
  request<{ success: boolean; players: Participant[] }>(
    `/api/games/${gameId}/participants`,
    {},
    "게임 참가자 데이터를 불러오지 못했습니다.",
  );

// 게임 전체(또는 특정 Lap)의 매치 조회
export const getGameMatches = (gameId: string, lap?: number) =>
  request<{ matches: DbMatch[] }>(
    lap !== undefined ? `/api/games/${gameId}/matches?lap=${lap}` : `/api/games/${gameId}/matches`,
    {},
    "매치 데이터를 불러오지 못했습니다.",
  );

// 새 Lap 생성 (대진표 일괄 insert)
export const createNextLap = (gameId: string, lapNumber: number) =>
  request<{ lap_number: number; matches: DbMatch[] }>(
    `/api/games/${gameId}/laps`,
    { method: "POST", body: JSON.stringify({ lap_number: lapNumber }) },
    "Lap 생성 실패",
  );

// 개별 매치 점수 저장
export const updateMatchScore = (matchId: number, score1: number, score2: number) =>
  request<{ match: DbMatch }>(
    `/api/matches/${matchId}`,
    { method: "PATCH", body: JSON.stringify({ score1, score2 }) },
    "점수 저장 실패",
  );

// 라운드 제출
export const submitRound = (gameId: string, lapNumber: number, roundNumber: number) =>
  request<{ submitted: boolean }>(
    `/api/games/${gameId}/laps/${lapNumber}/rounds/${roundNumber}/submit`,
    { method: "POST" },
    "라운드 제출 실패",
  );

// 라운드 제출 취소
export const cancelRound = (gameId: string, lapNumber: number, roundNumber: number) =>
  request<{ submitted: boolean }>(
    `/api/games/${gameId}/laps/${lapNumber}/rounds/${roundNumber}/submit`,
    { method: "DELETE" },
    "라운드 취소 실패",
  );

// 통합 순위 조회
export const getStandings = (gameId: string) =>
  request<{ standings: Standing[] }>(
    `/api/games/${gameId}/standings`,
    {},
    "순위 데이터를 불러오지 못했습니다.",
  );
