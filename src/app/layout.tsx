import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEL Live Arrivals — Delhi Airport Flight Tracker",
  description:
    "Real-time inbound flight tracking for Indira Gandhi International Airport (DEL/VIDP). Live positions, on-time status, and delay tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
