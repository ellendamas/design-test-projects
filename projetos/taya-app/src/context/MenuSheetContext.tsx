import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface MenuSheetContextType {
  aberto: boolean;
  abrirMenu: () => void;
  fecharMenu: () => void;
}

const MenuSheetContext = createContext<MenuSheetContextType>({
  aberto: false,
  abrirMenu: () => {},
  fecharMenu: () => {},
});

export function MenuSheetProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);

  const abrirMenu = useCallback(() => setAberto(true), []);
  const fecharMenu = useCallback(() => setAberto(false), []);

  return <MenuSheetContext.Provider value={{ aberto, abrirMenu, fecharMenu }}>{children}</MenuSheetContext.Provider>;
}

export const useMenuSheet = () => useContext(MenuSheetContext);
