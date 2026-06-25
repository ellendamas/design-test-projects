import { Flame, Check, ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const niveis = [
  { id: 1, nome: "Economia", cor: "#E8590A" },
  { id: 2, nome: "Despesas", cor: "#3B82F6" },
  { id: 3, nome: "Renda", cor: "#16A34A" },
  { id: 4, nome: "Investimento", cor: "#7C3AED" },
];

const widthByNivel = { 1: "8%", 2: "33%", 3: "66%", 4: "100%" };

export function JornadaFinanceira({ nivelAtual = 2, onAdvanceClick }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const statusTexto =
    nivelAtual === 1
      ? "Complete ações de economia para avançar para Despesas"
      : nivelAtual === 2
        ? "Controle seus gastos por 30 dias para avançar para Renda"
        : nivelAtual === 3
          ? "Mantenha sua renda liberada para chegar em Investimento"
          : "Parabens! Você chegou ao nível máximo";

  const handleAdvance = () => {
    if (onAdvanceClick) {
      onAdvanceClick();
      return;
    }
    navigate("/vida-financeira");
  };

  return (
    <Card className="rounded-2xl border-border bg-white shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <Flame size={24} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Temperatura financeira</p>
            <p className="text-xs text-muted-foreground">Com o termômetro financeiro seutudo. você fica sabendo quando é o melhor momento para investir ou guardar seu dinheiro.</p>
          </div>
        </div>

        <div className="space-y-3 py-2">
          <div className="relative">
            <div className="h-1 w-full rounded-full bg-[#E5E7EB]" />
            <motion.div
              className="absolute left-0 top-0 h-1 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: widthByNivel[nivelAtual] }}
              transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: "easeOut" }}
            />

            <div className="absolute -top-[10px] left-0 right-0 flex items-center justify-between">
              {niveis.map((nivel) => {
                const concluido = nivel.id < nivelAtual;
                const atual = nivel.id === nivelAtual;
                return (
                  <div key={nivel.id} className="flex flex-col items-center gap-1">
                    {concluido ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"><Check size={12} weight="bold" /></div>
                    ) : atual ? (
                      <motion.div
                        className="flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-primary text-white shadow-[0_0_0_2px_rgba(232,89,10,0.35)]"
                        animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                        transition={reduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
                      >
                        <Flame size={14} weight="fill" />
                      </motion.div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-4">
            {niveis.map((nivel) => (
              <p
                key={`label-${nivel.id}`}
                className={`text-center text-[11px] ${nivel.id === nivelAtual ? "font-bold" : "font-medium"}`}
                style={{ color: nivel.id === nivelAtual ? nivel.cor : nivel.id < nivelAtual ? "#E8590A" : "#9CA3AF" }}
              >
                {nivel.nome}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[15px] font-semibold" style={{ color: niveis[nivelAtual - 1]?.cor ?? "#1C1917" }}>
            Você está em {niveis[nivelAtual - 1]?.nome}
          </p>
          <p className="text-[13px] text-muted-foreground">{statusTexto}</p>
        </div>

        <Button variant="outline" className="h-11 w-full rounded-xl border-primary text-primary" onClick={handleAdvance}>
          Ver o que falta para avançar <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
