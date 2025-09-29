import type { Metadata } from "next";
import { Inter, Poppins, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { cn } from '@/utils/cn';

// Main UI Font - Modern and clean like ChatGPT
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// Heading Font - Professional and elegant
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// Content Font - Highly readable for AI responses
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
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
          poppins.variable,
          sourceSans.variable,
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
