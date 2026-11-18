import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { CardBadge, CartoesSubNav, ChartTooltip, DragScrollRow, SensitiveData } from "./shared";
import {
  MES_ATUAL,
  MES_LABEL,
  MESES_ORDENADOS,
  addMeses,
  getCartoesConectados,
  getParcelaAtual,
  parcelamentoAtivoNoMes,
  type MesChave,
} from "./vidaFinanceiraData";

const MESES_GRAFICO = MESES_ORDENADOS.slice(-6);

export default function VidaFinanceiraCartoesParcelasPage() {
  const { bancosConectados } = useOpenFinance();
  const cartoesConectados = getCartoesConectados(bancosConectados);
  const [cartaoId, setCartaoId] = useState<string | null>(null);
  const [mes, setMes] = useState<MesChave>(MES_ATUAL);

  const cartoesFiltrados = cartaoId ? cartoesConectados.filter((c) => c.id === cartaoId) : cartoesConectados;
  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  const totalParcelasNoMes = (m: MesChave) =>
    cartoesFiltrados.reduce(
      (sum, c) => sum + c.parcelamentos.filter((p) => parcelamentoAtivoNoMes(p, m)).reduce((s, p) => s + p.valorParcela, 0),
      0,
    );

  const dadosGrafico = MESES_GRAFICO.map((m) => ({ mes: m, label: MES_LABEL[m] ?? m, valor: totalParcelasNoMes(m) }));

  const parcelamentosDoMes = cartoesFiltrados.flatMap((c) =>
    c.parcelamentos.filter((p) => parcelamentoAtivoNoMes(p, mes)).map((p) => ({ parcelamento: p, cartao: c })),
  );

  return (
    <SubPageLayout title="Parcelas">
      <div className="space-y-4 pb-6">
        <CartoesSubNav />

        <DragScrollRow>
          <CardBadge cartao={null} selected={cartaoId === null} onClick={() => setCartaoId(null)} />
          {cartoesConectados.map((c) => {
            const banco = bancoPorId(c.bancoId);
            return (
              <CardBadge
                key={c.id}
                cartao={{ nome: c.nome, bancoCor: banco?.cor ?? "#6B7280", final: c.final }}
                selected={cartaoId === c.id}
                onClick={() => setCartaoId(c.id)}
              />
            );
          })}
        </DragScrollRow>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">Parcelado por mês</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip nameFor={() => "Parcelado"} />} cursor={{ fill: "#F3F4F6" }} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} onClick={(data) => setMes(data.mes)} cursor="pointer">
                  {dadosGrafico.map((entry) => (
                    <Cell key={entry.mes} fill={entry.mes === mes ? "#FD5F31" : "#FFD9C7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {parcelamentosDoMes.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma compra parcelada em {(MES_LABEL[mes] ?? mes).toLowerCase()}.
            </CardContent>
          </Card>
        ) : (
          parcelamentosDoMes.map(({ parcelamento: p, cartao }) => {
            const parcelaAtual = getParcelaAtual(p, mes);
            const valorPago = p.valorParcela * (parcelaAtual - 1);
            const valorTotal = p.valorParcela * p.totalParcelas;
            const pct = Math.round((valorPago / valorTotal) * 100);
            const dataUltimaParcela = addMeses(p.mesInicio, p.totalParcelas - 1);
            return (
              <Card key={p.id} className="border-border shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{p.descricao}</p>
                    <p className="text-xs text-muted-foreground">{cartao.nome}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-muted-foreground">
                      Parcela {parcelaAtual} de {p.totalParcelas} ·{" "}
                      <SensitiveData value={`R$ ${p.valorParcela.toLocaleString("pt-BR")}`} type="currency" />
                      /mês
                    </p>
                    <p className="text-muted-foreground">Última parcela: {dataUltimaParcela}</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F3F4F6]">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-muted-foreground">
                      Pago: <SensitiveData value={`R$ ${valorPago.toLocaleString("pt-BR")}`} type="currency" />
                    </p>
                    <p className="text-muted-foreground">
                      Falta: <SensitiveData value={`R$ ${(valorTotal - valorPago).toLocaleString("pt-BR")}`} type="currency" />
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </SubPageLayout>
  );
}
