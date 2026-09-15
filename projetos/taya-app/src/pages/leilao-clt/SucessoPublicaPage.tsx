import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import type { ContaData } from "@/components/ContaSelector";
import { OFERTA_LEILAO } from "./leilaoData";

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Rota: /leilao/oferta/sucesso — jornada pública/guest, apartada da jornada com conta
// (/leilao/sucesso).
export default function LeilaoSucessoPublicaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const conta = (location.state as { conta?: ContaData } | null)?.conta ?? null;

  return (
    <PublicLayout
      footer={
        <>
          <Button
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/leilao/criar-conta", { state: location.state })}
          >
            Criar conta para acompanhar
          </Button>
          <Button variant="outline" className="h-12 w-full rounded-full border-border text-foreground" onClick={() => navigate("/")}>
            Continuar sem conta
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease: "backOut" }}>
          <CheckCircle size={64} weight="fill" className="text-[#16A34A]" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Seu crédito foi aprovado!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O valor será depositado em até 1 dia útil na conta informada.
          </p>
        </div>

        <div className="mt-2 w-full rounded-2xl border border-border bg-white p-4 text-left">
          <p className="text-xs text-muted-foreground">Valor liberado</p>
          <p className="text-lg font-bold text-foreground">R$ {formatCurrency(OFERTA_LEILAO.valor)}</p>
          {conta && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">Conta de destino</p>
              <p className="text-sm font-semibold text-foreground">
                {conta.banco.nome} · Ag {conta.agencia} · ••••-{conta.digito}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 w-full border-t border-border pt-4 text-left">
          <p className="text-sm font-semibold text-foreground">Acompanhe seu contrato</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Crie sua conta no Pode Já para ver o contrato, boletos e histórico de pagamentos.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
