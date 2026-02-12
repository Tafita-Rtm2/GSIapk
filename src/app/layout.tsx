import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { NotificationInitializer } from "@/components/notification-initializer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GSI Insight",
  description: "Where data meets your future.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3F51B5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider>
          <NotificationInitializer />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
