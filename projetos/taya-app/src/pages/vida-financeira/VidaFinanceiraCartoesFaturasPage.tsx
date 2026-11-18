import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCurrency, CartoesSubNav, CATEGORIA_ICON_MAP, CardBadge, CardBadgeStatic, ChartTooltip, DragScrollRow, SensitiveData } from "./shared";
import { CATEGORIA_ICONE, MES_ATUAL, MES_LABEL, MESES_ORDENADOS, getCartoesConectados, getTransacoesCartao, type MesChave, type Transacao } from "./vidaFinanceiraData";

const MESES_GRAFICO = MESES_ORDENADOS.slice(-6);

function formatarCabecalhoDia(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const date = new Date(ano, mes - 1, dia);
  const diaSemana = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${dia} de ${date.toLocaleDateString("pt-BR", { month: "long" })} · ${diaSemana}`;
}

export default function VidaFinanceiraCartoesFaturasPage() {
  const { bancosConectados } = useOpenFinance();
  const cartoesConectados = getCartoesConectados(bancosConectados);
  const [cartaoId, setCartaoId] = useState<string | null>(null);
  const [mes, setMes] = useState<MesChave>(MES_ATUAL);

  const cartoesFiltrados = cartaoId ? cartoesConectados.filter((c) => c.id === cartaoId) : cartoesConectados;

  const dadosGrafico = MESES_GRAFICO.map((m) => ({
    mes: m,
    label: MES_LABEL[m] ?? m,
    valor: cartoesFiltrados.reduce((sum, c) => sum + (c.historicoMensal[m] ?? 0), 0),
  }));

  const totalFatura = cartoesFiltrados.reduce((sum, c) => sum + (c.historicoMensal[mes] ?? 0), 0);
  const cartoesComRotativo = cartoesFiltrados.filter((c) => c.rotativo);

  const transacoes = useMemo(
    () => cartoesFiltrados.flatMap((c) => getTransacoesCartao(c, mes).map((t) => ({ ...t, cartaoId: c.id }))),
    [cartoesFiltrados, mes],
  );

  const porDia = useMemo(() => {
    const mapa = new Map<string, (Transacao & { cartaoId: string })[]>();
    transacoes.forEach((t) => {
      const lista = mapa.get(t.data) ?? [];
      lista.push(t);
      mapa.set(t.data, lista);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transacoes]);

  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  return (
    <SubPageLayout title="Faturas">
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
            <p className="mb-2 text-sm text-muted-foreground">Fatura por mês</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip nameFor={() => "Fatura"} />} cursor={{ fill: "#F3F4F6" }} />
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
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">
              {cartaoId ? "Fatura" : "Fatura total"} · {MES_LABEL[mes] ?? mes}
            </p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCurrency value={totalFatura} />
            </p>
          </CardContent>
        </Card>

        {cartoesComRotativo.map((c) => {
          const banco = bancoPorId(c.bancoId);
          return (
            <Card key={c.id} className="border-0 bg-amber-50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ArrowsClockwise size={20} />
                  </div>
                  {banco && <CardBadgeStatic cartao={{ nome: c.nome, bancoCor: banco.cor, final: c.final }} />}
                </div>
                <p className="text-base font-semibold text-amber-900">
                  Você tem <SensitiveData value={`R$ ${c.rotativo!.emRotativo.toLocaleString("pt-BR")}`} type="currency" /> em rotativo no {c.nome}
                </p>
                <div className="flex items-center justify-between text-xs text-amber-800">
                  <p>
                    Pago este mês: <SensitiveData value={`R$ ${c.rotativo!.pagoEsteMes.toLocaleString("pt-BR")}`} type="currency" />
                  </p>
                  <p>
                    Há {c.rotativo!.mesesEmRotativo} {c.rotativo!.mesesEmRotativo === 1 ? "mês" : "meses"} no rotativo
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {porDia.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</CardContent>
          </Card>
        ) : (
          porDia.map(([data, itens]) => (
            <div key={data} className="space-y-2">
              <p className="px-1 text-xs font-medium capitalize text-muted-foreground">{formatarCabecalhoDia(data)}</p>
              <Card className="border-border shadow-sm">
                <CardContent className="p-0">
                  {itens.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                        {CATEGORIA_ICON_MAP[CATEGORIA_ICONE[t.categoriaId]] ?? CATEGORIA_ICON_MAP.Tag}
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{t.descricao}</p>
                      <p className="shrink-0 text-sm font-semibold text-foreground">
                        <SensitiveData value={`- R$ ${t.valor.toLocaleString("pt-BR")}`} type="currency" />
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </SubPageLayout>
  );
}
