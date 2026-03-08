import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MatchUp",
  description: "FC ONLINE 토너먼트 관리 도구",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        #initial-loader {
          position: fixed;
          inset: 0;
          background: linear-gradient(to bottom right, rgb(240 253 244), rgb(209 250 229));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none;
        }
        #initial-loader-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgb(167 243 208);
          border-top-color: rgb(16 185 129);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #initial-loader-text {
          position: absolute;
          top: 60%;
          color: rgb(5 150 105);
          font-size: 1.125rem;
          font-weight: 600;
        }
        .page-loaded #initial-loader {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease-out, visibility 0s 0.3s;
        }
      `,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function() {
          window.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              document.documentElement.classList.add('page-loaded');
            }, 100);
          });
        })();
      `,
        }}
      />
    </head>
    <body>
      {children}
      <SpeedInsights />
      <Analytics />
      <div id="initial-loader">
        <div id="initial-loader-spinner"></div>
        <div id="initial-loader-text">MatchUp 로딩중...</div>
      </div>
    </body>
  </html>
);

export default RootLayout;
