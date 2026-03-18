import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- CRITICAL TERMINAL COMPATIBILITY ---
if (typeof window !== 'undefined') {
  // 1. Polyfill structuredClone
  if (typeof window.structuredClone !== 'function') {
    (window as any).structuredClone = (obj: any) => {
      try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
    };
  }

  // 2. Fix Array.prototype pollution
  try {
    const pollutedProps = ['at'];
    pollutedProps.forEach(prop => {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, prop)) {
        const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, prop);
        if (descriptor && descriptor.enumerable) {
          Object.defineProperty(Array.prototype, prop, { ...descriptor, enumerable: false });
        }
      }
    });
  } catch (e) {}
}
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/components/auth-provider";
import { AlarmProvider } from "@/components/alarm-provider";
import { Toaster } from "sonner";

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
          <AuthProvider>
            <AlarmProvider>
              {children}
            </AlarmProvider>
          </AuthProvider>
        </LanguageProvider>
        <Toaster position="top-center" expand={true} richColors />
      </body>
    </html>
  );
}
