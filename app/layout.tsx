import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lausanne-darts.ch"),
  title: "Lausanne Darts | Le spot fléchettes de Lausanne",
  description:
    "Ouverture le 1er août 2026 — Espace dédié aux fléchettes à Lausanne. Pistes connectées, privatisation.",
  openGraph: {
    title: "Lausanne Darts | Ouverture 1er août 2026",
    description:
      "Espace dédié aux fléchettes à Lausanne. Pistes connectées, privatisation.",
    url: "https://lausanne-darts.ch",
    type: "website",
    locale: "fr_CH",
  },
  alternates: {
    canonical: "https://lausanne-darts.ch",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
