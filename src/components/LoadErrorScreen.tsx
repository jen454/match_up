"use client";

import React from "react";
import Link from "next/link";
import { RiErrorWarningLine, RiSearchLine } from "@remixicon/react";
import { LoadErrorView } from "@/utils/errorMessage";

interface LoadErrorScreenProps {
  view: LoadErrorView;
  onRetry: () => void;
}

/** 토너먼트 초기 로드 실패 시 전체 화면 안내 */
const LoadErrorScreen = ({ view, onRetry }: LoadErrorScreenProps) => {
  const isNotFound = view.kind === "not-found";
  const Icon = isNotFound ? RiSearchLine : RiErrorWarningLine;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        role="alert"
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isNotFound ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600"
          }`}
        >
          <Icon size={32} />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">{view.title}</h1>
        <p className="text-gray-600 mb-6">{view.description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isNotFound ? (
            <Link
              href="/setup"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              새 토너먼트 만들기
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              다시 시도
            </button>
          )}
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoadErrorScreen;
