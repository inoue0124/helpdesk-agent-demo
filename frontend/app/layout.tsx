import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Agent Demo Portfolio",
  description: "LangGraph ベースの AI エージェントデモポートフォリオ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-14 items-center px-4">
            <Link href="/" className="text-lg font-bold">
              AI Agent Demo
            </Link>
            <nav className="ml-8 flex gap-4 text-sm text-muted-foreground">
              <Link href="/helpdesk" className="hover:text-foreground transition-colors">
                問い合わせ対応
              </Link>
              <Link href="/data-analysis" className="hover:text-foreground transition-colors">
                データ分析
              </Link>
              <Link href="/marketing" className="hover:text-foreground transition-colors">
                マーケティング
              </Link>
              <Link href="/proposal" className="hover:text-foreground transition-colors">
                提案資料
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
