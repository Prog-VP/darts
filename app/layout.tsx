import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lausanne-darts.ch"),
  title: "Lausanne Darts | Darts room Lausanne",
  description:
    "Ouverture le 1er août 2026 — Darts room à Lausanne avec une ambiance immersive.",
  openGraph: {
    title: "lausanne-darts.ch | Coming 1er août 2026",
    description: "Darts room à Lausanne. Ouverture officielle le 1er août 2026.",
    url: "https://lausanne-darts.ch",
    type: "website",
    locale: "fr_CH"
  },
  alternates: {
    canonical: "https://lausanne-darts.ch"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
