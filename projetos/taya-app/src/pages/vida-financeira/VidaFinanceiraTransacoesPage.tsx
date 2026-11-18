import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { BankAvatar, CATEGORIA_ICON_MAP, ChartTooltip, Segmented, SensitiveData } from "./shared";
import { CATEGORIA_ICONE, MES_ATUAL, MES_LABEL, MESES_ORDENADOS, TIPO_LABEL, getTransacoesDoMes, totalGastoPorMes, type MesChave } from "./vidaFinanceiraData";

const MESES_GRAFICO = MESES_ORDENADOS.slice(-6);

function formatarCabecalhoDia(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const date = new Date(ano, mes - 1, dia);
  const diaSemana = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${dia} de ${date.toLocaleDateString("pt-BR", { month: "long" })} · ${diaSemana}`;
}

export default function VidaFinanceiraTransacoesPage() {
  const { bancosConectados } = useOpenFinance();
  const [mes, setMes] = useState<MesChave>(MES_ATUAL);
  const [bancoFiltro, setBancoFiltro] = useState<string>("todos");

  const dadosGrafico = MESES_GRAFICO.map((m) => ({ mes: m, label: MES_LABEL[m] ?? m, valor: totalGastoPorMes[m] ?? 0 }));

  const transacoes = useMemo(() => getTransacoesDoMes(mes), [mes]);
  const transacoesFiltradas = bancoFiltro === "todos" ? transacoes : transacoes.filter((t) => t.bancoId === bancoFiltro);

  const porDia = useMemo(() => {
    const mapa = new Map<string, typeof transacoesFiltradas>();
    transacoesFiltradas.forEach((t) => {
      const lista = mapa.get(t.data) ?? [];
      lista.push(t);
      mapa.set(t.data, lista);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transacoesFiltradas]);

  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  const bancoOptions = [
    { value: "todos", label: "Todos" },
    ...bancosConectados.map((b) => ({ value: b.id, label: b.nome })),
  ];

  return (
    <SubPageLayout title="Atividades">
      <div className="space-y-4 pb-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">Gasto por mês</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip nameFor={() => "Gasto"} />} cursor={{ fill: "#F3F4F6" }} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} onClick={(data) => setMes(data.mes)} cursor="pointer">
                  {dadosGrafico.map((entry) => (
                    <Cell key={entry.mes} fill={entry.mes === mes ? "#FD5F31" : "#FFD9C7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Segmented options={bancoOptions} value={bancoFiltro} onChange={setBancoFiltro} />

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
                  {itens.map((t) => {
                    const banco = bancoPorId(t.bancoId);
                    return (
                      <div key={t.id} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                          {CATEGORIA_ICON_MAP[CATEGORIA_ICONE[t.categoriaId]] ?? CATEGORIA_ICON_MAP.Tag}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{t.descricao}</p>
                          <p className="text-xs text-muted-foreground">{TIPO_LABEL[t.tipo]}</p>
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
          ))
        )}
      </div>
    </SubPageLayout>
  );
}
