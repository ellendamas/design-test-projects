import { CheckCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { CADASTRO_PATH_PUBLICO, PLANOS_CONTEUDO } from "@/data/saudeConteudo";
import { PLANOS, type Plano } from "@/pages/assistencias/shared";
import { trackReferralLandingCtaClicked, trackReferralPlanSelected } from "@/pages/referral/trackReferral";

// Planos dentro da LP pública (/saude, Prompt 2 v3) — mesmos cards de PlanosPage.tsx
// (/assistencias/saude/planos), mas só a periodicidade mensal dos dois (sem o seletor de prazo:
// Semestral e Anual ficam de fora de propósito, seção 2.1 do prompt) e os botões levam pro
// cadastro em vez de pro checkout logado.
export function PlanosPublico({ refCode }: { refCode?: string }) {
  const navigate = useNavigate();
  const planoIndividual = PLANOS.find((p) => p.id === "mensal") as Plano;
  const planoFamiliar = PLANOS.find((p) => p.id === "familiar") as Plano;
  const conteudoIndividual = PLANOS_CONTEUDO.mensal;
  const conteudoFamiliar = PLANOS_CONTEUDO.familiar;

  const irParaCadastro = (plano: "mensal" | "familiar", trackingId: "individual" | "familiar", precoMes: number) => {
    trackReferralPlanSelected(trackingId, precoMes);
    trackReferralLandingCtaClicked(trackingId, refCode);
    const params = new URLSearchParams({ plano });
    if (refCode) params.set("ref", refCode);
    navigate(`${CADASTRO_PATH_PUBLICO}?${params.toString()}`);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">Escolha o plano que cabe na vida.</h2>
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FD5F31]">{conteudoIndividual.etiqueta}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {planoIndividual.precoMes}
            <span className="text-sm font-medium text-muted-foreground"> por mês</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{conteudoIndividual.paraQuem}</p>

          <ul className="mt-3 space-y-2">
            {conteudoIndividual.itens.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#1A7A4C]" weight="fill" />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => irParaCadastro("mensal", "individual", 39.9)}
            className="mt-4 h-12 w-full rounded-full bg-[#FD5F31] text-sm font-semibold text-white"
          >
            {conteudoIndividual.cta}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#D94E28] p-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{conteudoFamiliar.etiqueta}</p>
            {planoFamiliar.destaque && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {planoFamiliar.destaque}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {planoFamiliar.precoMes}
            <span className="text-sm font-medium text-white/80"> por mês</span>
          </p>
          <p className="mt-1 text-sm font-semibold">{conteudoFamiliar.paraQuem}</p>

          <ul className="mt-3 space-y-2">
            {conteudoFamiliar.itens.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-white/90">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-white" weight="fill" />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => irParaCadastro("familiar", "familiar", 53.9)}
            className="mt-4 h-12 w-full rounded-full bg-white text-sm font-semibold text-[#FD5F31]"
          >
            {conteudoFamiliar.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
