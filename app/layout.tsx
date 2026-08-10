import type { Metadata } from "next";
import { Inter, Space_Grotesk, Archivo_Black } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-ultra",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lausanne-darts.ch"),
  title: "Lausanne Darts | Le spot fléchettes de Lausanne",
  description:
    "Ouverture cet automne — Espace dédié aux fléchettes à Lausanne. Pistes connectées, privatisation.",
  openGraph: {
    title: "Lausanne Darts | Ouverture cet automne",
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
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable} ${archivoBlack.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
