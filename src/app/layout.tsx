import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nBoot } from "@/components/i18n-boot";

export const metadata: Metadata = {
  title: "Sonic Academy | أكاديمية سونيك للتعليم الصوتي",
  description:
    "منصة تعليمية صوتية فاخرة — Premium audio learning platform with thousands of professional lessons.",
  keywords: [
    "audio learning",
    "تعليم صوتي",
    "online courses",
    "دورات أونلاين",
    "Sonic Academy",
    "أكاديمية سونيك",
  ],
  authors: [{ name: "Sonic Academy" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Sonic Academy | أكاديمية سونيك",
    description: "Premium audio learning platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7C3AED" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nBoot>{children}</I18nBoot>
          <Toaster />
          <SonnerToaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
