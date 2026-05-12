import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lift — Discipline. Performance. Clarté.",
  description: "Ton coach fitness et nutrition intelligent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <QueryProvider>
          {children}
          <Toaster
            richColors
            position="bottom-right"
            visibleToasts={3}
            duration={3000}
            theme="dark"
          />
        </QueryProvider>
      </body>
    </html>
  );
}
