import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// TODO: receber da API BMP
const SALDO_DISPONIVEL_MOCK = 5841.09;

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pills = ["Sem análise de crédito", "Sem consulta ao Serasa", "Receba em minutos"];

export default function FGTSSaldoDisponivelPage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="" hideNav>
      <div className="space-y-4 pb-32">

        {/* Card de celebração */}
        <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle size={32} className="text-green-600" weight="fill" />
          </motion.div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            CONSULTA CONCLUÍDA
          </p>
          <p className="text-xl font-semibold leading-snug text-foreground">
            Consultamos seu saldo do FGTS
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Encontramos seu saldo disponível para antecipação. Agora é só simular e escolher
            quantas parcelas você quer receber.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {pills.map((pill) => (
              <div
                key={pill}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs"
              >
                <CheckCircle size={11} className="text-[#FD5F31]" weight="fill" />
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Card de saldo em destaque */}
        <div className="rounded-2xl bg-[#FFF3EE] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#D94E28]">
            Seu saldo disponível
          </p>
          {/* TODO: receber da API BMP */}
          <p className="mt-1 text-4xl font-bold text-[#D94E28]">
            R$ {formatCurrency(SALDO_DISPONIVEL_MOCK)}
          </p>
          <p className="mt-1 text-xs text-[#D94E28]/70">
            Consultado agora via Caixa Econômica Federal
          </p>
        </div>

        {/* CTA */}
        <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
          <button
            type="button"
            onClick={() => navigate("/fgts/simular")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Simular agora
          </button>
          <button
            type="button"
            onClick={() => navigate("/painel")}
            className="mt-1 w-full py-3 text-center text-sm text-muted-foreground"
          >
            Voltar para o início
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
