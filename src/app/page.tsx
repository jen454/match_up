import { Header, Footer, HeroButton, FeatureCard } from "@/components";
import React from "react";
import { RiTrophyLine, RiBarChartLine, RiSmartphoneLine } from "@remixicon/react";

const features = [
  {
    icon: <RiTrophyLine />,
    title: "자동 리그 대진표 생성",
    description:
      "인원수만 입력하면 라운드 로빈 대진표가 자동 완성됩니다. 홀수 인원도 자동으로 휴식 처리됩니다.",
    colorScheme: "green" as const,
  },
  {
    icon: <RiBarChartLine />,
    title: "실시간 순위 자동 집계",
    description: "점수를 입력하는 즉시 승점, 득실차, 순위가 실시간으로 반영됩니다.",
    colorScheme: "emerald" as const,
  },
  {
    icon: <RiSmartphoneLine />,
    title: "모바일 최적화 UI",
    description: "게임 중에도 모바일에서 빠르고 간편하게 점수를 입력할 수 있습니다.",
    colorScheme: "teal" as const,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header Section */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/HomeBackGround.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-emerald-900/70" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="w-full">
            <div className="max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                번거로운 점수 계산은 끝. <br /> FC 온라인 리그전을 프로처럼 관리하세요.
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                자동 대진 생성부터 실시간 순위표까지. 이제 경기에만 몰입하세요.
              </p>
              <HeroButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 MatchUp을 선택해야 할까요?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FC 온라인 토너먼트 관리를 위한 완벽한 솔루션을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
