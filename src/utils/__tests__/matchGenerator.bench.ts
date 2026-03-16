import { bench, describe } from "vitest";
import { generateRoundRobinMatches } from "../matchGenerator";
import { Participant } from "@/types/type";

const makePlayers = (n: number): Participant[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, game_id: 1, name: `P${i + 1}`, handicap: 0 }));

describe("Benchmark — V2 generateRoundRobinMatches", () => {
  bench("V2 n=4", () => {
    generateRoundRobinMatches(makePlayers(4));
  });

  bench("V2 n=8", () => {
    generateRoundRobinMatches(makePlayers(8));
  });

  bench("V2 n=16", () => {
    generateRoundRobinMatches(makePlayers(16));
  });

  bench("V2 n=32", () => {
    generateRoundRobinMatches(makePlayers(32));
  });
});
