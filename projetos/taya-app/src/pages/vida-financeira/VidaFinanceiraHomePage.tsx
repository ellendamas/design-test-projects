import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { ArrowsClockwise, Bank, CaretDown, CaretRight, ChartLineUp, CreditCard, Gauge, Receipt, Stack, TrendDown, TrendUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SubPageLayout } from "@/App";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { AnimatedCount, AnimatedCurrency, BankAvatar, CardBadge, ComparativoTooltip, corLimite, DragScrollRow, InfoTooltip, SensitiveData, VidaFinanceiraInsightsCarousel, VidaFinanceiraSaudeBanner } from "./shared";
import { getCartoesConectados, getLimitePorBanco, getRitmoGastos, getTotalAssinaturasPorMes, MES_ATUAL } from "./vidaFinanceiraData";

const LIMITE_ATUALIZACOES_DIA = 3;
// DESIGN ONLY: texto ilustrativo de "atualizado há X" pros bancos que ainda não foram
// atualizados nesta sessão. Não vem de um timestamp real.
const PLACEHOLDER_ATUALIZACAO = ["Atualizado há 2h", "Atualizado há 5h", "Atualizado há 8h", "Atualizado há 11h"];

export default function VidaFinanceiraHomePage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { bancosConectados, saldoTotal } = useOpenFinance();
  const [cartaoId, setCartaoId] = useState<string | null>(null);
  const [saldoPorBancoAberto, setSaldoPorBancoAberto] = useState(false);
  const [cartaoOpcoesAbertas, setCartaoOpcoesAbertas] = useState(false);
  const [atualizarAberto, setAtualizarAberto] = useState(false);
  const [atualizacoesHoje, setAtualizacoesHoje] = useState<Record<string, number>>({});
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Record<string, string>>({});

  const irConectarBanco = () =>
    navigate("/cadastro/open-finance/selecionar-instituicao", { state: { returnTo: "/vida-financeira" } });

  // DESIGN ONLY: 3x por dia por banco, mesmo limite do Pier (referência do Barreto na sync de
  // 13/11/2026). Técnico confirmou que a rede do Open Finance libera bem mais que isso por mês
  // (420 chamadas/mês pra saldo e limite de conta). O limite aqui é só decisão de produto,
  // ainda precisa validar com o time técnico se a Celcoin cobra algo a mais por chamada.
  const atualizarBanco = (bancoId: string, nomeBanco: string) => {
    const usadas = atualizacoesHoje[bancoId] ?? 0;
    if (usadas >= LIMITE_ATUALIZACOES_DIA) {
      toast(`Limite diário atingido para o ${nomeBanco}. Você poderá atualizar de novo amanhã.`);
      return;
    }
    setAtualizacoesHoje((prev) => ({ ...prev, [bancoId]: usadas + 1 }));
    setUltimaAtualizacao((prev) => ({ ...prev, [bancoId]: "Atualizado agora" }));
    // Avisa no momento em que o limite é alcançado, não só quando a pessoa tenta de novo e é
    // bloqueada. Pedido da Ellen em 16/11/2026.
    if (usadas + 1 >= LIMITE_ATUALIZACOES_DIA) {
      toast(`${nomeBanco} atualizado. Você atingiu o limite diário: só poderá atualizar de novo amanhã.`);
    } else {
      toast(`${nomeBanco} atualizado.`);
    }
  };

  if (bancosConectados.length === 0) {
    return (
      <SubPageLayout title="Vida financeira">
        <Card className="border-border shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <ChartLineUp size={22} />
            </div>
            <p className="text-sm font-semibold text-foreground">Conecte um banco pra ver sua vida financeira</p>
            <p className="text-xs text-muted-foreground">
              Saldo, gastos do mês e dicas pensadas pra você, tudo em um só lugar.
            </p>
            <Button className="h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={irConectarBanco}>
              Conectar banco
            </Button>
          </CardContent>
        </Card>
      </SubPageLayout>
    );
  }

  const ritmo = getRitmoGastos();
  const limiteUsadoGeral = getLimitePorBanco(bancosConectados).reduce((sum, b) => sum + (b.historico[MES_ATUAL] ?? 0), 0);
  const totalAssinaturas = getTotalAssinaturasPorMes(MES_ATUAL);
  const cartoesConectados = getCartoesConectados(bancosConectados);
  const cartaoSelecionado = cartaoId ? cartoesConectados.find((c) => c.id === cartaoId) ?? null : null;
  const cartoesContexto = cartaoSelecionado ? [cartaoSelecionado] : cartoesConectados;
  const totalCartoes = cartoesContexto.reduce((sum, c) => sum + c.faturaAtual, 0);
  const limiteTotalCartoes = cartoesContexto.reduce((sum, c) => sum + c.limiteTotal, 0);
  const limiteUsadoCartoes = cartoesContexto.reduce((sum, c) => sum + c.limiteUsado, 0);
  const pctCartoes = limiteTotalCartoes > 0 ? Math.round((limiteUsadoCartoes / limiteTotalCartoes) * 100) : 0;
  const bancoPorId = (bancoId: string) => bancosConectados.find((b) => b.id === bancoId);

  // DESIGN ONLY: igual o Pier, atualiza banco por banco, não todos de uma vez. Cada um com
  // seu próprio contador de "quantas vezes ainda hoje" e botão de atualizar.
  const atualizarModalContent = (
    <div className="space-y-1">
      {bancosConectados.map((banco, idx) => {
        const usadas = atualizacoesHoje[banco.id] ?? 0;
        const restantes = LIMITE_ATUALIZACOES_DIA - usadas;
        return (
          <div key={banco.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <BankAvatar banco={banco} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{banco.nome}</p>
              {restantes <= 0 ? (
                <p className="text-xs font-medium text-amber-600">Limite diário atingido · de novo amanhã</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {ultimaAtualizacao[banco.id] ?? PLACEHOLDER_ATUALIZACAO[idx % PLACEHOLDER_ATUALIZACAO.length]}
                </p>
              )}
            </div>
            <p className={`shrink-0 text-xs ${restantes <= 0 ? "font-semibold text-amber-600" : "text-muted-foreground"}`}>
              {restantes}/{LIMITE_ATUALIZACOES_DIA}
            </p>
            <button
              type="button"
              onClick={() => atualizarBanco(banco.id, banco.nome)}
              disabled={restantes <= 0}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary disabled:text-muted-foreground/40"
              aria-label={`Atualizar ${banco.nome}`}
            >
              <ArrowsClockwise size={18} />
            </button>
          </div>
        );
      })}
      <Button
        variant="outline"
        className="mt-3 h-11 w-full rounded-xl border-border"
        onClick={() => {
          setAtualizarAberto(false);
          irConectarBanco();
        }}
      >
        Conectar novo banco
      </Button>
    </div>
  );

  return (
    <SubPageLayout title="Vida financeira">
      <div className="space-y-4 pb-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#FD5F31] to-[#FA9832] text-white shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-white/80">Saldo em todas as contas</p>
                <p className="mt-1 text-3xl font-bold">
                  <AnimatedCurrency value={saldoTotal} light />
                </p>
                <p className="text-sm text-white/80">
                  {bancosConectados.length} {bancosConectados.length === 1 ? "banco conectado" : "bancos conectados"}
                </p>
              </div>
              {/* Mesmo layout do botão de mostrar/ocultar dados, só que pra abrir o modal de
                  atualizar. Pedido da Ellen em 16/11/2026, inspirado no Pier. */}
              <button
                type="button"
                onClick={() => setAtualizarAberto(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/20"
                aria-label="Atualizar dados do Open Finance"
                title="Atualizar dados"
              >
                <ArrowsClockwise size={20} className="text-white" />
              </button>
            </div>

            {/* Pedido da Ellen em 16/11/2026: "Saldo por banco" volta pra dentro do box
                laranja, depois do saldo total, com "Conectar novo banco" agora no fim da
                lista. Fica recuado com o mesmo respiro dos dados de cima (caixinha dentro da
                caixa, não uma faixa colada na borda). Fechado acompanha o laranja (um tom bem
                sutil de branco, só pra já indicar que é uma caixinha própria); aberto, vira
                branco. A abertura em si não é mais um fade de cor: é a altura crescendo com
                uma molinha elástica no final (framer-motion spring), não um fade. */}
            <div className={`overflow-hidden rounded-xl transition-colors duration-300 ${saldoPorBancoAberto ? "bg-white" : "bg-white/10"}`}>
              <button
                type="button"
                onClick={() => setSaldoPorBancoAberto((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5"
              >
                <span className={`flex items-center gap-2 text-sm font-medium ${saldoPorBancoAberto ? "text-foreground" : "text-white"}`}>
                  <Bank size={18} />
                  Saldo por banco
                </span>
                <CaretDown
                  size={16}
                  className={`shrink-0 transition-transform ${saldoPorBancoAberto ? "rotate-180 text-muted-foreground" : "text-white"}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {saldoPorBancoAberto && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div>
                      {bancosConectados.map((banco) => (
                        <div key={banco.id} className="flex items-center justify-between gap-3 border-t border-border px-3 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: banco.cor }}>
                              {banco.nome.charAt(0)}
                            </span>
                            <p className="truncate text-sm font-semibold text-foreground">{banco.nome}</p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-foreground">
                            <SensitiveData value={`R$ ${banco.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} type="currency" />
                          </p>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={irConectarBanco}
                        className="w-full border-t border-border px-3 py-3 text-center text-sm font-semibold text-[#FD5F31]"
                      >
                        Conectar novo banco
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* "Ritmo de gastos": pedido do Barreto (GPM) na sync de 13/11/2026. Ele quer que a
            home seja acionável, não só informativa, no padrão do que ele usa toda sexta/segunda
            no Pier (concorrente direto do nosso Open Finance) pra saber se precisa segurar o
            resto do mês. É a mesma curva acumulada de "Gastos do mês" (período 1 mês), só que
            em destaque: valor abaixo/acima do mês passado, % e gráfico comparativo. */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ritmo do mês</p>
              <button type="button" onClick={() => navigate("/vida-financeira/gastos")} className="flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                Ver detalhes <CaretRight size={12} />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCurrency value={Math.abs(ritmo.delta)} />
              </p>
              <p className="text-sm text-muted-foreground">{ritmo.delta <= 0 ? "abaixo" : "acima"}</p>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                  ritmo.delta <= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
                }`}
              >
                {ritmo.delta <= 0 ? <TrendDown size={12} /> : <TrendUp size={12} />}
                {Math.abs(ritmo.pct)}%
              </span>
              <span className="text-muted-foreground">
                vs <SensitiveData value={`R$ ${ritmo.totalAnterior.toLocaleString("pt-BR")}`} type="currency" /> mês anterior
              </span>
            </div>

            <div className="mt-3">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={ritmo.serie} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <Tooltip content={<ComparativoTooltip labelPrefix="Dia " />} />
                  <Line type="monotone" dataKey="anterior" stroke="#C4C4C4" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="atual" stroke="#16A34A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-0.5 w-3 bg-[#16A34A]" /> Este mês
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-0.5 w-3 border-t border-dashed border-muted-foreground" /> Mês passado
              </span>
            </div>
          </CardContent>
        </Card>

        {/* "Para você" saiu de dentro do box laranja: o Ritmo de gastos é o principal agora
            (pedido do Barreto), então os destaques vêm logo depois dele, não competindo
            espaço lá em cima. Mesmo carrossel, só mudou de lugar. Pedido da Ellen em
            16/11/2026. */}
        <VidaFinanceiraInsightsCarousel />

        {/* Banner "ads" pro Saúde por Assinatura, numa sessão separada dos destaques: é
            publicidade de produto, não um fato sobre os dados do usuário. Pedido da Ellen em
            16/11/2026, modelo em Figma. */}
        <VidaFinanceiraSaudeBanner />

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-3 p-4">
            <button
              type="button"
              onClick={() => navigate("/vida-financeira/cartoes/faturas")}
              className="flex w-full items-center gap-2 text-left"
            >
              <CreditCard size={18} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Cartões de crédito</p>
            </button>

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

            <div>
              <p className="text-xs text-muted-foreground">{cartaoSelecionado ? "Fatura atual" : "Fatura total · todos os cartões"}</p>
              <p className="text-xl font-bold text-foreground">
                <AnimatedCurrency value={totalCartoes} />
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <p className="text-muted-foreground">Limite usado</p>
                <p className="font-semibold text-foreground"><AnimatedCount value={pctCartoes} formatter={(v) => `${Math.round(v)}%`} /></p>
              </div>
              <div className="h-1.5 rounded-full bg-[#F3F4F6]">
                <div className={`h-full rounded-full ${corLimite(pctCartoes)}`} style={{ width: `${Math.min(pctCartoes, 100)}%` }} />
              </div>
            </div>

            {/* Faturas/Parcelas/Limites viram acordeão aqui dentro, só na home (pedido da
                Ellen em 16/11/2026). Nas rotas internas, nada muda: continuam de pé pra
                organizar os dados e virar a base dos próximos insights de cartão. */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setCartaoOpcoesAbertas((v) => !v)}
                className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground"
              >
                Faturas, parcelas e limites
                <CaretDown size={14} className={`transition-transform ${cartaoOpcoesAbertas ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {cartaoOpcoesAbertas && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { label: "Faturas", path: "/vida-financeira/cartoes/faturas", icon: <Receipt size={16} /> },
                        { label: "Parcelas", path: "/vida-financeira/cartoes/parcelas", icon: <Stack size={16} /> },
                        { label: "Limites", path: "/vida-financeira/cartoes/limites", icon: <Gauge size={16} /> },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigate(item.path)}
                          className="flex flex-col items-start gap-2 rounded-xl border border-border bg-white p-3 text-left shadow-sm"
                        >
                          <span className="text-primary">{item.icon}</span>
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Grupo secundário, pedido do Barreto: Assinaturas e Limite da conta continuam
            acessíveis, só que deixam de competir com o Ritmo de gastos como primeiro plano. */}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => navigate("/vida-financeira/assinaturas")} className="rounded-xl border border-border bg-white p-3 text-left shadow-sm">
            <ArrowsClockwise size={18} className="text-primary" />
            <p className="mt-2 text-lg font-bold text-foreground">
              <AnimatedCurrency value={totalAssinaturas} />
            </p>
            <p className="text-[11px] leading-tight text-muted-foreground">Assinaturas</p>
          </button>
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1">
              <Gauge size={18} className="text-primary" />
              <InfoTooltip texto="Isso é referente ao cheque especial da sua conta." />
            </div>
            {/* Botão separado do ícone de info: um <button> não pode ficar dentro de outro. */}
            <button type="button" onClick={() => navigate("/vida-financeira/limites")} className="mt-2 block w-full text-left">
              <p className="text-lg font-bold text-foreground">
                <AnimatedCurrency value={limiteUsadoGeral} prefix="-" className={limiteUsadoGeral > 0 ? "text-[#DC2626]" : ""} />
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground">Limite da conta</p>
            </button>
          </div>
        </div>
      </div>

      {isDesktop ? (
        <Dialog open={atualizarAberto} onOpenChange={setAtualizarAberto}>
          <DialogContent className="max-w-sm">
            <DialogClose onClose={() => setAtualizarAberto(false)} />
            <DialogHeader>
              <DialogTitle>Atualizar dados</DialogTitle>
            </DialogHeader>
            {atualizarModalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={atualizarAberto} onOpenChange={setAtualizarAberto}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Atualizar dados</DrawerTitle>
            </DrawerHeader>
            {atualizarModalContent}
          </DrawerContent>
        </Drawer>
      )}
    </SubPageLayout>
  );
}
