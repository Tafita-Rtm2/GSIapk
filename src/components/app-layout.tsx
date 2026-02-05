"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BookOpen, Library, User, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: t("accueil"), href: "/" },
    { icon: Calendar, label: t("planning"), href: "/schedule" },
    { icon: BookOpen, label: t("matieres"), href: "/subjects" },
    { icon: Library, label: t("biblio"), href: "/library" },
    { icon: Briefcase, label: t("career"), href: "/career" },
    { icon: User, label: t("profil"), href: "/profile" },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background shadow-xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all active:scale-90",
                isActive ? "text-primary scale-110" : "text-gray-500"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button for Ask Insight */}
      <Link
        href="/chat"
        className="absolute bottom-24 right-4 bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}
