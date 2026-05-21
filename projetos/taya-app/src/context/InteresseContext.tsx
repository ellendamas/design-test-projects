import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type InteresseState = {
  assistencias: boolean;
  energia: boolean;
};

type ProdutoInteresse = keyof InteresseState;

type InteresseContextType = InteresseState & {
  registrarInteresse: (produto: ProdutoInteresse) => void;
};

const STORAGE_KEY = "seutudo_interesse";

const InteresseContext = createContext<InteresseContextType | null>(null);

function getInitialState(): InteresseState {
  if (typeof window === "undefined") {
    return { assistencias: false, energia: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { assistencias: false, energia: false };
    const parsed = JSON.parse(raw) as Partial<InteresseState>;
    return {
      assistencias: Boolean(parsed.assistencias),
      energia: Boolean(parsed.energia),
    };
  } catch {
    return { assistencias: false, energia: false };
  }
}

export function InteresseProvider({ children }: { children: ReactNode }) {
  const [interesses, setInteresses] = useState<InteresseState>(() => getInitialState());

  const registrarInteresse = (produto: ProdutoInteresse) => {
    setInteresses((prev) => {
      const next = { ...prev, [produto]: true };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      assistencias: interesses.assistencias,
      energia: interesses.energia,
      registrarInteresse,
    }),
    [interesses],
  );

  return <InteresseContext.Provider value={value}>{children}</InteresseContext.Provider>;
}

export function useInteresse() {
  const context = useContext(InteresseContext);
  if (!context) throw new Error("useInteresse deve ser usado dentro de InteresseProvider");
  return context;
}
