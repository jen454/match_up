import React from "react";
import { BackButton } from "@components/buttons";

interface BackHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  backButtonLabel?: "뒤로" | "홈";
}

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  rightContent,
  backButtonLabel = "뒤로",
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BackButton label={backButtonLabel} />
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          {rightContent && <div className="text-sm text-gray-500">{rightContent}</div>}
        </div>
      </div>
    </header>
  );
};

export default BackHeader;
