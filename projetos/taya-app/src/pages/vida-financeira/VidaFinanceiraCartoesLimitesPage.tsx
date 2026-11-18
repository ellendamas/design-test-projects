import { RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCount, AnimatedCurrency, CartoesSubNav, ChartTooltip, corLimite, SensitiveData } from "./shared";
import { getCartoesConectados } from "./vidaFinanceiraData";

export default function VidaFinanceiraCartoesLimitesPage() {
  const { bancosConectados } = useOpenFinance();
  const cartoesConectados = getCartoesConectados(bancosConectados);
  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  const limiteTotal = cartoesConectados.reduce((sum, c) => sum + c.limiteTotal, 0);
  const limiteUsado = cartoesConectados.reduce((sum, c) => sum + c.limiteUsado, 0);
  const limiteDisponivel = limiteTotal - limiteUsado;
  const pctGeral = limiteTotal > 0 ? Math.round((limiteUsado / limiteTotal) * 100) : 0;

  // Cor de cada anel é a cor do próprio banco (não a de risco): fica claro qual anel é qual
  // cartão só de olhar, sem precisar ler a legenda. O risco (perto/acima do limite) já aparece
  // nos cards por cartão, logo abaixo, com a barra em `corLimite`.
  const dadosRadial = cartoesConectados.map((c) => ({
    nome: c.nome,
    pct: Math.round((c.limiteUsado / c.limiteTotal) * 100),
    fill: bancoPorId(c.bancoId)?.cor ?? "#6B7280",
  }));

  return (
    <SubPageLayout title="Limites">
      <div className="space-y-4 pb-6">
        <CartoesSubNav />

        <Card className="border-border shadow-sm">
          <CardContent className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Limite total usado</p>
              <p className="text-xl font-bold text-foreground">
                <AnimatedCurrency value={limiteUsado} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Limite total disponível</p>
              <p className="text-xl font-bold text-foreground">
                <AnimatedCurrency value={limiteDisponivel} />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart data={dadosRadial} innerRadius="50%" outerRadius="100%" startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="pct" background={{ fill: "#F3F4F6" }} cornerRadius={8} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-foreground"><AnimatedCount value={pctGeral} formatter={(v) => `${Math.round(v)}%`} /></p>
                <p className="text-xs text-muted-foreground">Usado</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {dadosRadial.map((d) => (
                <div key={d.nome} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.nome} · {d.pct}%
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {cartoesConectados.map((c) => {
          const pct = Math.round((c.limiteUsado / c.limiteTotal) * 100);
          return (
            <Card key={c.id} className="border-border shadow-sm">
              <CardContent className="space-y-1.5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-foreground">{c.nome}</p>
                  <p className="font-semibold text-foreground">{pct}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-[#F3F4F6]">
                  <div className={`h-full rounded-full ${corLimite(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">
                    Utilizado: <SensitiveData value={`R$ ${c.limiteUsado.toLocaleString("pt-BR")}`} type="currency" />
                  </p>
                  <p className="text-muted-foreground">
                    Disponível: <SensitiveData value={`R$ ${(c.limiteTotal - c.limiteUsado).toLocaleString("pt-BR")}`} type="currency" />
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SubPageLayout>
  );
}
