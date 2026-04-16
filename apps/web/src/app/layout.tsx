import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/lib/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackerStat.gg — Domina cada partida con datos reales",
  description:
    "Plataforma de analítica competitiva para League of Legends, TFT, Valorant y más. Builds, counters, tier lists, perfiles de jugador y coaching con IA.",
  keywords: [
    "TrackerStat",
    "League of Legends",
    "LoL",
    "TFT",
    "Valorant",
    "builds",
    "counters",
    "tier list",
    "gaming analytics",
    "champion stats",
  ],
  authors: [{ name: "TrackerStat.gg Team" }],
  openGraph: {
    title: "TrackerStat.gg — Domina cada partida con datos reales",
    description:
      "Plataforma de analítica competitiva para League of Legends, TFT, Valorant y más.",
    siteName: "TrackerStat.gg",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackerStat.gg — Domina cada partida",
    description:
      "Analítica competitiva para League of Legends, TFT, Valorant y más.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
