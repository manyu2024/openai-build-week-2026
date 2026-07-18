import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "ARGUS | Security Incident Reasoning",
  description: "See the attack. Understand the story.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}><body className="font-sans"><AppProvider>{children}</AppProvider></body></html>;
}
