"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackHeader, FeatureListItem } from "@/components";
import { ParticipantButton } from "@/components/buttons";
import {
  RiFootballLine,
  RiRefreshLine,
  RiCalculatorLine,
  RiUserLine,
  RiArrowRightLine,
} from "@remixicon/react";

const setupFeatures = [
  {
    icon: RiRefreshLine,
    iconColor: "text-green-600",
    text: "리그전 방식 - 라운드 로빈",
  },
  {
    icon: RiCalculatorLine,
    iconColor: "text-emerald-600",
    text: "승점과 순위 자동 계산",
  },
  {
    icon: RiUserLine,
    iconColor: "text-teal-600",
    text: "개별 핸디캡 시스템 지원",
  },
];

const participantCounts = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function SetUpPage() {
  const router = useRouter();
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>("");

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);
    const num = parseInt(value);
    if (num >= 3 && num <= 50) {
      setParticipantCount(num);
    }
  };

  const handleNext = () => {
    if (participantCount < 3 || participantCount > 50) return;

    router.push(`/participants/${participantCount}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <BackHeader title="토너먼트 생성" />

      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiFootballLine className="text-2xl text-gray-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">참가자 수는 몇 명인가요?</h2>
          <p className="text-gray-600">리그전 토너먼트에 참가할 플레이어 수를 선택하세요</p>
        </div>

        <div className="p-8 bg-white border border-green-100 rounded-lg shadow-lg">
          <div className="space-y-6">
            {!showCustomInput ? (
              <>
                {/* Number Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">{participantCount}</div>
                  <p className="text-gray-500">
                    {participantCount % 2 === 0 ? "짝수 플레이어" : "홀수 플레이어 (부전승 배정)"}
                  </p>
                </div>

                {/* Number Selector */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {participantCounts.map((count) => (
                    <ParticipantButton
                      key={count}
                      count={count}
                      isSelected={participantCount === count}
                      onClick={setParticipantCount}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="3"
                    max="50"
                    value={customInput}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    placeholder="3-50 사이의 숫자 입력"
                    className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowCustomInput(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  최소 3명, 최대 50명까지 가능합니다.
                </p>
              </div>
            )}

            {!showCustomInput && (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full p-4 rounded-lg border-2 border-blue-200 hover:border-blue-300 bg-blue-50 transition-all hover:scale-105"
              >
                <div className="font-semibold text-blue-600">직접 입력</div>
                <div className="text-sm text-blue-500">3-50 사이의 숫자</div>
              </button>
            )}

            {/* Format Info */}
            <div className="space-y-3 text-sm text-gray-600">
              {setupFeatures.map((feature, index) => (
                <FeatureListItem
                  key={index}
                  icon={feature.icon}
                  iconColor={feature.iconColor}
                  text={feature.text}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={participantCount < 3 || participantCount > 50}
              className="w-full px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              다음: 참가자 정보 입력
              <RiArrowRightLine size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
