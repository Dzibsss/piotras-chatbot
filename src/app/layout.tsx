import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gemini Ultra Chat",
  description: "Advanced AI Chatbot powered by Google Gemini 1.5 Flash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
