import { useNavigate } from "react-router-dom";
import { Bank, ClockCounterClockwise, House, UserCircle } from "@phosphor-icons/react";

// `path: null` — Carteira/Conta não têm tela construída nesse benchmark; ficam visíveis com
// aparência desabilitada em vez de navegar pra um 404. Não existe item "Pontos" aqui de
// propósito (ver briefing original: nav enxuta de 4 itens) — B3 (Pontos conversacional) é
// alcançado só pelo índice /benchmark nesse mock, não pela nav bar, já que na ideia de
// produto a gamificação aparece por contexto dentro da conversa, não como aba fixa.
//
// "Conversar" virou "Histórico": a conversa ao vivo se mudou pra B1 (dashboard), então essa
// aba agora abre a lista de conversas passadas (B2) — manter o rótulo antigo ia confundir
// quem esperasse um chat ativo aqui.
const ITEMS = [
  { label: "Início", icon: House, path: "/benchmark/b/dashboard" },
  { label: "Histórico", icon: ClockCounterClockwise, path: "/benchmark/b/servicos" },
  { label: "Carteira", icon: Bank, path: null },
  { label: "Conta", icon: UserCircle, path: null },
];

// Nav bar enxuta do Grupo B — 4 itens.
export function BottomNavB({ ativo }: { ativo: string }) {
  const navigate = useNavigate();

  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-border bg-white px-1 py-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isAtivo = item.label === ativo;
        const desabilitado = item.path === null;
        return (
          <button
            key={item.label}
            type="button"
            disabled={desabilitado}
            onClick={() => item.path && navigate(item.path)}
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${
              desabilitado ? "text-muted-foreground/40" : isAtivo ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={20} weight={isAtivo ? "fill" : "regular"} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
