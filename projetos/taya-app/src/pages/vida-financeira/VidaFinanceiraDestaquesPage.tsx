import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowsClockwise, Bank, CaretRight, CreditCard, Gauge, Receipt, TrendUp } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { CATEGORIA_ICON_MAP, Segmented, SensitiveData } from "./shared";
import { getDestaques, GRUPO_DESTAQUE_LABEL, type GrupoDestaque } from "./vidaFinanceiraData";

const ICON_MAP = {
  ...CATEGORIA_ICON_MAP,
  Receipt: <Receipt size={18} />,
  Bank: <Bank size={18} />,
  CreditCard: <CreditCard size={18} />,
  ArrowsClockwise: <ArrowsClockwise size={18} />,
  Gauge: <Gauge size={18} />,
  TrendUp: <TrendUp size={18} />,
};

// "Destaques", não "Insights": nosso ICP é classe C/D/E, então o nome da tela é em português
// corrente, sem anglicismo. Pedido da Ellen em 13/11/2026.
export default function VidaFinanceiraDestaquesPage() {
  const navigate = useNavigate();
  const { bancosConectados } = useOpenFinance();
  const todosDestaques = getDestaques(bancosConectados);
  const [grupo, setGrupo] = useState<GrupoDestaque | "todos">("todos");

  const destaques = grupo === "todos" ? todosDestaques : todosDestaques.filter((d) => d.grupo === grupo);

  const grupoOptions: { value: GrupoDestaque | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    ...(Object.keys(GRUPO_DESTAQUE_LABEL) as GrupoDestaque[]).map((g) => ({ value: g, label: GRUPO_DESTAQUE_LABEL[g] })),
  ];

  return (
    <SubPageLayout title="Destaques">
      <div className="space-y-4 pb-6">
        <Segmented options={grupoOptions} value={grupo} onChange={setGrupo} />

        {destaques.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">Nenhum destaque nesse grupo.</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {destaques.map((d) => (
              <button key={d.id} type="button" onClick={() => navigate(d.destino)} className="block w-full text-left">
                <Card className="border-border shadow-sm">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                        {ICON_MAP[d.icone as keyof typeof ICON_MAP] ?? <Receipt size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{d.titulo}</p>
                        <p className="truncate text-sm font-semibold text-foreground">{d.subtitulo}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {d.tipoValor === "currency" ? (
                          <SensitiveData value={`R$ ${d.valor.toLocaleString("pt-BR")}`} type="currency" />
                        ) : (
                          `${d.valor}%`
                        )}
                      </p>
                      <CaretRight size={16} className="text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
}
