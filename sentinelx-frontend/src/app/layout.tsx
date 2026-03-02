import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "SentinelX",
  description: "Programmable Cross-Chain Risk Orchestration Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0e1a2b] text-gray-200 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
