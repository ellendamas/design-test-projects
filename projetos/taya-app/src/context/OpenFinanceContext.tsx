import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type BancoConectado = {
  id: string;
  nome: string;
  cor: string;
  conectadoEm: string;
  saldo: number;
};

type ResumoMes = {
  totalGasto: number;
  variacao: number;
  variacaoTipo: "reducao" | "aumento";
};

type OpenFinanceContextType = {
  bancosConectados: BancoConectado[];
  saldoTotal: number;
  resumoMes: ResumoMes | null;
  connectBankById: (bankId: string, nome?: string) => void;
  disconnectBankById: (bankId: string) => void;
};

// Cobre os mesmos bancos do catálogo de cartão/limite de conta (vidaFinanceiraData.ts): os
// que dá pra conectar pelo fluxo real de Open Finance (celcoinBrandsData.ts).
const bankMap: Record<string, { nome: string; cor: string }> = {
  nubank: { nome: "Nubank", cor: "#820AD1" },
  caixa: { nome: "Caixa Econômica", cor: "#005CA9" },
  bb: { nome: "Banco do Brasil", cor: "#F9BB00" },
  bradesco: { nome: "Bradesco", cor: "#CC092F" },
  itau: { nome: "Itaú", cor: "#EC7000" },
  santander: { nome: "Santander", cor: "#EC0000" },
  inter: { nome: "Inter", cor: "#FF7A00" },
  c6: { nome: "C6 Bank", cor: "#1A1A1A" },
  picpay: { nome: "PicPay", cor: "#21C25E" },
  "mercado-pago": { nome: "Mercado Pago", cor: "#009EE3" },
  btg: { nome: "BTG Pactual", cor: "#002B5C" },
  sicredi: { nome: "Sicredi", cor: "#6DB33F" },
  sicoob: { nome: "Sicoob", cor: "#00732E" },
  neon: { nome: "Neon", cor: "#00C896" },
};

// Saldo mockado por banco: sem isso, qualquer banco conectado fora dos 2 iniciais (Nubank,
// Itaú) entrava sempre com R$ 0. Bug sinalizado pela Ellen em 16/11/2026 ao testar conectar
// Bradesco e BB pra simular uma conta com vários bancos.
const SALDO_CATALOGO: Record<string, number> = {
  nubank: 1240.5,
  itau: 2180.0,
  bradesco: 980.0,
  bb: 1540.0,
  caixa: 670.0,
  santander: 1120.0,
  inter: 2340.0,
  c6: 890.0,
  picpay: 310.0,
  "mercado-pago": 450.0,
  btg: 3200.0,
  sicredi: 760.0,
  sicoob: 540.0,
  neon: 420.0,
};

const OpenFinanceContext = createContext<OpenFinanceContextType | null>(null);

export function OpenFinanceProvider({ children }: { children: ReactNode }) {
  const [bancosConectados, setBancosConectados] = useState<BancoConectado[]>([
    { id: "nubank", nome: "Nubank", cor: "#820AD1", conectadoEm: "2026-05-20", saldo: 1240.50 },
    { id: "itau", nome: "Itaú", cor: "#EC7000", conectadoEm: "2026-05-22", saldo: 2180.00 },
  ]);
  const saldoTotal = bancosConectados.reduce((sum, b) => sum + b.saldo, 0);
  const [resumoMes] = useState<ResumoMes | null>({ totalGasto: 3240, variacao: 230, variacaoTipo: "reducao" });

  // `nome` é opcional pra manter compatibilidade com quem já chamava isso só com o id (jornada
  // genérica antiga, com os 5 bancos fixos de bankMap). A lista de bancos da Celcoin não tem
  // essas 5 entradas fixas, então quem usa um banco fora do bankMap passa o nome junto.
  const connectBankById = (bankId: string, nome?: string) => {
    const bank = bankMap[bankId];
    if (!bank && !nome) return;
    setBancosConectados((prev) => {
      if (prev.some((item) => item.id === bankId)) return prev;
      const today = new Date().toISOString().slice(0, 10);
      const saldo = SALDO_CATALOGO[bankId] ?? 500;
      return [...prev, { id: bankId, nome: bank?.nome ?? nome!, cor: bank?.cor ?? "#6B7280", conectadoEm: today, saldo }];
    });
  };

  const disconnectBankById = (bankId: string) => {
    setBancosConectados((prev) => prev.filter((item) => item.id !== bankId));
  };

  const value = useMemo(
    () => ({ bancosConectados, saldoTotal, resumoMes, connectBankById, disconnectBankById }),
    [bancosConectados, resumoMes],
  );

  return <OpenFinanceContext.Provider value={value}>{children}</OpenFinanceContext.Provider>;
}

export function useOpenFinance() {
  const context = useContext(OpenFinanceContext);
  if (!context) throw new Error("useOpenFinance deve ser usado dentro de OpenFinanceProvider");
  return context;
}
