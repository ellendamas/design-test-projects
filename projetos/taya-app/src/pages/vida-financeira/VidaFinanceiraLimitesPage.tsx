import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCurrency, ChartTooltip, InfoTooltip, Segmented, SensitiveData } from "./shared";
import { getLimitePorBanco, MES_ATUAL, MES_LABEL, MESES_ORDENADOS, type MesChave } from "./vidaFinanceiraData";

const MESES_GRAFICO = MESES_ORDENADOS.slice(-6);

export default function VidaFinanceiraLimitesPage() {
  const { bancosConectados } = useOpenFinance();
  const [bancoFiltro, setBancoFiltro] = useState<string>("todos");
  const [mes, setMes] = useState<MesChave>(MES_ATUAL);

  const bancoNome = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId)?.nome ?? bancoId;
  const limitePorBanco = getLimitePorBanco(bancosConectados);
  const contasFiltradas = bancoFiltro === "todos" ? limitePorBanco : limitePorBanco.filter((b) => b.bancoId === bancoFiltro);

  const usadoNoMes = (m: MesChave) => contasFiltradas.reduce((sum, b) => sum + (b.historico[m] ?? 0), 0);
  const limiteTotal = contasFiltradas.reduce((sum, b) => sum + b.limiteTotal, 0);

  const dadosGrafico = MESES_GRAFICO.map((m) => ({ mes: m, label: MES_LABEL[m] ?? m, valor: usadoNoMes(m) }));

  const usado = usadoNoMes(mes);
  const pct = limiteTotal > 0 ? Math.round((usado / limiteTotal) * 100) : 0;
  const disponivel = limiteTotal - usado;

  const bancoOptions = [
    { value: "todos", label: "Todos" },
    ...bancosConectados.filter((b) => limitePorBanco.some((l) => l.bancoId === b.id)).map((b) => ({ value: b.id, label: b.nome })),
  ];

  return (
    <SubPageLayout title="Limite da conta">
      <div className="space-y-4 pb-6">
        <div className="flex items-center gap-1 px-1">
          <p className="text-xs text-muted-foreground">Limite da conta</p>
          <InfoTooltip texto="Isso é referente ao cheque especial da sua conta." />
        </div>

        <Segmented options={bancoOptions} value={bancoFiltro} onChange={setBancoFiltro} />

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">Usado por mês</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip nameFor={() => "Usado"} />} cursor={{ fill: "#F3F4F6" }} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} onClick={(data) => setMes(data.mes)} cursor="pointer">
                  {dadosGrafico.map((entry) => (
                    <Cell key={entry.mes} fill={entry.mes === mes ? "#FD5F31" : "#FFD9C7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">
              {bancoFiltro === "todos" ? "Todas as contas" : bancoNome(bancoFiltro)} · {MES_LABEL[mes] ?? mes}
            </p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCurrency value={usado} prefix="-" className={usado > 0 ? "text-[#DC2626]" : ""} />
            </p>
            <p className="text-xs text-muted-foreground">{pct}% do limite</p>
            <div className="h-1.5 rounded-full bg-[#F3F4F6]">
              <div className={`h-full rounded-full ${pct >= 70 ? "bg-[#DC2626]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <p className="text-muted-foreground">
                Usado: <SensitiveData value={`R$ ${usado.toLocaleString("pt-BR")}`} type="currency" />
              </p>
              <p className="text-muted-foreground">
                Disponível: <SensitiveData value={`R$ ${disponivel.toLocaleString("pt-BR")}`} type="currency" />
              </p>
            </div>
          </CardContent>
        </Card>

        {bancoFiltro === "todos" && (
          <Card className="border-border shadow-sm">
            <CardContent className="space-y-4 p-4">
              {limitePorBanco.map((banco) => {
                const bancoUsado = banco.historico[mes] ?? 0;
                const bancoPct = banco.limiteTotal > 0 ? Math.round((bancoUsado / banco.limiteTotal) * 100) : 0;
                return (
                  <div key={banco.bancoId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-foreground">{bancoNome(banco.bancoId)}</p>
                      <p className="font-semibold text-foreground">
                        <SensitiveData value={`R$ ${bancoUsado.toLocaleString("pt-BR")}`} type="currency" /> de{" "}
                        <SensitiveData value={`R$ ${banco.limiteTotal.toLocaleString("pt-BR")}`} type="currency" />
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F3F4F6]">
                      <div className={`h-full rounded-full ${bancoPct >= 70 ? "bg-[#DC2626]" : "bg-primary"}`} style={{ width: `${bancoPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </SubPageLayout>
  );
}
