"use client";

import { useRouter } from "next/navigation";
import { RiArrowLeftLine, RiHomeLine } from "@remixicon/react";

interface BackButtonProps {
  label?: "뒤로" | "홈";
}

const BackButton: React.FC<BackButtonProps> = ({ label = "뒤로" }) => {
  const router = useRouter();

  const handleNavigation = () => {
    if (label === "홈") {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleNavigation}
      className="mr-4 px-4 py-2 border border-green-200 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
    >
      {label === "홈" ? <RiHomeLine size={16} /> : <RiArrowLeftLine size={16} />}
      {label}
    </button>
  );
};

export default BackButton;