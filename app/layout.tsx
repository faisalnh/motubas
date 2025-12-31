import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Motubas - Buku Service Digital untuk Mobil Tua",
  description: "Aplikasi buku service digital untuk pemilik mobil tua di Indonesia. Lacak riwayat service, dapatkan pengingat maintenance, dan konsultasi dengan Om Motu AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
