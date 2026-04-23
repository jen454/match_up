import { DbMatch, Participant, Standing } from "@/types/type";

export type TournamentStandings = {
  currentLapStandings: Standing[];
  overallStandings: Standing[];
};

/**
 * 모든 Lap의 matches 원본 데이터를 합산하여 통합 순위를 계산한다.
 *
 * - submitted_at이 null인 미제출 매치는 집계에서 제외
 * - is_bye=true인 엔트리는 집계에서 제외
 * - 핸디캡은 초기 points로 반영
 * - 정렬 우선순위: 승점 → 골득실 → 다득점
 *
 * 시간 복잡도: O(M + P log P) — M=총 매치 수, P=참가자 수
 */
export const computeStandings = (matches: DbMatch[], participants: Participant[]): Standing[] => {
  // 1. 참가자 Map 초기화 (handicap을 초기 points로)
  const map = new Map<number, Standing>(
    participants.map((p) => [
      p.id,
      {
        participant_id: p.id,
        name: p.name,
        handicap: p.handicap,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: p.handicap,
      },
    ]),
  );

  // 2. 제출된 일반 매치만 집계
  for (const m of matches) {
    if (m.is_bye || m.submitted_at === null) continue;

    const p1 = map.get(m.player1_id);
    const p2 = map.get(m.player2_id);
    if (!p1 || !p2) continue;

    p1.played++;
    p2.played++;
    p1.goals_for += m.score1;
    p1.goals_against += m.score2;
    p2.goals_for += m.score2;
    p2.goals_against += m.score1;

    if (m.score1 > m.score2) {
      p1.wins++;
      p1.points += 3;
      p2.losses++;
    } else if (m.score1 < m.score2) {
      p2.wins++;
      p2.points += 3;
      p1.losses++;
    } else {
      p1.draws++;
      p1.points += 1;
      p2.draws++;
      p2.points += 1;
    }
  }

  // 3. goal_difference 계산 후 정렬 (승점 → 골득실 → 다득점)
  return Array.from(map.values())
    .map((s) => ({ ...s, goal_difference: s.goals_for - s.goals_against }))
    .sort(
      (a, b) =>
        b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for,
    );
};

export const computeTournamentStandings = (
  allMatches: DbMatch[],
  participants: Participant[],
  currentLap: number,
): TournamentStandings => {
  const currentLapMatches = allMatches.filter((m) => m.lap_number === currentLap);

  return {
    currentLapStandings: computeStandings(currentLapMatches, participants),
    overallStandings: computeStandings(allMatches, participants),
  };
};

