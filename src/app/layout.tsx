import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- ULTRA-ROBUST TERMINAL & WEBVIEW COMPATIBILITY ---
if (typeof window !== 'undefined') {
  // 0. Polyfill Promise.withResolvers
  if (typeof Promise.withResolvers !== 'function') {
    (Promise as any).withResolvers = function<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }

  // 1. Polyfill structuredClone
  if (typeof window.structuredClone !== 'function') {
    (window as any).structuredClone = (obj: any) => {
      try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
    };
  }

  // 2. Comprehensive Prototype Polyfills
  const forceNonEnumerable = (proto: any, prop: string, value: any) => {
    if (proto && !Object.prototype.hasOwnProperty.call(proto, prop)) {
      try {
        Object.defineProperty(proto, prop, {
          value,
          writable: true,
          enumerable: false,
          configurable: true
        });
      } catch (e) {}
    }
  };

  forceNonEnumerable(Array.prototype, 'at', function(n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  });

  forceNonEnumerable(Array.prototype, 'flat', function(depth = 1) {
    const flatten = (arr: any[], d: number): any[] => {
      return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), []) : arr.slice();
    };
    return flatten(this, depth);
  });

  forceNonEnumerable(Array.prototype, 'flatMap', function(callback: any, thisArg: any) {
    return this.map(callback, thisArg).flat();
  });

  // 3. GSI Environment Sanitizer (Aggressive)
  try {
    const problematic = ['at', 'findLast', 'findLastIndex', 'flat', 'flatMap', 'includes'];
    problematic.forEach(prop => {
      [Array.prototype, String.prototype, Object.prototype].forEach(proto => {
        if (Object.prototype.hasOwnProperty.call(proto, prop)) {
          const desc = Object.getOwnPropertyDescriptor(proto, prop);
          if (desc && desc.enumerable) {
            Object.defineProperty(proto, prop, { ...desc, enumerable: false });
          }
        }
      });
    });
  } catch (e) {}
}

import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/components/auth-provider";
import { AlarmProvider } from "@/components/alarm-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GROUPE GSI",
  description: "Plateforme Pédagogique Mobile - Groupe GSI Internationale",
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
