import React from "react";

/** 화면 상단에 고정되는 에러 알림 — 스크롤 위치와 관계없이 보인다 */
interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => {
  return (
    <div
      role="alert"
      className="fixed top-4 inset-x-4 z-40 mx-auto max-w-md flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="알림 닫기"
        className="shrink-0 text-red-400 hover:text-red-600 transition-colors leading-none text-base"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner;
