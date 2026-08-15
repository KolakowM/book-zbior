import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Księgozbiór",
  description: "Twoja biblioteczka, recenzje i wymiana książek.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
