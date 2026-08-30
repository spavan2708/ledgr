import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinSync | Your life and wealth, in sync",
  description: "Build a transparent financial digital profile and understand your next best financial steps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
