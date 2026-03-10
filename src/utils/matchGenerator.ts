import { Participant, ActiveMatch, ByeEntry, MatchEntry } from "@/types/type";

/** 홀수 인원 패딩용 유령 선수 — 결과에 노출되지 않음 */
const BYE_PLAYER: Participant = { id: -1, game_id: -1, name: "BYE", handicap: 0 };

/**
 * 라운드 로빈 대진표 생성 (V2)
 *
 * - Circle Method + Bye 패딩으로 홀수/짝수 단일 처리
 * - 인덱스 오프셋(%)으로 O(1) 순환 — 배열 변형 없음
 * - 반환 타입: MatchEntry[][] (ActiveMatch | ByeEntry)
 *
 * @param players - 참가자 배열 (Player 또는 Participant 호환)
 * @returns 라운드별 엔트리 2차원 배열
 */
export const generateRoundRobinMatches = (players: Participant[]): MatchEntry[][] => {
  if (players.length < 2) return [];

  // 홀수면 BYE_PLAYER를 추가해 짝수로 통일
  const padded: Participant[] = players.length % 2 !== 0 ? [...players, BYE_PLAYER] : [...players];

  const n = padded.length; // 항상 짝수
  const fixed = padded[0]; // 고정 선수 (index 0)
  const rotating = padded.slice(1); // 순환 선수 배열, 길이 n-1

  /**
   * 라운드 r, 슬롯 s의 순환 선수를 인덱스 오프셋으로 O(1) 계산
   * - 슬롯 s=1..n/2-1 → 순방향:  rotating[(s-1+r) % (n-1)]
   * - 슬롯 s=1..n/2-1 → 역방향:  rotating[(n-2-s+r) % (n-1)]
   * - 슬롯 s=0 의 fixed 상대:    rotating[(n-2+r) % (n-1)]   ← n-2 = (n-1)-1
   */
  const getRotating = (offset: number, round: number): Participant =>
    rotating[(offset + round) % (n - 1)];

  return Array.from({ length: n - 1 }, (_, round): MatchEntry[] =>
    Array.from({ length: n / 2 }, (__, slot): MatchEntry => {
      // slot 0: fixed vs 마지막 순환 선수
      // slot k: 순방향 k번째 vs 역방향 k번째
      const p1: Participant = slot === 0 ? fixed : getRotating(slot - 1, round);
      const p2: Participant = getRotating(n - 2 - slot, round);

      // BYE 선수가 포함된 슬롯 → ByeEntry (실제 선수를 restPlayer로)
      if (p1.id === -1 || p2.id === -1) {
        const restPlayer = p1.id !== -1 ? p1 : p2;
        return { kind: "bye", restPlayer } satisfies ByeEntry;
      }

      return {
        kind: "match",
        player1: p1,
        player2: p2,
        score1: 0,
        score2: 0,
      } satisfies ActiveMatch;
    }),
  );
};
