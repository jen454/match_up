"use client";

import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScheme: "green" | "emerald" | "teal";
}

const colorClasses = {
  green: {
    bg: "bg-gradient-to-b from-green-50 to-white",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  emerald: {
    bg: "bg-gradient-to-b from-emerald-50 to-white",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  teal: {
    bg: "bg-gradient-to-b from-teal-50 to-white",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, colorScheme }) => {
  const colors = colorClasses[colorScheme];

  return (
    <div
      className={`text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow ${colors.bg}`}
    >
      <div
        className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <div className={`text-2xl ${colors.iconColor}`}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
