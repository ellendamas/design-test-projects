import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type InteresseContextType = {
  interesses: string[];
  registrarInteresse: (produto: string) => void;
};

const InteresseContext = createContext<InteresseContextType | null>(null);

function getInteresses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("seutudo_interesses");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInteresses(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("seutudo_interesses", JSON.stringify(ids));
}

export function InteresseProvider({ children }: { children: ReactNode }) {
  const [interesses, setInteresses] = useState<string[]>(getInteresses);

  const registrarInteresse = useCallback((produto: string) => {
    setInteresses((prev) => {
      if (prev.includes(produto)) return prev;
      const next = [...prev, produto];
      saveInteresses(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ interesses, registrarInteresse }), [interesses, registrarInteresse]);

  return <InteresseContext.Provider value={value}>{children}</InteresseContext.Provider>;
}

export function useInteresse() {
  const ctx = useContext(InteresseContext);
  if (!ctx) throw new Error("useInteresse must be used within InteresseProvider");
  return ctx;
}
