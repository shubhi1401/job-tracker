
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobTracker AI",
  description: "Track job applications and manage your job search.",
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
