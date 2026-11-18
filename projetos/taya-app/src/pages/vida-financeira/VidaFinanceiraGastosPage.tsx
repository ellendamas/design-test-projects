import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCurrency, CATEGORIA_ICON_MAP, ChartTooltip, ComparativoTooltip, Segmented, SensitiveData } from "./shared";
import {
  PERIODO_LABEL,
  agruparPorCategoria,
  getGastosPorPeriodo,
  getSerieGastos,
  getSubcategorias,
  type CategoriaGasto,
  type Periodo,
} from "./vidaFinanceiraData";

function CategoriaAccordionItem({ cat }: { cat: CategoriaGasto }) {
  const subcategorias = getSubcategorias(cat);
  return (
    <AccordionItem value={cat.id} className="border-b border-border py-1 last:border-0">
      <AccordionTrigger className="py-2.5">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="text-primary">{CATEGORIA_ICON_MAP[cat.icone]}</span>
          <span className="flex-1 text-left text-sm font-medium text-foreground">{cat.nome}</span>
          <span className="text-xs text-muted-foreground">{cat.pct}%</span>
          <span className="text-sm font-semibold text-foreground">
            <SensitiveData value={`R$ ${cat.valor.toLocaleString("pt-BR")}`} type="currency" />
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 py-2 pl-7">
        {subcategorias.map((sub) => (
          <div key={sub.nome} className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">{sub.nome}</p>
            <p className="font-medium text-foreground">
              <SensitiveData value={`R$ ${sub.valor.toLocaleString("pt-BR")}`} type="currency" />
            </p>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function VidaFinanceiraGastosPage() {
  const { bancosConectados } = useOpenFinance();
  const [periodo, setPeriodo] = useState<Periodo>("1mes");
  const [agrupamento, setAgrupamento] = useState<"banco" | "categoria">("banco");

  const dados = getGastosPorPeriodo(periodo);
  const categoriasAgrupadas = agruparPorCategoria(dados.porBanco);
  const bancoNome = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId)?.nome ?? bancoId;
  const serie = getSerieGastos(periodo, dados.totalGasto);
  const temComparacao = periodo !== "semana";

  return (
    <SubPageLayout title="Gastos">
      <div className="space-y-4 pb-6">
        <Segmented
          options={(Object.keys(PERIODO_LABEL) as Periodo[]).map((p) => ({ value: p, label: PERIODO_LABEL[p] }))}
          value={periodo}
          onChange={setPeriodo}
        />

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Total gasto · {PERIODO_LABEL[periodo].toLowerCase()}</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCurrency value={dados.totalGasto} />
            </p>
            {temComparacao && (
              <p className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-0.5 w-3 bg-primary" /> Período selecionado
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-0.5 w-3 border-t border-dashed border-muted-foreground" /> Período anterior
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              {periodo === "semana" ? (
                <BarChart data={serie} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip content={<ChartTooltip nameFor={() => "Gasto"} />} cursor={{ fill: "#F3F4F6" }} />
                  <Bar dataKey="atual" fill="#FD5F31" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={serie} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    interval={periodo === "1mes" ? 4 : 0}
                  />
                  <Tooltip content={<ComparativoTooltip atualLabel="Período selecionado" anteriorLabel="Período anterior" />} />
                  <Line type="monotone" dataKey="anterior" stroke="#C4C4C4" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Período anterior" />
                  <Line type="monotone" dataKey="atual" stroke="#FD5F31" strokeWidth={2} dot={false} name="Período selecionado" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div>
          <p className="mb-2 px-1 text-sm font-medium text-foreground">Maiores gastos</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {dados.principais.map((gasto) => (
              <div key={gasto.id} className="w-[160px] shrink-0 rounded-xl border border-border bg-white p-3">
                <p className="truncate text-xs font-semibold text-foreground">{gasto.descricao}</p>
                <p className="text-[11px] text-muted-foreground">{bancoNome(gasto.bancoId)}</p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  <SensitiveData value={`R$ ${gasto.valor.toLocaleString("pt-BR")}`} type="currency" />
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {([{ key: "banco", label: "Por banco" }, { key: "categoria", label: "Por categoria" }] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAgrupamento(opt.key)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${agrupamento === opt.key ? "bg-primary-light text-primary" : "border border-border text-muted-foreground"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {agrupamento === "banco" ? (
          dados.porBanco.map((banco) => (
            <Card key={banco.bancoId} className="border-border shadow-sm">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{bancoNome(banco.bancoId)}</p>
                  <p className="text-sm font-semibold text-foreground">
                    <SensitiveData value={`R$ ${banco.totalGasto.toLocaleString("pt-BR")}`} type="currency" />
                  </p>
                </div>
                <Accordion type="single" collapsible>
                  {banco.categorias.map((cat) => (
                    <CategoriaAccordionItem key={cat.id} cat={cat} />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <Accordion type="single" collapsible>
                {categoriasAgrupadas.map((cat) => (
                  <CategoriaAccordionItem key={cat.id} cat={cat} />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </SubPageLayout>
  );
}
