import { ApiError } from "@/utils/api";

/**
 * API 실패를 사용자에게 보여줄 문장으로 바꾼다.
 *
 * @param action - 실패한 동작 (예: "1라운드 제출") — "~에 실패했습니다" 앞에 붙는다
 * @param error  - catch로 받은 값
 */
export const toUserMessage = (action: string, error: unknown): string => {
  const head = `${action}에 실패했습니다.`;

  if (!(error instanceof ApiError)) return `${head} 잠시 후 다시 시도해 주세요.`;

  switch (error.status) {
    case 0:
      return `${head} 인터넷 연결을 확인해 주세요.`;
    case 400:
      // 400은 서버가 입력 문제를 구체적으로 알려준다
      return `${head} ${error.message}`;
    case 404:
      return `${head} 게임을 찾을 수 없습니다. 링크를 확인해 주세요.`;
    case 409:
      return `${head} 이미 처리된 요청입니다. 새로고침해 주세요.`;
    default:
      return `${head} 잠시 후 다시 시도해 주세요.`;
  }
};
