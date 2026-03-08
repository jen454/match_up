import { describe, it, expect } from "vitest";
import { generateRoundRobinMatches } from "../matchGenerator";
import { Participant, isActiveMatch, isByeEntry, ActiveMatch } from "@/types/type";

// ─── 테스트 픽스처 ────────────────────────────────────────────────────────────

const makePlayer = (id: number): Participant => ({
  id,
  name: `P${id}`,
  handicap: 0,
});

const makePlayers = (n: number): Participant[] =>
  Array.from({ length: n }, (_, i) => makePlayer(i + 1));

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("generateRoundRobinMatches — 엣지 케이스", () => {
  it("T01: 0명 → 빈 배열 반환", () => {
    expect(generateRoundRobinMatches([])).toEqual([]);
  });

  it("T02: 1명 → 빈 배열 반환", () => {
    expect(generateRoundRobinMatches([makePlayer(1)])).toEqual([]);
  });

  it("T03: 2명(짝수 최소) → 1라운드, 1 ActiveMatch 반환", () => {
    const result = generateRoundRobinMatches(makePlayers(2));
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].kind).toBe("match");
    const m = result[0][0] as ActiveMatch;
    expect(m.player1.id).toBe(1);
    expect(m.player2.id).toBe(2);
    expect(m.score1).toBe(0);
    expect(m.score2).toBe(0);
  });
});

describe("generateRoundRobinMatches — 홀수 참가자", () => {
  it("T04: 3명 → 3라운드, 각 라운드 1 ActiveMatch + 1 ByeEntry", () => {
    const result = generateRoundRobinMatches(makePlayers(3));
    expect(result).toHaveLength(3);
    result.forEach((round) => {
      const activeCount = round.filter(isActiveMatch).length;
      const byeCount = round.filter(isByeEntry).length;
      expect(activeCount).toBe(1);
      expect(byeCount).toBe(1);
    });
  });

  it("T06: 5명 → 5라운드, 각 라운드 2 ActiveMatch + 1 ByeEntry", () => {
    const result = generateRoundRobinMatches(makePlayers(5));
    expect(result).toHaveLength(5);
    result.forEach((round) => {
      expect(round.filter(isActiveMatch).length).toBe(2);
      expect(round.filter(isByeEntry).length).toBe(1);
    });
  });
});

describe("generateRoundRobinMatches — 짝수 참가자", () => {
  it("T05: 4명 → 3라운드, 각 라운드 2 ActiveMatch, ByeEntry 없음", () => {
    const result = generateRoundRobinMatches(makePlayers(4));
    expect(result).toHaveLength(3);
    result.forEach((round) => {
      expect(round.filter(isActiveMatch).length).toBe(2);
      expect(round.filter(isByeEntry).length).toBe(0);
    });
  });

  it("T07: 6명 → 5라운드, 각 라운드 3 ActiveMatch", () => {
    const result = generateRoundRobinMatches(makePlayers(6));
    expect(result).toHaveLength(5);
    result.forEach((round) => {
      expect(round.filter(isActiveMatch).length).toBe(3);
      expect(round.filter(isByeEntry).length).toBe(0);
    });
  });
});

describe("generateRoundRobinMatches — 라운드 로빈 정확성", () => {
  it("T08: 6명 — 각 선수가 정확히 5회 경기", () => {
    const players = makePlayers(6);
    const result = generateRoundRobinMatches(players);
    const playCounts: Record<number, number> = {};

    result.flat().forEach((entry) => {
      if (isActiveMatch(entry)) {
        playCounts[entry.player1.id] = (playCounts[entry.player1.id] ?? 0) + 1;
        playCounts[entry.player2.id] = (playCounts[entry.player2.id] ?? 0) + 1;
      }
    });

    players.forEach((p) => {
      expect(playCounts[p.id]).toBe(5); // n-1 = 5
    });
  });

  it("T09: 6명 — 모든 대전 쌍이 정확히 1회만 등장 (중복 없음)", () => {
    const result = generateRoundRobinMatches(makePlayers(6));
    const seen = new Set<string>();

    result.flat().forEach((entry) => {
      if (isActiveMatch(entry)) {
        const key = [entry.player1.id, entry.player2.id].sort().join("-");
        expect(seen.has(key), `중복 대전 발견: ${key}`).toBe(false);
        seen.add(key);
      }
    });

    // 6명의 모든 조합: C(6,2) = 15
    expect(seen.size).toBe(15);
  });

  it("T10: 3명(홀수) — ByeEntry의 restPlayer가 BYE 선수가 아님 (id !== -1)", () => {
    const result = generateRoundRobinMatches(makePlayers(3));
    result.flat().forEach((entry) => {
      if (isByeEntry(entry)) {
        expect(entry.restPlayer.id).not.toBe(-1);
        expect(entry.restPlayer.name).not.toBe("BYE");
      }
    });
  });

  it("T10-ext: 5명 — 모든 선수가 정확히 1번씩 휴식", () => {
    const result = generateRoundRobinMatches(makePlayers(5));
    const restCounts: Record<number, number> = {};

    result.flat().forEach((entry) => {
      if (isByeEntry(entry)) {
        restCounts[entry.restPlayer.id] = (restCounts[entry.restPlayer.id] ?? 0) + 1;
      }
    });

    // 5명: 5라운드에 각 선수가 정확히 1회 휴식
    Object.values(restCounts).forEach((count) => {
      expect(count).toBe(1);
    });
  });
});

describe("generateRoundRobinMatches — 불변성 & 순수 함수", () => {
  it("T11: 원본 배열을 변형하지 않음 (Immutability)", () => {
    const players = makePlayers(4);
    const original = players.map((p) => ({ ...p }));
    generateRoundRobinMatches(players);
    expect(players).toEqual(original);
  });

  it("T12: 동일 입력 두 번 호출 → 동일 출력 (Pure Function)", () => {
    const players = makePlayers(4);
    const result1 = generateRoundRobinMatches(players);
    const result2 = generateRoundRobinMatches(players);
    expect(result1).toEqual(result2);
  });
});
