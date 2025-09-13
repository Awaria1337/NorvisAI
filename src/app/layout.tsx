import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterProvider from '@/components/providers/ToasterProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { cn } from '@/utils/cn';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Norvis AI - Multi-Modal AI Chat Platform",
  description: "Connect with multiple AI providers using your own API keys",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(
        inter.variable,
        "font-sans h-full bg-gray-50 antialiased"
      )}>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
