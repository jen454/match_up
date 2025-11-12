import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MatchUp",
  description: "FC ONLINE 토너먼트 관리 도구",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <SpeedInsights />
    <body>{children}</body>
  </html>
);

export default RootLayout;
