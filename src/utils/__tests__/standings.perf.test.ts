import { describe, it } from "vitest";
import { computeStandings } from "../standings";
import { DbMatch, Participant } from "@/types/type";

const makeParticipant = (id: number): Participant => ({
  id,
  game_id: 1,
  name: `P${id}`,
  handicap: 0,
});

const makeData = (lapCount: number, playerCount: number) => {
  const participants = Array.from({ length: playerCount }, (_, i) => makeParticipant(i + 1));
  const matches: DbMatch[] = [];
  let id = 1;
  for (let lap = 1; lap <= lapCount; lap++) {
    for (let round = 1; round <= playerCount - 1; round++) {
      for (let m = 0; m < Math.floor(playerCount / 2); m++) {
        matches.push({
          id: id++,
          game_id: 1,
          lap_number: lap,
          round_number: round,
          player1_id: m + 1,
          player2_id: playerCount - m,
          score1: id % 4,
          score2: id % 3,
          is_bye: false,
          bye_player_id: null,
          submitted_at: new Date().toISOString(),
        });
      }
    }
  }
  return { participants, matches };
};

describe("Performance — computeStandings (console.time)", () => {
  it("Lap 1, 6명 (15 matches)", () => {
    const { participants, matches } = makeData(1, 6);
    console.time("Lap1_6p");
    for (let i = 0; i < 1000; i++) computeStandings(matches, participants);
    console.timeEnd("Lap1_6p");
  });

  it("Lap 5, 6명 (75 matches)", () => {
    const { participants, matches } = makeData(5, 6);
    console.time("Lap5_6p");
    for (let i = 0; i < 1000; i++) computeStandings(matches, participants);
    console.timeEnd("Lap5_6p");
  });

  it("Lap 10, 6명 (150 matches)", () => {
    const { participants, matches } = makeData(10, 6);
    console.time("Lap10_6p");
    for (let i = 0; i < 1000; i++) computeStandings(matches, participants);
    console.timeEnd("Lap10_6p");
  });

  it("Lap 50, 6명 (750 matches)", () => {
    const { participants, matches } = makeData(50, 6);
    console.time("Lap50_6p");
    for (let i = 0; i < 1000; i++) computeStandings(matches, participants);
    console.timeEnd("Lap50_6p");
  });
});
