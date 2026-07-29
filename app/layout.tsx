import { Suspense } from 'react';
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ViewModeProvider } from "@/presentation/components/common/ViewModeContext";
import { NavigationLoadingHandler } from "@/presentation/components/common/NavigationLoadingHandler";
import Footer from "@/presentation/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  metadataBase: new URL('https://tea-time-six.vercel.app'),
  title: {
    default: '티타임은 즐거워 | Gemini 프롬프트 매니저',
    template: '%s | 티타임은 즐거워',
  },
  description: 'Gemini AI 기반 프롬프트 템플릿 관리, 변수 입력 자동화, 파일 첨부 및 스마트 실행 서비스',
  keywords: ['Gemini', '프롬프트', 'AI', '템플릿', '티타임은 즐거워', '프롬프트 매니저', 'Vercel', 'Next.js'],
  authors: [{ name: 'Tea Time Team' }],
  creator: 'Tea Time Team',
  publisher: 'Tea Time',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: '티타임은 즐거워 | Gemini 프롬프트 매니저',
    description: 'Gemini AI 기반 프롬프트 템플릿 관리, 변수 입력 자동화, 파일 첨부 및 스마트 실행 서비스',
    url: 'https://tea-time-six.vercel.app',
    siteName: '티타임은 즐거워',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '티타임은 즐거워 | Gemini 프롬프트 매니저',
    description: 'Gemini AI 기반 프롬프트 템플릿 관리 및 스마트 실행 서비스',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
          <Suspense fallback={null}>
            <NavigationLoadingHandler />
          </Suspense>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ViewModeProvider>
      </body>
    </html>
  );
}
