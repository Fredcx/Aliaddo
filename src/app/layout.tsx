import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SettingsProvider } from "@/components/settings-context";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "AliaDDO - Sistema",
  description: "Gerencie suas consultorias com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-[#F5F5F7] text-gray-900 antialiased`}>
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5de0e6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
