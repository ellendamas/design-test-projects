import { useNavigate } from "react-router-dom";
import { Briefcase, Warning } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// Pergunta de pré-elegibilidade, logo depois da intro e antes do consentimento Dataprev.
// Pedido do Barreto em 18/11/2026: muita gente iniciava a simulação e caía como inelegível só
// por não ter carteira assinada/emprego ativo, requisito básico do consignado CLT. Perguntar
// isso antes evita consultar o Dataprev à toa e já direciona quem não se qualifica pra outro
// produto, em vez de só mostrar um erro no fim do fluxo.
export default function ConsignadoCLTElegibilidadePage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="Consignado CLT">
      <div className="flex flex-col items-center gap-6 pb-6 pt-4 text-center md:mx-auto md:max-w-[480px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">
          <Briefcase size={28} />
        </div>

        <h1 className="text-xl font-bold leading-snug text-foreground">
          Você tem carteira assinada e está empregado atualmente?
        </h1>

        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <Warning size={14} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-left text-xs leading-relaxed text-amber-800">
              Isso é obrigatório para o Crédito Consignado CLT: a parcela é descontada direto da
              sua folha de pagamento.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/consignado-clt/provedores")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#D94E28] active:scale-[0.98]"
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => navigate("/consignado-clt/inelegivel")}
            className="flex h-14 w-full items-center justify-center rounded-full border border-border text-base font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
          >
            Não
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
