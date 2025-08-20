import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zynkart - Sell Without Limits",
  description:
    "Launch, manage, and scale your online business with our all-in-one platform. Create branded stores, process payments, and grow your customer base—all without technical expertise.",
  icons: [
    {
      url: "/icons/web/favicon.ico",
      type: "image/x-icon",
      sizes: "16x16 32x32",
    },
    {
      url: "/icons/web/icon-192.png",
      type: "image/png",
      sizes: "192x192",
    },
    {
      url: "/icons/web/icon-192-maskable.png",
      type: "image/png",
      sizes: "192x192",
    },
    {
      url: "/icons/web/icon-512-maskable.png",
      type: "image/png",
      sizes: "512x512",
    },
  ],
  openGraph: {
    title: "Zynkart - Sell Without Limits",
    description:
      "Launch, manage, and scale your online business with our all-in-one platform. Create branded stores, process payments, and grow your customer base—all without technical expertise.",
    images: [
      {
        url: "/images/screenshots/image.png",
        width: 1919,
        height: 1046,
      },
    ],
    url: "https://zynkart.store",
    siteName: "Zynkart",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zynkart - Sell Without Limits",
    description:
      "Launch, manage, and scale your online business with our all-in-one platform. Create branded stores, process payments, and grow your customer base—all without technical expertise.",
    images: [
      {
        url: "/images/screenshots/image.png",
        width: 1919,
        height: 1046,
      },
    ],
  },
  metadataBase: new URL("https://zynkart.store"),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#F97316" />
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
