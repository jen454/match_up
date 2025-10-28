import React from "react";
import { Jaro } from "next/font/google";
import { FooterSection } from "@/components";

const jaro = Jaro({
  weight: "400",
  subsets: ["latin"],
});

const footerSections = [
  {
    title: "기능",
    links: ["라운드 로빈 토너먼트", "자동 점수 계산", "모바일 최적화"],
  },
  {
    title: "지원",
    links: ["문의하기", "피드백"],
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center mb-4">
              <h4 className={`text-lg font-bold ${jaro.className}`}>MatchUp</h4>
            </div>
            <p className="text-gray-400 text-sm">FC 온라인 플레이어를 위한 토너먼트 관리 도구</p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <FooterSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 MatchUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
