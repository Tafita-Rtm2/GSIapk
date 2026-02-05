"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "fr" | "en";

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const translations: Translations = {
  accueil: { fr: "Accueil", en: "Home" },
  planning: { fr: "Planning", en: "Schedule" },
  matieres: { fr: "Matières", en: "Subjects" },
  biblio: { fr: "Biblio", en: "Library" },
  career: { fr: "Career", en: "Career" },
  profil: { fr: "Profil", en: "Profile" },
  bonjour: { fr: "Bonjour", en: "Hello" },
  tasks_today: { fr: "tâches aujourd'hui", en: "tasks today" },
  votre_progression: { fr: "Votre progression", en: "Your progress" },
  cours_en_cours: { fr: "Cours en cours", en: "Current courses" },
  votre_emploi_du_temps: { fr: "Votre emploi du temps", en: "Your schedule" },
  ask_insight: { fr: "Demander à Insight", en: "Ask Insight" },
  se_connecter: { fr: "Se connecter", en: "Login" },
  email: { fr: "Adresse Email", en: "Email Address" },
  password: { fr: "Mot de passe", en: "Password" },
  no_account: { fr: "Vous n'avez pas de compte ?", en: "Don't have an account?" },
  request_access: { fr: "Demander l'accès", en: "Request access" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
