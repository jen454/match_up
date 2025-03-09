import React from "react";
import Image from "next/image";
import Logo from "@/public/Logo.svg";

export const Header: React.FC = () => {
  return (
    <div className="h-16 w-full flex fixed items-center px-12 bg-white top-0 left-0 z-50 border-b border-b-[#8c8c8c]">
      <Image src={Logo} alt="MatchUp Logo" width={120} height={60} />
    </div>
  );
};
