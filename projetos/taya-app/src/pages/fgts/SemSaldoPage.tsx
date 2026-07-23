import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CaretDown,
  FileX,
  Wallet,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

export default function FGTSSemSaldoPage() {
  const navigate = useNavigate();
  const [accordionAberto, setAccordionAberto] = useState<number | null>(0);

  const causas = [
    {
      titulo: "A autorização não foi concluída",
      corpo: (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Volte ao app do FGTS e certifique-se de ter autorizado a{" "}
            <span className="font-medium text-foreground">
              BMP SOCIEDADE DE CREDITO DIRETO S.A
            </span>{" "}
            em "Autorizar movimentações".
          </p>
          <button
            type="button"
            onClick={() => navigate("/fgts/copiloto")}
            className="flex items-center gap-1 text-xs font-medium text-[#FD5F31]"
          >
            Tentar autorizar de novo <ArrowRight size={12} />
          </button>
        </div>
      ),
    },
    {
      titulo: "Saldo insuficiente",
      corpo: (
        <p className="text-xs leading-relaxed text-muted-foreground">
          O saldo mínimo para antecipação é R$ 100,00. Se seu saldo
          for inferior, não é possível antecipar no momento.
        </p>
      ),
    },
    {
      titulo: "Ainda no período de carência",
      corpo: (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Após optar pelo Saque Aniversário, há uma carência de 90 dias
          antes da primeira antecipação.
        </p>
      ),
    },
  ];

  return (
    <SubPageLayout title="" hideNav>
      <div className="space-y-6 pb-6">

        {/* Hero */}
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileX size={36} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Não encontramos saldo disponível agora
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu FGTS pode não ter saldo elegível para antecipação,
              ou a autorização pode não ter sido concluída corretamente.
            </p>
          </div>
        </div>

        {/* Accordion — causas */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">O que pode ter acontecido?</p>
          {causas.map((causa, i) => {
            const open = accordionAberto === i;
            return (
              <div key={i} className="rounded-2xl border border-border bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => setAccordionAberto(open ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground">{causa.titulo}</span>
                  <CaretDown
                    size={16}
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && <div className="px-4 pb-4">{causa.corpo}</div>}
              </div>
            );
          })}
        </div>

        {/* Cross-sell */}
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-foreground">Não fique sem dinheiro</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Temos outras opções que podem funcionar para você agora.
            </p>
          </div>

          {/* Crédito Pessoal — clicável */}
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#FD5F31]/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE]">
                <Wallet size={20} className="text-[#FD5F31]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Crédito Pessoal</p>
                <p className="mt-0.5 text-xs font-medium text-[#FD5F31]">Dinheiro na conta em minutos</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Sem precisar de FGTS ou desconto em folha.
                </p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" />
            </div>
          </button>

          {/* Consignado CLT — clicável */}
          <button
            type="button"
            onClick={() => navigate("/consignado-clt")}
            className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#FD5F31]/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE]">
                <CurrencyCircleDollar size={20} className="text-[#FD5F31]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Crédito Consignado CLT</p>
                  <span className="rounded-full bg-[#FFF3EE] px-2 py-0.5 text-[10px] font-medium text-[#FD5F31]">
                    Para CLT
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-[#FD5F31]">Menor taxa do mercado</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Desconto em folha. Sem aprovação da empresa, 100% digital.
                </p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Rodapé */}
        <div className="space-y-1 pt-2">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Conhecer o Crédito Pessoal
          </button>
          <button
            type="button"
            onClick={() => navigate("/painel")}
            className="w-full py-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar para o início
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
