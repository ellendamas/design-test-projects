import { useLocation } from "react-router-dom";

// DESIGN ONLY: estas telas são usadas em dois contextos com os MESMOS componentes, sem
// duplicar arquivo. São eles o protótipo de comparação solto (/prototipos/...) e a jornada
// real de cadastro (/cadastro/open-finance/...). Esse hook resolve, a partir da rota atual,
// qual prefixo usar nos navigate() internos e se o fluxo deve gravar no OpenFinanceContext
// de verdade.
export function useOpenFinanceApiBase() {
  const { pathname } = useLocation();
  const isReal = pathname.startsWith("/cadastro/open-finance");
  const base = isReal ? "/cadastro/open-finance" : "/prototipos/open-finance-klavi/api-only";
  return { base, isReal };
}
