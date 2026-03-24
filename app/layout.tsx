import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lausanne-darts.ch"),
  title: "Lausanne Darts | Salon de fléchettes premium",
  description:
    "Ouverture le 01.08.2026 — Lausanne Darts, le nouveau salon de fléchettes premium à Lausanne.",
  openGraph: {
    title: "Lausanne Darts | Coming 01.08.2026",
    description:
      "Salon de fléchettes premium, ambiance dark & moderne à Lausanne. Ouverture officielle le 01.08.2026.",
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
