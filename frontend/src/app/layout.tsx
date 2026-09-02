import type { Metadata } from "next";
import "./globals.css";
import { FinSyncSessionProvider } from "@/components/session/FinSyncSessionProvider";

export const metadata: Metadata = {
  title: { default: "ledgr | Your life and wealth, in sync", template: "%s | ledgr" },
  description: "Build a transparent financial digital profile and understand your next best financial steps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="ledgr-theme min-h-full flex flex-col"><FinSyncSessionProvider>{children}</FinSyncSessionProvider></body>
    </html>
  );
}
