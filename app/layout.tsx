import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ViewModeProvider } from "@/presentation/components/common/ViewModeContext";
import Footer from "@/presentation/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "티타임은 즐거워 - Gemini 프롬프트 매니저",
  description: "Gemini AI 프롬프트 템플릿 및 자동화 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${geist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
        <ViewModeProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ViewModeProvider>
      </body>
    </html>
  );
}
