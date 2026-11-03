import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError, request } from "../api";

const mockFetch = (impl: () => Promise<Response>) => vi.stubGlobal("fetch", vi.fn(impl));

/** reject된 ApiError를 꺼낸다 (성공하면 테스트 실패) */
const rejection = (p: Promise<unknown>): Promise<ApiError> =>
  p.then(
    () => {
      throw new Error("reject를 기대했지만 resolve됨");
    },
    (e: ApiError) => e,
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request — API 공통 래퍼", () => {
  it("A01: 성공 응답은 JSON 본문을 반환한다", async () => {
    mockFetch(async () => new Response(JSON.stringify({ ok: 1 }), { status: 200 }));

    await expect(request("/x", {}, "실패")).resolves.toEqual({ ok: 1 });
  });

  it("A02: 실패 응답의 error 메시지와 status를 ApiError로 전달한다", async () => {
    mockFetch(async () => new Response(JSON.stringify({ error: "존재하지 않는 게임" }), { status: 404 }));

    const err = await rejection(request("/x", {}, "실패"));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(err.message).toBe("존재하지 않는 게임");
  });

  it("A03: 실패 응답이 JSON이 아니면 fallback 메시지를 쓴다", async () => {
    mockFetch(async () => new Response("<html>Gateway Timeout</html>", { status: 504 }));

    const err = await rejection(request("/x", {}, "라운드 제출 실패"));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(504);
    expect(err.message).toBe("라운드 제출 실패");
  });

  it("A04: 실패 응답에 error 필드가 없으면 fallback 메시지를 쓴다", async () => {
    mockFetch(async () => new Response(JSON.stringify({}), { status: 500 }));

    const err = await rejection(request("/x", {}, "점수 저장 실패"));
    expect(err.message).toBe("점수 저장 실패");
  });

  it("A05: 네트워크 오류는 status 0의 ApiError가 된다", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    const err = await rejection(request("/x", {}, "실패"));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });

  it("A06: Content-Type 헤더를 기본으로 붙인다", async () => {
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await request("/x", { method: "POST" }, "실패");
    const init = (fetchSpy.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });
});
