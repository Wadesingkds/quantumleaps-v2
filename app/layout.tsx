import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "QUANTUM Leaps — Gann Square of 9 XAUUSD Calculator",
  description:
    "Kalkulasi proyeksi harga XAUUSD dengan metode Gann Square of 9. Tools premium untuk trader gold.",
  manifest: "/manifest.json",
  keywords: [
    "gann square of 9",
    "XAUUSD calculator",
    "gold trading",
    "proyeksi harga emas",
  ],
  openGraph: {
    title: "QUANTUM Leaps — Gann Square of 9",
    description:
      "Proyeksi harga XAUUSD presisi untuk trader gold. Lifetime access.",
    url: "https://quantumleaps.biz.id",
    siteName: "Quantum Leaps",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        {/* ponytail: inline SW registration, no library */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
