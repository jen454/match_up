export interface Participant {
  id: number;
  name: string;
  handicap: number;
}

export interface Player {
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

/** 실제 대전 엔트리 — player1/player2 모두 null 없음 */
export interface ActiveMatch {
  kind: "match";
  player1: Participant;
  player2: Participant;
  score1: number;
  score2: number;
}

/** 휴식(Bye) 엔트리 — restPlayer null 없음 */
export interface ByeEntry {
  kind: "bye";
  restPlayer: Participant;
}

/** 라운드 내 단일 엔트리 */
export type MatchEntry = ActiveMatch | ByeEntry;

/** 타입 가드: ActiveMatch 판별 */
export const isActiveMatch = (entry: MatchEntry): entry is ActiveMatch => entry.kind === "match";

/** 타입 가드: ByeEntry 판별 */
export const isByeEntry = (entry: MatchEntry): entry is ByeEntry => entry.kind === "bye";
