import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Machine",
  description: "An 8-step pipeline that interviews you, then writes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-neutral-100 min-h-screen">{children}</body>
    </html>
  );
}
