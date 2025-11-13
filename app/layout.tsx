import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bug Ranking Tracker",
  description: "Track versions and bugs efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
