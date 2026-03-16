import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Piotras - będziesz grał!",
  description: "Piotras (Piotr Dziadkowiec) - osiłek, który gra na fortepianie i zmusi Cię do ćwiczeń. Brak litości, tylko nuty.",
  openGraph: {
    title: "Piotras - będziesz grał!",
    description: "Piotras (Piotr Dziadkowiec) - osiłek, który gra na fortepianie i zmusi Cię do ćwiczeń. Brak litości, tylko nuty.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <body className={`${inter.className} overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
