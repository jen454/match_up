// API 요청을 위한 Helper 함수

// 게임 생성 함수
export const createGame = async (players: { name: string; handicap: number }[]) => {
  const response = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ players }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "게임 생성 실패");
  }

  return response.json();
};

// 특정 게임 참가자 불러오기 함수
export const getGameParticipants = async (gameId: number) => {
  const response = await fetch(`/api/games/${gameId}/participants`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "게임 참가자 데이터를 불러오지 못했습니다.");
  }

  return response.json();
};

// 게임 전체(또는 특정 Lap)의 매치 조회
export const getGameMatches = async (gameId: number, lap?: number) => {
  const url =
    lap !== undefined ? `/api/games/${gameId}/matches?lap=${lap}` : `/api/games/${gameId}/matches`;

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "매치 데이터를 불러오지 못했습니다.");
  }

  return response.json(); // { matches: DbMatch[] }
};

// 새 Lap 생성 (대진표 일괄 insert)
export const createNextLap = async (gameId: number, lapNumber: number) => {
  const response = await fetch(`/api/games/${gameId}/laps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lap_number: lapNumber }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Lap 생성 실패");
  }

  return response.json(); // { lap_number, matches: DbMatch[] }
};

// 개별 매치 점수 저장
export const updateMatchScore = async (matchId: number, score1: number, score2: number) => {
  const response = await fetch(`/api/matches/${matchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score1, score2 }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "점수 저장 실패");
  }

  return response.json(); // { match: DbMatch }
};

// 라운드 제출
export const submitRound = async (gameId: number, lapNumber: number, roundNumber: number) => {
  const response = await fetch(
    `/api/games/${gameId}/laps/${lapNumber}/rounds/${roundNumber}/submit`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "라운드 제출 실패");
  }

  return response.json();
};

// 라운드 제출 취소
export const cancelRound = async (gameId: number, lapNumber: number, roundNumber: number) => {
  const response = await fetch(
    `/api/games/${gameId}/laps/${lapNumber}/rounds/${roundNumber}/submit`,
    { method: "DELETE", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "라운드 취소 실패");
  }

  return response.json();
};

// 통합 순위 조회
export const getStandings = async (gameId: number) => {
  const response = await fetch(`/api/games/${gameId}/standings`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "순위 데이터를 불러오지 못했습니다.");
  }

  return response.json(); // { standings: Standing[] }
};
