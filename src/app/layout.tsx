import type { Metadata } from "next";
import { Cinzel, Inter, IM_Fell_English } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const imFellEnglish = IM_Fell_English({
  variable: "--font-flavor",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Trenches & Dragons | Enter the Abyss",
  description: "A browser-based dungeon crawler forged in the depths of Solana. Pay the toll, survive the trenches, claim your glory.",
  keywords: ["dungeon crawler", "Solana", "Web3 gaming", "dark fantasy", "D&D"],
  authors: [{ name: "Trenches & Dragons" }],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Trenches & Dragons",
    description: "Enter the trenches. Survive. Claim your glory.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${imFellEnglish.variable}`}>
      <body className="antialiased min-h-screen overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
