import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Transacao = {
  id: number;
  tipo: "ganho" | "gasto";
  descricao: string;
  valor: number;
  data: string;
};

type SeubolsoContextType = {
  saldo: number;
  streak: number;
  extrato: Transacao[];
  adicionarPontos: (valor: number, descricao: string) => void;
  gastarPontos: (valor: number, descricao: string) => void;
};

const extratoInicial: Transacao[] = [
  { id: 1, tipo: "ganho", descricao: "Cadastro completo", valor: 500, data: "2026-04-01" },
  { id: 2, tipo: "ganho", descricao: "Streak 7 dias", valor: 100, data: "2026-04-08" },
  { id: 3, tipo: "ganho", descricao: "Saque Fácil contratado", valor: 300, data: "2026-04-10" },
  { id: 4, tipo: "ganho", descricao: "Login diário", valor: 10, data: "2026-05-14" },
  { id: 5, tipo: "ganho", descricao: "Parcela paga em dia", valor: 50, data: "2026-05-15" },
  { id: 6, tipo: "gasto", descricao: "Desconto no Saque Fácil", valor: -210, data: "2026-05-01" },
];

const SeubolsoContext = createContext<SeubolsoContextType | null>(null);

export function SeubolsoProvider({ children }: { children: ReactNode }) {
  const [saldo, setSaldo] = useState(1250);
  const [streak] = useState(7);
  const [extrato, setExtrato] = useState<Transacao[]>(extratoInicial);

  const adicionarPontos = (valor: number, descricao: string) => {
    setSaldo((prev) => prev + valor);
    setExtrato((prev) => [
      {
        id: Date.now(),
        tipo: "ganho",
        descricao,
        valor,
        data: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const gastarPontos = (valor: number, descricao: string) => {
    const valorNegativo = -Math.abs(valor);
    setSaldo((prev) => prev + valorNegativo);
    setExtrato((prev) => [
      {
        id: Date.now(),
        tipo: "gasto",
        descricao,
        valor: valorNegativo,
        data: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const value = useMemo(
    () => ({ saldo, streak, extrato, adicionarPontos, gastarPontos }),
    [saldo, streak, extrato],
  );

  return <SeubolsoContext.Provider value={value}>{children}</SeubolsoContext.Provider>;
}

export function useSeubolso() {
  const context = useContext(SeubolsoContext);
  if (!context) throw new Error("useSeubolso deve ser usado dentro de SeubolsoProvider");
  return context;
}
