import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Days Without Discord Incidents",
  description:
    "A counter that tracks how many days the Discord server has gone without an incident.",
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
