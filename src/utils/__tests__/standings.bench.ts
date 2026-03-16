import { bench, describe } from "vitest";
import { computeStandings } from "../standings";
import { DbMatch, Participant } from "@/types/type";

const makeParticipant = (id: number): Participant => ({
  id,
  game_id: 1,
  name: `P${id}`,
  handicap: 0,
});

const makeMatch = (
  player1_id: number,
  player2_id: number,
  lap: number,
  round: number,
): DbMatch => ({
  id: lap * 1000 + round * 100 + player1_id,
  game_id: 1,
  lap_number: lap,
  round_number: round,
  player1_id,
  player2_id,
  score1: Math.floor(Math.random() * 4),
  score2: Math.floor(Math.random() * 4),
  is_bye: false,
  bye_player_id: null,
  submitted_at: new Date().toISOString(),
});

// 6명, N Lap 데이터 생성
const makeData = (lapCount: number) => {
  const participants = Array.from({ length: 6 }, (_, i) => makeParticipant(i + 1));
  // 6명 리그: 5라운드 × 3매치 = 15매치/Lap
  const matches: DbMatch[] = [];
  for (let lap = 1; lap <= lapCount; lap++) {
    for (let round = 1; round <= 5; round++) {
      matches.push(makeMatch(1, 2, lap, round));
      matches.push(makeMatch(3, 4, lap, round));
      matches.push(makeMatch(5, 6, lap, round));
    }
  }
  return { participants, matches };
};

describe("Benchmark — computeStandings", () => {
  bench("Lap 1 (15 matches, 6 players)", () => {
    const { participants, matches } = makeData(1);
    computeStandings(matches, participants);
  });

  bench("Lap 5 (75 matches, 6 players)", () => {
    const { participants, matches } = makeData(5);
    computeStandings(matches, participants);
  });

  bench("Lap 10 (150 matches, 6 players)", () => {
    const { participants, matches } = makeData(10);
    computeStandings(matches, participants);
  });

  bench("Lap 50 (750 matches, 6 players)", () => {
    const { participants, matches } = makeData(50);
    computeStandings(matches, participants);
  });
});
