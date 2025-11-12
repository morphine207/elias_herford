import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";

type Language = "de" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "de";
  }
  const stored = window.localStorage.getItem("language-preference");
  if (stored === "de" || stored === "en") {
    return stored;
  }
  return "de";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("language-preference", language);
  }, [language]);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export type { Language };
