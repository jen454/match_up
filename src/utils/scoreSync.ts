export type Score = { score1: number; score2: number };

/**
 * 점수 낙관적 업데이트의 롤백 판단기.
 *
 * - 매치별로 "서버에 확정된 마지막 점수"와 "가장 최근 요청 번호"를 기억한다.
 * - 저장 실패 시, 그 요청이 해당 매치의 최신 요청일 때만 확정 점수로 되돌린다.
 *   (더 최근 요청이 진행 중이면 그 요청의 결과를 따르므로 되돌리지 않는다.)
 * - 응답 순서가 뒤바뀌어도 더 오래된 요청의 성공이 최신 확정값을 덮어쓰지 않는다.
 */
export const createScoreSync = () => {
  let seq = 0;
  const latestSeq = new Map<number, number>();
  const confirmed = new Map<number, { score: Score; seq: number }>();

  /** 요청 시작. current는 낙관적 반영 직전의 화면 점수 */
  const begin = (matchId: number, current: Score): number => {
    if (!confirmed.has(matchId)) confirmed.set(matchId, { score: current, seq: 0 });
    seq += 1;
    latestSeq.set(matchId, seq);
    return seq;
  };

  /** 저장 성공 */
  const succeed = (matchId: number, requestSeq: number, sent: Score): void => {
    const prev = confirmed.get(matchId);
    if (!prev || requestSeq > prev.seq) confirmed.set(matchId, { score: sent, seq: requestSeq });
  };

  /** 저장 실패. 되돌릴 점수를 반환하고, 되돌리지 않아야 하면 null */
  const fail = (matchId: number, requestSeq: number): Score | null => {
    if (latestSeq.get(matchId) !== requestSeq) return null;
    return confirmed.get(matchId)?.score ?? null;
  };

  return { begin, succeed, fail };
};
