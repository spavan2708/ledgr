import type { Metadata } from "next";
import "./globals.css";
import { FinSyncSessionProvider } from "@/components/session/FinSyncSessionProvider";
import { AICompanion } from "@/components/agent/AICompanion";

export const metadata: Metadata = {
  title: { default: "FinSync | Your life and wealth, in sync", template: "%s | FinSync" },
  description: "Build a transparent financial digital profile and understand your next best financial steps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><FinSyncSessionProvider>{children}<AICompanion /></FinSyncSessionProvider></body>
    </html>
  );
}
