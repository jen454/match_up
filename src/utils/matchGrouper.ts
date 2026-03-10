import { DbMatch, Participant, ActiveMatch, ByeEntry, MatchEntry } from "@/types/type";

/**
 * DB에서 가져온 특정 Lap의 DbMatch[]를 UI용 MatchEntry[][] 로 변환한다.
 *
 * - round_number 기준으로 그룹화 (1-based)
 * - is_bye=true 인 레코드는 ByeEntry로 변환 (bye_player_id 기반)
 * - 참가자 Map을 통해 id → Participant 역참조
 *
 * @returns MatchEntry[][] — [라운드 인덱스][매치 인덱스]
 */
export const groupMatchesByRound = (
  lapMatches: DbMatch[],
  participantMap: Map<number, Participant>,
): MatchEntry[][] => {
  if (lapMatches.length === 0) return [];

  // round_number 기준으로 그룹화
  const roundMap = new Map<number, DbMatch[]>();
  for (const m of lapMatches) {
    const existing = roundMap.get(m.round_number) ?? [];
    existing.push(m);
    roundMap.set(m.round_number, existing);
  }

  // 라운드 번호 오름차순 정렬
  const sortedRoundNumbers = Array.from(roundMap.keys()).sort((a, b) => a - b);

  return sortedRoundNumbers.map((roundNum) => {
    const roundMatches = roundMap.get(roundNum)!;

    return roundMatches.map((m): MatchEntry => {
      // Bye 엔트리 처리
      if (m.is_bye && m.bye_player_id !== null) {
        const restPlayer = participantMap.get(m.bye_player_id);
        if (restPlayer) {
          return { kind: "bye", restPlayer } satisfies ByeEntry;
        }
      }

      // 일반 매치 엔트리
      const player1 = participantMap.get(m.player1_id);
      const player2 = participantMap.get(m.player2_id);

      // 참가자를 찾지 못하면 빈 Participant 폴백 (타입 안전성 유지)
      const fallback = (id: number): Participant => ({
        id,
        game_id: m.game_id,
        name: "알 수 없음",
        handicap: 0,
      });

      return {
        kind: "match",
        player1: player1 ?? fallback(m.player1_id),
        player2: player2 ?? fallback(m.player2_id),
        score1: m.score1,
        score2: m.score2,
      } satisfies ActiveMatch;
    });
  });
};
