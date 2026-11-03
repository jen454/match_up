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

export type LoadErrorView = {
  /** not-found: 다시 시도해도 소용없음 → 홈으로 안내 / retryable: 다시 시도 버튼 제공 */
  kind: "not-found" | "retryable";
  title: string;
  description: string;
};

/** 토너먼트 초기 로드 실패를 전체 화면 안내 내용으로 바꾼다 */
export const toLoadErrorView = (error: unknown): LoadErrorView => {
  if (error instanceof ApiError && error.status === 404) {
    return {
      kind: "not-found",
      title: "게임을 찾을 수 없습니다",
      description: "링크 주소가 정확한지 확인해 주세요. 새 토너먼트를 만들 수도 있습니다.",
    };
  }

  if (error instanceof ApiError && error.status === 0) {
    return {
      kind: "retryable",
      title: "토너먼트를 불러오지 못했습니다",
      description: "인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
    };
  }

  return {
    kind: "retryable",
    title: "토너먼트를 불러오지 못했습니다",
    description: "일시적인 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.",
  };
};
