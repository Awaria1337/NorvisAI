import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
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
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          inter.variable,
          "font-sans h-full bg-background text-foreground antialiased"
        )}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToasterProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
