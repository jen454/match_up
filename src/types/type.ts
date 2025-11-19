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

export interface Match {
  player1: { id: number; name: string; handicap: number } | null;
  player2: { id: number; name: string; handicap: number } | null;
  restPlayer: { id: number; name: string; handicap: number } | null; // 휴식 선수
  score1: number;
  score2: number;
}
