import { Header, Footer, HeroButton, FeatureCard } from "@/components";
import React from "react";
import { RiTrophyLine, RiBarChartLine, RiSmartphoneLine } from "@remixicon/react";

const features = [
  {
    icon: <RiTrophyLine />,
    title: "대진표 자동 생성",
    description:
      "참가자만 입력하면 대진표가 자동으로 만들어집니다. 모든 참가자가 서로 한 번씩 경기할 수 있도록 일정을 짜줍니다.",
    colorScheme: "green" as const,
  },
  {
    icon: <RiBarChartLine />,
    title: "순위표 자동 정리",
    description:
      "점수를 입력하면 순위가 바로 업데이트됩니다. 한 바퀴가 끝난 뒤 다음 바퀴를 이어서 진행할 수 있고, 바퀴별 순위도 따로 확인할 수 있습니다.",
    colorScheme: "emerald" as const,
  },
  {
    icon: <RiSmartphoneLine />,
    title: "진행 상태 자동 복원",
    description: "페이지를 새로고침하거나 다른 기기로 접속해도 대진표와 점수가 그대로 유지됩니다.",
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-emerald-900/70"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              FC 온라인 토너먼트를
              <br />
              더욱 쉽고 빠르게
            </h1>
            <p className="text-xl sm:text-2xl text-gray-100 mb-8 leading-relaxed">
              대진표 생성부터 순위 집계까지,
              <br />
              모든 과정이 자동으로 처리됩니다.
            </p>
            <HeroButton />
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
