import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Exercise Trainer",
  description: "Real-time AI fitness coach with pose analysis and voice feedback.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
