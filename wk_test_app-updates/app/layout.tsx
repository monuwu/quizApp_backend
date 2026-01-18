import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { QueryProvider } from "@/providers/QueryProvider";
import { TranslationProvider } from "../context/TranslationContext";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import LayoutWithNav from "@/components/LayoutWithNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wakanda QuizMaster",
  description: "Test your knowledge with interactive quizzes",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/30x30 WB Fav icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <TranslationProvider>
              <LayoutWithNav>{children}</LayoutWithNav>
            </TranslationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
