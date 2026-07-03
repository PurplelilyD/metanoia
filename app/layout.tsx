import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metanoia | Know Thyself",
  description: "Catholic spiritual temperament assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
