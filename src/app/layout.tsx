import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MatchUp",
  description: "FC ONLINE 대진 생성 및 경기 결과 확인 서비스",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>
      <Header />
      {children}
    </body>
  </html>
);

export default RootLayout;
