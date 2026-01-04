import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Trenches & Dragons | Enter the Abyss",
  description: "A browser-based dungeon crawler forged in the depths of Solana. Pay the toll, survive the trenches, claim your glory.",
  keywords: ["dungeon crawler", "Solana", "Web3 gaming", "dark fantasy", "D&D"],
  authors: [{ name: "Trenches & Dragons" }],
  openGraph: {
    title: "Trenches & Dragons",
    description: "Enter the trenches. Survive. Claim your glory.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="antialiased bg-abyss text-parchment min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
