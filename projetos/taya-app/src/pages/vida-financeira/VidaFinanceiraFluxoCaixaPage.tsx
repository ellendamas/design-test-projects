import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCurrency, BankAvatar, CATEGORIA_ICON_MAP, ChartTooltip, Segmented, SensitiveData } from "./shared";
import { CATEGORIA_ICONE, MES_ATUAL, MES_LABEL, MESES_ORDENADOS, fluxoCaixaPorMes, getTransacoesDoMes, type MesChave } from "./vidaFinanceiraData";

type Faixa = "mes" | "3meses" | "6meses" | "1ano";

const FAIXA_LABEL: Record<Faixa, string> = {
  mes: "Este mês",
  "3meses": "Últimos 3 meses",
  "6meses": "Últimos 6 meses",
  "1ano": "1 ano",
};

const FAIXA_QTD: Record<Faixa, number> = {
  mes: 1,
  "3meses": 3,
  "6meses": 6,
  "1ano": MESES_ORDENADOS.length,
};

export default function VidaFinanceiraFluxoCaixaPage() {
  const navigate = useNavigate();
  const { bancosConectados } = useOpenFinance();
  const [faixa, setFaixa] = useState<Faixa>("mes");

  const meses = MESES_ORDENADOS.slice(-FAIXA_QTD[faixa]);
  const dadosGrafico = meses.map((m) => ({ mes: MES_LABEL[m] ?? m, Entradas: fluxoCaixaPorMes[m].entradas, Saídas: fluxoCaixaPorMes[m].saidas }));

  const liquidoPeriodo = meses.reduce((sum, m) => sum + (fluxoCaixaPorMes[m].entradas - fluxoCaixaPorMes[m].saidas), 0);

  const ultimosLancamentos = useMemo(() => getTransacoesDoMes(MES_ATUAL).slice(0, 5), []);
  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  return (
    <SubPageLayout title="Fluxo de caixa">
      <div className="space-y-4 pb-6">
        <Segmented
          options={(Object.keys(FAIXA_LABEL) as Faixa[]).map((f) => ({ value: f, label: FAIXA_LABEL[f] }))}
          value={faixa}
          onChange={setFaixa}
        />

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Saldo líquido · {FAIXA_LABEL[faixa].toLowerCase()}</p>
            <p className="text-2xl font-bold">
              <AnimatedCurrency value={liquidoPeriodo} prefix={liquidoPeriodo >= 0 ? "+" : ""} className={liquidoPeriodo >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"} />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Entradas" fill="#16A34A" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Saídas" fill="#DC2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div>
          <p className="mb-2 px-1 text-sm font-medium text-foreground">Últimos lançamentos</p>
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              {ultimosLancamentos.map((t) => {
                const banco = bancoPorId(t.bancoId);
                return (
                  <div key={t.id} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                      {CATEGORIA_ICON_MAP[CATEGORIA_ICONE[t.categoriaId]] ?? CATEGORIA_ICON_MAP.Tag}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{t.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(`${t.data}T00:00:00`).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {banco && <BankAvatar banco={banco} size={24} />}
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      <SensitiveData value={`- R$ ${t.valor.toLocaleString("pt-BR")}`} type="currency" />
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" className="h-11 w-full rounded-xl border-border" onClick={() => navigate("/vida-financeira/transacoes")}>
          Ver todos os lançamentos
        </Button>
      </div>
    </SubPageLayout>
  );
}
