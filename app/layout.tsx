import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "《雲海慈光》創作紀錄",
  description: "天代師父法相油畫的120天創作進度、影像與確認紀錄。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
