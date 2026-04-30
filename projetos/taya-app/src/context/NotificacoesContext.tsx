import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { notificacoesMock, type Notificacao } from "@/data/notificacoes";

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  naoLidas: number;
  marcarTodasLidas: () => void;
}

const NotificacoesContext = createContext<NotificacoesContextType>({
  notificacoes: [],
  naoLidas: 0,
  marcarTodasLidas: () => {},
});

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notificacoesMock);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes((prev) => (prev.some((n) => !n.lida) ? prev.map((n) => ({ ...n, lida: true })) : prev));
  }, []);

  return <NotificacoesContext.Provider value={{ notificacoes, naoLidas, marcarTodasLidas }}>{children}</NotificacoesContext.Provider>;
}

export const useNotificacoes = () => useContext(NotificacoesContext);
