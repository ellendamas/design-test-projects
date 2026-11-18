import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowsClockwise, CreditCard, Money, Warning } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCurrency, BankAvatar, ChartTooltip, SensitiveData } from "./shared";
import {
  MES_ATUAL,
  getAssinaturasDoMes,
  getAssinaturasEmRisco,
  getGastoAcumuladoAssinatura,
  getSerieAssinaturas,
  type MesChave,
} from "./vidaFinanceiraData";

export default function VidaFinanceiraAssinaturasPage() {
  const { bancosConectados } = useOpenFinance();
  const [mes, setMes] = useState<MesChave>(MES_ATUAL);

  const serie = getSerieAssinaturas();
  const assinaturas = getAssinaturasDoMes(mes);
  const total = assinaturas.reduce((sum, a) => sum + a.valor, 0);

  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  const maisCara = [...assinaturas].sort((a, b) => b.valor - a.valor)[0];
  const maiorAcumulada = [...assinaturas].sort((a, b) => getGastoAcumuladoAssinatura(b, mes) - getGastoAcumuladoAssinatura(a, mes))[0];
  const emRisco = getAssinaturasEmRisco(bancosConectados).filter((a) => assinaturas.some((v) => v.id === a.id));

  return (
    <SubPageLayout title="Assinaturas">
      <div className="space-y-4 pb-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">Gasto com assinaturas por mês</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={serie} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip nameFor={() => "Assinaturas"} />} cursor={{ fill: "#F3F4F6" }} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} onClick={(data) => setMes(data.mes)} cursor="pointer">
                  {serie.map((entry) => (
                    <Cell key={entry.mes} fill={entry.mes === mes ? "#FD5F31" : "#FFD9C7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Total em assinaturas</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCurrency value={total} />
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          {maisCara && (
            <div className="rounded-xl border border-border bg-white p-3">
              <Money size={16} className="text-primary" />
              <p className="mt-1 text-[11px] text-muted-foreground">Mais cara</p>
              <p className="truncate text-sm font-semibold text-foreground">{maisCara.nome}</p>
              <p className="text-xs text-muted-foreground">
                <SensitiveData value={`R$ ${maisCara.valor.toLocaleString("pt-BR")}`} type="currency" />
              </p>
            </div>
          )}
          {maiorAcumulada && (
            <div className="rounded-xl border border-border bg-white p-3">
              <CreditCard size={16} className="text-primary" />
              <p className="mt-1 text-[11px] text-muted-foreground">Mais gasta no período</p>
              <p className="truncate text-sm font-semibold text-foreground">{maiorAcumulada.nome}</p>
              <p className="text-xs text-muted-foreground">
                <SensitiveData value={`R$ ${getGastoAcumuladoAssinatura(maiorAcumulada, mes).toLocaleString("pt-BR")}`} type="currency" /> acumulado
              </p>
            </div>
          )}
        </div>

        {emRisco.length > 0 && (
          <Card className="border-0 bg-amber-50">
            <CardContent className="flex items-start gap-2 p-4">
              <Warning size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">
                {emRisco.map((a) => a.nome).join(", ")} {emRisco.length === 1 ? "está sendo paga" : "estão sendo pagas"} enquanto{" "}
                {emRisco.length === 1 ? "essa conta" : "essas contas"} {emRisco.length === 1 ? "está" : "estão"} no rotativo ou no cheque especial.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-border shadow-sm">
          <CardContent className="p-0">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-foreground">Assinaturas em {mes === MES_ATUAL ? "aberto" : "ativas nesse mês"}</p>
            </div>
            {assinaturas.map((a) => {
              const banco = bancoPorId(a.bancoId);
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
                  {banco && <BankAvatar banco={banco} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{a.nome}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      {banco?.nome} ·{" "}
                      {a.formaPagamento === "cartao" ? (
                        <>
                          <CreditCard size={12} /> Cartão de crédito
                        </>
                      ) : (
                        "Débito"
                      )}
                      {emRisco.some((r) => r.id === a.id) && <ArrowsClockwise size={12} className="text-amber-600" />}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-foreground">
                    <SensitiveData value={`R$ ${a.valor.toLocaleString("pt-BR")}`} type="currency" />
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
}
