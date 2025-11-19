"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RiAddLine } from "@remixicon/react";

const HeroButton: React.FC = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/setup")}
      className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
    >
      <RiAddLine size={20} />새 토너먼트 생성
    </button>
  );
};

export default HeroButton;
