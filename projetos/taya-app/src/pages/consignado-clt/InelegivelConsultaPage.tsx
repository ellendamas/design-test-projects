import { useNavigate, useSearchParams } from "react-router-dom";
import { WarningCircle, Warning } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { CreditoPessoalBanner } from "@/components/CreditoPessoalBanner";

// Mensagem por motivo: hoje só tem o genérico, porque a Pode Já ainda não definiu os motivos
// reais de negativa pós-consulta (TODO: substituir pelos motivos reais quando o time técnico
// confirmar o que a API devolve). Pedido da Ellen em 18/11/2026: separado da inelegibilidade de
// pré-consentimento (carteira assinada), porque aqui o motivo só se sabe depois do
// consentimento e pode mudar.
const MOTIVO_LABEL: Record<string, string> = {
  generico: "Pelos dados que recebemos na consulta, não conseguimos aprovar esse crédito pra você agora.",
};

// Inelegibilidade de PÓS-consentimento: a pessoa já autorizou a consulta ao Dataprev, mas o
// resultado veio negativo por um motivo que não é "sem margem consignável" (isso já tem a
// própria tela, sem-oferta) nem "não tem carteira assinada" (isso é barrado antes do
// consentimento, em ElegibilidadePage/InelegivelPage). Continua rastreado como "inelegível",
// só que num status e numa tela própria, porque o motivo pode variar.
export default function ConsignadoCLTInelegivelConsultaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY: ?motivo=generico (default) | outro motivo real, quando existir
  const motivo = searchParams.get("motivo") ?? "generico";
  const mensagem = MOTIVO_LABEL[motivo] ?? MOTIVO_LABEL.generico;

  return (
    <SubPageLayout title="" hideNav>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <WarningCircle size={36} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Não conseguimos aprovar esse crédito agora
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Isso pode mudar. Veja o motivo abaixo.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <Warning size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800">Por que isso acontece?</p>
              <p className="text-xs leading-relaxed text-amber-800">{mensagem}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-foreground">Mas você tem outra opção</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              O Crédito Pessoal não depende dessa consulta.
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
