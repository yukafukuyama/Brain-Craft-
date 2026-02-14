import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainCraft - 学習",
  description: "覚えられない単語を、日常の一部に！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
