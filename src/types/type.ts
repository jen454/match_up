export interface Participant {
  id: number;
  game_id: number;
  name: string;
  handicap: number;
}

/** DB matches 테이블의 원본 레코드 */
export interface DbMatch {
  id: number;
  game_id: number;
  lap_number: number;
  round_number: number;
  player1_id: number;
  player2_id: number;
  score1: number;
  score2: number;
  is_bye: boolean;
  bye_player_id: number | null;
  submitted_at: string | null;
}

/** computeStandings() 반환값 — 모든 Lap 합산 결과 */
export interface Standing {
  participant_id: number;
  name: string;
  handicap: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number; // handicap + (wins×3) + draws
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
