import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useInteresse } from "@/context/InteresseContext";
import { useSeubolso } from "@/context/SeubolsoContext";

type GrupoCard = "P" | "O" | "G";

export type IconeRecomendacao =
  | "CalendarCheck"
  | "MapPin"
  | "Bank"
  | "CreditCard"
  | "Coins"
  | "Heartbeat"
  | "Lightning"
  | "Wallet"
  | "Fire";

export type RecomendacaoCard = {
  id: string;
  grupo: GrupoCard;
  prioridade: number;
  icone: IconeRecomendacao;
  texto: string;
  cta: string | null;
  destino: string;
  dispensavel: boolean;
  reexibirApos?: number;
  persistirDispensa?: boolean;
};

type DispensadoPersistido = {
  id: string;
  dispensadoEm: string;
};

type RecomendacoesContextType = {
  cards: RecomendacaoCard[];
  dispensados: DispensadoPersistido[];
  dispensar: (id: string) => void;
};

const STORAGE_KEY = "podeja_cards_dispensados";

const RecomendacoesContext = createContext<RecomendacoesContextType | null>(null);

function getDispensadosStorage(): DispensadoPersistido[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DispensadoPersistido[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.dispensadoEm);
  } catch {
    return [];
  }
}

export function RecomendacoesProvider({ children }: { children: ReactNode }) {
  const { assistencias, energia } = useInteresse();
  const { streak, saldo } = useSeubolso();

  // DESIGN ONLY — ?recomendacoes=vazio força zero cards, para visualizar o painel sem "Para você agora"
  // Provider fica fora do <BrowserRouter> (main.tsx), por isso lê a URL direto em vez de useSearchParams()
  // TODO: remover quando P2/P4 estiverem ligados a uma condição real (endereço/conta cadastrados)
  const forcarRecomendacoesVazias =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("recomendacoes") === "vazio";

  const [dispensados, setDispensados] = useState<DispensadoPersistido[]>(() => getDispensadosStorage());
  const [dispensadosSessao, setDispensadosSessao] = useState<string[]>([]);

  const cardsBase = useMemo<RecomendacaoCard[]>(
    () => [
      {
        id: "P2",
        grupo: "P",
        prioridade: 2,
        icone: "MapPin",
        texto: "Seu endereço ainda não está cadastrado.",
        cta: "Completar",
        destino: "/minha-conta/editar-endereco",
        dispensavel: false,
      },
      {
        id: "P4",
        grupo: "P",
        prioridade: 3,
        icone: "Bank",
        texto: "Adicione sua conta bancária para receber crédito.",
        cta: "Adicionar",
        destino: "/minha-conta/dados-bancarios",
        dispensavel: false,
      },
      {
        id: "O1",
        grupo: "O",
        prioridade: 5,
        icone: "Coins",
        texto: "Você tem FGTS disponível para antecipar?",
        cta: "Simular",
        destino: "/fgts",
        dispensavel: true,
        reexibirApos: 30,
      },
      {
        id: "O2",
        grupo: "O",
        prioridade: 6,
        icone: "Heartbeat",
        texto: "Saúde, odonto e pet com desconto. Conheça as assistências.",
        cta: "Conhecer",
        destino: "/assistencias",
        dispensavel: true,
      },
      {
        id: "O3",
        grupo: "O",
        prioridade: 7,
        icone: "Lightning",
        texto: "Reduza até 20% na sua conta de luz. Sem obras.",
        cta: "Simular",
        destino: "/energia",
        dispensavel: true,
      },
      {
        id: "O4",
        grupo: "O",
        prioridade: 8,
        icone: "Wallet",
        texto: "Crédito Consignado CLT disponível. Parcelas fixas no seu salário.",
        cta: "Consultar",
        destino: "/painel",
        dispensavel: true,
        reexibirApos: 30,
      },
      {
        id: "G1",
        grupo: "G",
        prioridade: 9,
        icone: "Fire",
        texto: `Sua sequência de ${streak} dias está em risco. Abra o app amanhã!`,
        cta: null,
        destino: "/seubolso",
        dispensavel: true,
        persistirDispensa: false,
      },
      {
        id: "G2",
        grupo: "G",
        prioridade: 10,
        icone: "Coins",
        texto: `Você tem ${saldo.toLocaleString("pt-BR")} moedas acumuladas. Veja o que pode resgatar.`,
        cta: "Ver",
        destino: "/seubolso",
        dispensavel: true,
        persistirDispensa: false,
      },
    ],
    [saldo, streak],
  );

  const cards = useMemo(() => {
    if (forcarRecomendacoesVazias) return []; // DESIGN ONLY

    const now = Date.now();

    const isDispensadoPersistido = (card: RecomendacaoCard) => {
      const hit = dispensados.find((item) => item.id === card.id);
      if (!hit) return false;

      if ((card.id === "O1" || card.id === "O4") && card.reexibirApos) {
        const prazoMs = card.reexibirApos * 24 * 60 * 60 * 1000;
        const dispensadoEm = new Date(hit.dispensadoEm).getTime();
        if (Number.isNaN(dispensadoEm)) return true;
        return now - dispensadoEm < prazoMs;
      }

      return true;
    };

    let ativos = cardsBase.filter((card) => !isDispensadoPersistido(card));

    ativos = ativos.filter((card) => {
      if (card.id === "O2" && assistencias) return false;
      if (card.id === "O3" && energia) return false;
      if (card.id === "G1" && streak === 0) return false;
      if (card.id === "G2" && saldo < 500) return false;
      if (dispensadosSessao.includes(card.id)) return false;
      return true;
    });

    const hasPendenciaOuOportunidade = ativos.some((card) => card.grupo === "P" || card.grupo === "O");
    if (hasPendenciaOuOportunidade) {
      ativos = ativos.filter((card) => card.grupo !== "G");
    }

    return ativos.sort((a, b) => a.prioridade - b.prioridade);
  }, [assistencias, cardsBase, dispensados, dispensadosSessao, energia, saldo, streak, forcarRecomendacoesVazias]);

  const dispensar = (id: string) => {
    const card = cardsBase.find((item) => item.id === id);
    if (!card || !card.dispensavel) return;

    if (card.persistirDispensa === false || card.grupo === "G") {
      setDispensadosSessao((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return;
    }

    setDispensados((prev) => {
      const next = prev.filter((item) => item.id !== id);
      next.push({ id, dispensadoEm: new Date().toISOString() });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dispensados));
  }, [dispensados]);

  const value = useMemo(
    () => ({ cards, dispensados, dispensar }),
    [cards, dispensados],
  );

  return <RecomendacoesContext.Provider value={value}>{children}</RecomendacoesContext.Provider>;
}

export function useRecomendacoes() {
  const context = useContext(RecomendacoesContext);
  if (!context) throw new Error("useRecomendacoes deve ser usado dentro de RecomendacoesProvider");
  return context;
}
