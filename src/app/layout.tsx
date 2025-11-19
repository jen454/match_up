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
      `,
        }}
      />
    </head>
    <SpeedInsights />
    <body>
      <div id="initial-loader">
        <div id="initial-loader-spinner"></div>
        <div id="initial-loader-text">MatchUp 로딩중...</div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.addEventListener('load', function() {
          const loader = document.getElementById('initial-loader');
          if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease-out';
            setTimeout(function() {
              loader.remove();
            }, 300);
          }
        });
      `,
        }}
      />
      {children}
    </body>
  </html>
);

export default RootLayout;
