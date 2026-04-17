import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tooldit — Free Online PDF & Image Tools",
    template: "%s | Tooldit",
  },
  description:
    "Free, private, browser-based PDF and image tools. Merge, split, compress PDFs. Convert, edit, and enhance images. No uploads, no ads, no data collection.",
  keywords: [
    "PDF tools",
    "image converter",
    "background remover",
    "merge PDF",
    "compress PDF",
    "image editor",
    "free online tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer/>
          </ThemeProvider>
      </body>
    </html>
  );
}
