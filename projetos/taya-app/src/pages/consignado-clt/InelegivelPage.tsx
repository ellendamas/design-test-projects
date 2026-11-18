import { useNavigate } from "react-router-dom";
import { FileX, Warning } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { CreditoPessoalBanner } from "@/components/CreditoPessoalBanner";

// Pedido do Barreto em 18/11/2026: quem responde "Não" na pergunta de elegibilidade (carteira
// assinada/emprego ativo) cai aqui, com o motivo explicado e já direcionado pro Crédito Pessoal.
// Por enquanto a pessoa refaz a jornada do Crédito Pessoal do zero, sem pular etapa nem levar
// dado nenhum. Automatizar isso fica pra uma fase futura, se os números mostrarem que vale a
// pena.
//
// Essa é a inelegibilidade de PRÉ-consentimento (carteira assinada), pedida pela Ellen em
// 18/11/2026 pra ficar separada da inelegibilidade de PÓS-consentimento (outros motivos,
// definidos no momento da negativa). Ver InelegivelConsultaPage.tsx.
export default function ConsignadoCLTInelegivelPage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="" hideNav>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileX size={36} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Esse crédito é só pra quem tem carteira assinada
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sem isso, não conseguimos seguir com o Consignado CLT agora.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <Warning size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800">Por que isso acontece?</p>
              <p className="text-xs leading-relaxed text-amber-800">
                A parcela do Consignado CLT é descontada direto da folha de pagamento. Por isso,
                esse crédito só está disponível pra quem tem carteira assinada e emprego ativo
                no momento da contratação.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-foreground">Mas você tem outra opção</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Esse produto não depende de carteira assinada.
            </p>
          </div>

          <CreditoPessoalBanner onNavegar={navigate} />
        </div>

        <div className="space-y-1 pt-2">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Simular Crédito Pessoal
          </button>
          <button
            type="button"
            onClick={() => navigate("/painel")}
            className="w-full py-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
