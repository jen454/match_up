import { describe, it, expect } from "vitest";
import { ApiError } from "../api";
import { toUserMessage } from "../errorMessage";

describe("toUserMessage — 사용자용 에러 문구", () => {
  it("E01: 네트워크 오류(status 0)는 연결 확인 안내", () => {
    expect(toUserMessage("1라운드 제출", new ApiError(0, "네트워크 오류"))).toBe(
      "1라운드 제출에 실패했습니다. 인터넷 연결을 확인해 주세요.",
    );
  });

  it("E02: 400은 서버의 구체적인 메시지를 그대로 보여준다", () => {
    expect(toUserMessage("토너먼트 생성", new ApiError(400, "참가자 정보가 없습니다."))).toBe(
      "토너먼트 생성에 실패했습니다. 참가자 정보가 없습니다.",
    );
  });

  it("E03: 404는 게임을 찾을 수 없다는 안내", () => {
    expect(toUserMessage("다음 회차 시작", new ApiError(404, "존재하지 않는 게임"))).toBe(
      "다음 회차 시작에 실패했습니다. 게임을 찾을 수 없습니다. 링크를 확인해 주세요.",
    );
  });

  it("E04: 409는 새로고침 안내", () => {
    expect(toUserMessage("다음 회차 시작", new ApiError(409, "Lap 2은 이미 존재합니다."))).toBe(
      "다음 회차 시작에 실패했습니다. 이미 처리된 요청입니다. 새로고침해 주세요.",
    );
  });

  it("E05: 500은 서버 내부 메시지를 노출하지 않는다", () => {
    expect(toUserMessage("2라운드 취소", new ApiError(500, "서버 오류"))).toBe(
      "2라운드 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
  });

  it("E06: ApiError가 아닌 값도 기본 문구로 처리한다", () => {
    expect(toUserMessage("점수 저장", new Error("boom"))).toBe(
      "점수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
    expect(toUserMessage("점수 저장", "string")).toBe(
      "점수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
  });
});
