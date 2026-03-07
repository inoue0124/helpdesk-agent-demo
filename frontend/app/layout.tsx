import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ヘルプデスクエージェント デモ",
  description: "AI エージェントによるヘルプデスク問い合わせ対応デモ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
