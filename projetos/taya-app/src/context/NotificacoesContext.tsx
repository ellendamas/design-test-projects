import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { notificacoesMock, notificacaoLeilaoMock, type Notificacao } from "@/data/notificacoes";

// DESIGN ONLY — ?clt=leilao_aprovado no painel ativa a notificação mock do leilão.
// Provider fica fora do <BrowserRouter> (main.tsx), por isso lê a URL direto em vez de useSearchParams().
const cltLeilaoAprovado =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("clt") === "leilao_aprovado";

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
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(
    cltLeilaoAprovado ? [notificacaoLeilaoMock, ...notificacoesMock] : notificacoesMock
  );

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes((prev) => (prev.some((n) => !n.lida) ? prev.map((n) => ({ ...n, lida: true })) : prev));
  }, []);

  return <NotificacoesContext.Provider value={{ notificacoes, naoLidas, marcarTodasLidas }}>{children}</NotificacoesContext.Provider>;
}

export const useNotificacoes = () => useContext(NotificacoesContext);
