import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-client";
import { buildLiftCssBlocks } from "@/design/token-css-vars";
import { ObservabilityBootstrap } from "@/lib/observability/ObservabilityBootstrap";
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

/**
 * Satoshi via Fontshare — usage personnel OK.
 * Usage commercial (ex. Lift Premium) : licence Indian Type Foundry ou alternative (ex. Plus Jakarta Sans).
 */
export const metadata: Metadata = {
  title: "Lift — Discipline. Performance. Clarté.",
  description: "Ton coach fitness et nutrition intelligent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const liftCss = buildLiftCssBlocks();

  return (
    <html lang="fr" data-theme="light" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var k='lift-theme';var t=localStorage.getItem(k);if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}}()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <style id="lift-tokens" dangerouslySetInnerHTML={{ __html: liftCss }} />
        <ObservabilityBootstrap />
        <QueryProvider>
          {children}
          <Toaster
            richColors
            position="bottom-right"
            visibleToasts={3}
            duration={3000}
            toastOptions={{
              classNames: {
                toast:
                  "!border-(--lift-border-subtle) !bg-(--lift-bg-card) !text-(--lift-text-primary)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
