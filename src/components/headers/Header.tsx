import React from "react";
import Image from "next/image";
import Logo from "@/public/Logo.svg";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Image src={Logo} alt="MatchUp Logo" width={120} height={60} />
        </div>
      </div>
    </header>
  );
};

export default Header;
