import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "JobTracker AI | AI-Powered Job Application Tracker",
  description:
    "Track applications, improve resumes, generate cover letters, and prepare for interviews with an AI-powered job tracker."
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
