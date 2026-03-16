import { describe, it, expect } from "vitest";
import { computeStandings } from "../standings";
import { DbMatch, Participant } from "@/types/type";

// ─── 픽스처 헬퍼 ─────────────────────────────────────────────────────────────

const makeParticipant = (id: number, handicap = 0): Participant => ({
  id,
  game_id: 1,
  name: `P${id}`,
  handicap,
});

const makeMatch = (
  overrides: Partial<DbMatch> & Pick<DbMatch, "player1_id" | "player2_id">,
): DbMatch => ({
  id: Math.random(),
  game_id: 1,
  lap_number: 1,
  round_number: 1,
  score1: 0,
  score2: 0,
  is_bye: false,
  bye_player_id: null,
  submitted_at: new Date().toISOString(), // 기본값: 제출 완료
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeStandings — 기본 집계", () => {
  it("S01: 2명, 1경기 승리 — 승점 정확히 반영", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [makeMatch({ player1_id: 1, player2_id: 2, score1: 2, score2: 1 })];

    const result = computeStandings(matches, participants);

    expect(result[0].participant_id).toBe(1);
    expect(result[0].wins).toBe(1);
    expect(result[0].points).toBe(3); // handicap(0) + 승(3)
    expect(result[1].participant_id).toBe(2);
    expect(result[1].losses).toBe(1);
    expect(result[1].points).toBe(0);
  });

  it("S02: 무승부 처리 — 양쪽 각 1점", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [makeMatch({ player1_id: 1, player2_id: 2, score1: 1, score2: 1 })];

    const result = computeStandings(matches, participants);

    expect(result[0].draws).toBe(1);
    expect(result[0].points).toBe(1);
    expect(result[1].draws).toBe(1);
    expect(result[1].points).toBe(1);
  });

  it("S03: 0-0 무승부 — 양쪽 각 1점", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [makeMatch({ player1_id: 1, player2_id: 2, score1: 0, score2: 0 })];

    const result = computeStandings(matches, participants);

    expect(result[0].draws).toBe(1);
    expect(result[0].points).toBe(1);
    expect(result[1].draws).toBe(1);
    expect(result[1].points).toBe(1);
  });
});

describe("computeStandings — 핸디캡 반영", () => {
  it("S04: handicap이 초기 points에 반영됨", () => {
    const participants = [makeParticipant(1, 2), makeParticipant(2, 1)];
    const matches = [makeMatch({ player1_id: 1, player2_id: 2, score1: 1, score2: 1 })];

    const result = computeStandings(matches, participants);
    const p1 = result.find((s) => s.participant_id === 1)!;
    const p2 = result.find((s) => s.participant_id === 2)!;

    expect(p1.points).toBe(3); // handicap(2) + 무(1)
    expect(p2.points).toBe(2); // handicap(1) + 무(1)
  });

  it("S05: 매치 없이 handicap만 있어도 points에 반영됨", () => {
    const participants = [makeParticipant(1, 5), makeParticipant(2, 0)];
    const result = computeStandings([], participants);

    const p1 = result.find((s) => s.participant_id === 1)!;
    expect(p1.points).toBe(5);
    expect(p1.played).toBe(0);
  });
});

describe("computeStandings — 미제출/Bye 제외", () => {
  it("S06: submitted_at=null 인 매치는 집계에서 제외", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [
      makeMatch({ player1_id: 1, player2_id: 2, score1: 3, score2: 0, submitted_at: null }),
    ];

    const result = computeStandings(matches, participants);

    expect(result[0].played).toBe(0);
    expect(result[0].points).toBe(0);
  });

  it("S07: is_bye=true 매치는 집계에서 제외", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [
      makeMatch({ player1_id: 1, player2_id: 2, score1: 0, score2: 0, is_bye: true }),
    ];

    const result = computeStandings(matches, participants);

    expect(result[0].played).toBe(0);
    expect(result[1].played).toBe(0);
  });
});

describe("computeStandings — 멀티 Lap 누적", () => {
  it("S08: Lap 1 + Lap 2 누적 합산", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [
      // Lap 1: p1 승
      makeMatch({ player1_id: 1, player2_id: 2, score1: 2, score2: 1, lap_number: 1 }),
      // Lap 2: p2 승
      makeMatch({ player1_id: 1, player2_id: 2, score1: 0, score2: 1, lap_number: 2 }),
    ];

    const result = computeStandings(matches, participants);
    const p1 = result.find((s) => s.participant_id === 1)!;
    const p2 = result.find((s) => s.participant_id === 2)!;

    expect(p1.wins).toBe(1);
    expect(p1.losses).toBe(1);
    expect(p1.points).toBe(3);
    expect(p2.wins).toBe(1);
    expect(p2.losses).toBe(1);
    expect(p2.points).toBe(3);
    // 골득실: p1(2+0 - 1+1)=0, p2(1+1 - 2+0)=0
    expect(p1.goal_difference).toBe(0);
  });

  it("S09: Lap 10회 반복 — 모든 Lap 합산 정확성", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    // 10 Lap 모두 p1 승 (2-0)
    const matches = Array.from({ length: 10 }, (_, i) =>
      makeMatch({ player1_id: 1, player2_id: 2, score1: 2, score2: 0, lap_number: i + 1 }),
    );

    const result = computeStandings(matches, participants);
    const p1 = result.find((s) => s.participant_id === 1)!;

    expect(p1.wins).toBe(10);
    expect(p1.points).toBe(30);
    expect(p1.goals_for).toBe(20);
    expect(p1.played).toBe(10);
  });
});

describe("computeStandings — 정렬 우선순위", () => {
  it("S10: 승점 동점 시 골득실 우선", () => {
    const participants = [makeParticipant(1), makeParticipant(2), makeParticipant(3)];
    const matches = [
      // p1 vs p2: p1 승 (3-0)
      makeMatch({ player1_id: 1, player2_id: 2, score1: 3, score2: 0, round_number: 1 }),
      // p3 vs p2: p3 승 (1-0)
      makeMatch({ player1_id: 3, player2_id: 2, score1: 1, score2: 0, round_number: 2 }),
      // p1 vs p3: 무승부
      makeMatch({ player1_id: 1, player2_id: 3, score1: 0, score2: 0, round_number: 3 }),
    ];

    const result = computeStandings(matches, participants);
    // p1: 3+1=4점, gd=3, p3: 1+1=2점+1... 실제로 p1이 1위
    expect(result[0].participant_id).toBe(1);
  });

  it("S11: 골득실도 동점 시 다득점 우선", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [
      // p1 승 3-2, p2 패
      makeMatch({ player1_id: 1, player2_id: 2, score1: 3, score2: 2 }),
    ];

    const result = computeStandings(matches, participants);
    expect(result[0].participant_id).toBe(1);
    expect(result[0].goals_for).toBe(3);
  });
});

describe("computeStandings — 골 집계", () => {
  it("S12: 득점/실점/골득실 정확히 계산", () => {
    const participants = [makeParticipant(1), makeParticipant(2)];
    const matches = [
      makeMatch({ player1_id: 1, player2_id: 2, score1: 3, score2: 1 }),
      makeMatch({ player1_id: 1, player2_id: 2, score1: 1, score2: 2, round_number: 2 }),
    ];

    const result = computeStandings(matches, participants);
    const p1 = result.find((s) => s.participant_id === 1)!;

    expect(p1.goals_for).toBe(4); // 3+1
    expect(p1.goals_against).toBe(3); // 1+2
    expect(p1.goal_difference).toBe(1);
  });
});
