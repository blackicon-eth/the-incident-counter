import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = new URL(process.env.APP_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Days Without Discord Incidents",
    template: "%s | Incident Counter",
  },
  description:
    "Live Discord server safety stats, current streaks, and a complete history of incidents.",
  applicationName: "Incident Counter",
  keywords: [
    "Discord",
    "incident tracker",
    "server safety",
    "days without incidents",
  ],
  authors: [{ name: "Incident Counter" }],
  creator: "Incident Counter",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Incident Counter",
    title: "Days Without Discord Incidents",
    description:
      "Live Discord server safety stats, current streaks, and a complete history of incidents.",
    images: [
      {
        url: "/api/og?days=0",
        width: 1200,
        height: 630,
        alt: "Days without Discord incidents counter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Days Without Discord Incidents",
    description:
      "Live Discord server safety stats, current streaks, and a complete history of incidents.",
    images: ["/api/og?days=0"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0e0d",
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
