import { describe, it, expect } from "vitest";
import { createScoreSync } from "../scoreSync";

describe("createScoreSync — 점수 저장 실패 롤백", () => {
  it("R01: 단일 요청 실패 시 요청 전 점수로 되돌린다", () => {
    const sync = createScoreSync();
    const s = sync.begin(1, { score1: 0, score2: 0 });

    expect(sync.fail(1, s)).toEqual({ score1: 0, score2: 0 });
  });

  it("R02: 성공한 점수가 이후 실패 시 되돌릴 기준이 된다", () => {
    const sync = createScoreSync();
    const s1 = sync.begin(1, { score1: 0, score2: 0 });
    sync.succeed(1, s1, { score1: 2, score2: 1 });

    const s2 = sync.begin(1, { score1: 2, score2: 1 });
    expect(sync.fail(1, s2)).toEqual({ score1: 2, score2: 1 });
  });

  it("R03: 더 최근 요청이 있으면 이전 요청 실패는 되돌리지 않는다", () => {
    const sync = createScoreSync();
    const s1 = sync.begin(1, { score1: 0, score2: 0 });
    sync.begin(1, { score1: 2, score2: 1 });

    expect(sync.fail(1, s1)).toBeNull();
  });

  it("R04: 이전 요청 성공 후 최신 요청이 실패하면 이전 요청 점수로 되돌린다", () => {
    const sync = createScoreSync();
    const s1 = sync.begin(1, { score1: 0, score2: 0 });
    const s2 = sync.begin(1, { score1: 2, score2: 1 });
    sync.succeed(1, s1, { score1: 2, score2: 1 });

    expect(sync.fail(1, s2)).toEqual({ score1: 2, score2: 1 });
  });

  it("R05: 늦게 도착한 오래된 성공은 최신 확정 점수를 덮어쓰지 않는다", () => {
    const sync = createScoreSync();
    const s1 = sync.begin(1, { score1: 0, score2: 0 });
    const s2 = sync.begin(1, { score1: 1, score2: 0 });
    sync.succeed(1, s2, { score1: 3, score2: 0 });
    sync.succeed(1, s1, { score1: 1, score2: 0 }); // 늦게 도착

    const s3 = sync.begin(1, { score1: 3, score2: 0 });
    expect(sync.fail(1, s3)).toEqual({ score1: 3, score2: 0 });
  });

  it("R06: 매치끼리 서로 영향을 주지 않는다", () => {
    const sync = createScoreSync();
    const a = sync.begin(1, { score1: 0, score2: 0 });
    const b = sync.begin(2, { score1: 5, score2: 5 });

    expect(sync.fail(1, a)).toEqual({ score1: 0, score2: 0 });
    expect(sync.fail(2, b)).toEqual({ score1: 5, score2: 5 });
  });
});
