import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type OndaTipo = "onda1" | "onda2" | "onda3" | null;

type BancoConectado = {
  id: string;
  nome: string;
  cor: string;
  conectadoEm: string;
};

type Insight = {
  id: string;
  onda: "onda1" | "onda2" | "onda3";
  icone: string;
  titulo: string;
  descricao: string;
  valor: number | null;
  cta: string;
  destino: string;
};

type ResumoMes = {
  totalGasto: number;
  variacao: number;
  variacaoTipo: "reducao" | "aumento";
};

type OpenFinanceContextType = {
  bancosConectados: BancoConectado[];
  insights: Insight[];
  resumoMes: ResumoMes | null;
  ondaAtiva: OndaTipo;
  dismissedInsightIds: string[];
  connectBankById: (bankId: string) => void;
  disconnectBankById: (bankId: string) => void;
  dismissInsight: (insightId: string) => void;
};

const bankMap: Record<string, { nome: string; cor: string }> = {
  nubank: { nome: "Nubank", cor: "#820AD1" },
  caixa: { nome: "Caixa Econômica", cor: "#005CA9" },
  bb: { nome: "Banco do Brasil", cor: "#F9BB00" },
  bradesco: { nome: "Bradesco", cor: "#CC092F" },
  itau: { nome: "Itaú", cor: "#EC7000" },
};

const initialInsights: Insight[] = [
  {
    id: "ins1",
    onda: "onda1",
    icone: "DeviceMobile",
    titulo: "3 streamings ativos",
    descricao: "Netflix, Spotify e Amazon Prime custam R$ 87/mês. Cancelar 2 coloca R$ 497 no seu bolso esse ano.",
    valor: 497,
    cta: "Ver detalhes",
    destino: "/vida-financeira",
  },
  {
    id: "ins2",
    onda: "onda1",
    icone: "Warning",
    titulo: "Tarifa contestável detectada",
    descricao: "Identificamos uma tarifa de manutenção de R$ 29,90 que pode ser contestada.",
    valor: 29.9,
    cta: "Entender como",
    destino: "/vida-financeira",
  },
  {
    id: "ins3",
    onda: "onda2",
    icone: "ForkKnife",
    titulo: "Delivery acima do padrão",
    descricao: "Você gastou R$ 120 com delivery essa semana, 40% a mais que o seu padrão.",
    valor: null,
    cta: "Ver gastos",
    destino: "/vida-financeira",
  },
];

const OpenFinanceContext = createContext<OpenFinanceContextType | null>(null);

export function OpenFinanceProvider({ children }: { children: ReactNode }) {
  const [bancosConectados, setBancosConectados] = useState<BancoConectado[]>([
    { id: "nubank", nome: "Nubank", cor: "#820AD1", conectadoEm: "2026-05-20" },
  ]);
  const [insights] = useState<Insight[]>(initialInsights);
  const [resumoMes] = useState<ResumoMes | null>({ totalGasto: 3240, variacao: 230, variacaoTipo: "reducao" });
  const [ondaAtiva] = useState<OndaTipo>("onda1");
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([]);

  const connectBankById = (bankId: string) => {
    const bank = bankMap[bankId];
    if (!bank) return;
    setBancosConectados((prev) => {
      if (prev.some((item) => item.id === bankId)) return prev;
      const today = new Date().toISOString().slice(0, 10);
      return [...prev, { id: bankId, nome: bank.nome, cor: bank.cor, conectadoEm: today }];
    });
  };

  const disconnectBankById = (bankId: string) => {
    setBancosConectados((prev) => prev.filter((item) => item.id !== bankId));
  };

  const dismissInsight = (insightId: string) => {
    setDismissedInsightIds((prev) => (prev.includes(insightId) ? prev : [...prev, insightId]));
  };

  const value = useMemo(
    () => ({ bancosConectados, insights, resumoMes, ondaAtiva, dismissedInsightIds, connectBankById, disconnectBankById, dismissInsight }),
    [bancosConectados, insights, resumoMes, ondaAtiva, dismissedInsightIds],
  );

  return <OpenFinanceContext.Provider value={value}>{children}</OpenFinanceContext.Provider>;
}

export function useOpenFinance() {
  const context = useContext(OpenFinanceContext);
  if (!context) throw new Error("useOpenFinance deve ser usado dentro de OpenFinanceProvider");
  return context;
}
