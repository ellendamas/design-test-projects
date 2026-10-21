import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import type { ModoSaudeProduto } from "@/data/saudeConteudo";
import { formatoDeCodigoValido, gravarAtribuicao, gravarRefNaSessao } from "@/pages/referral/shared";
import { trackReferralLandingViewed } from "@/pages/referral/trackReferral";
import { trackStep } from "@/utils/analytics";
import { ASSINATURA_ATIVA_SO_POR_PARAMETRO, planoAtivoViaParametro } from "./estadoAssinaturaDesignOnly";
import { usarMetaTagsPublicas } from "./usarMetaTagsPublicas";
import { AvisoAssinaturaAtiva } from "./secoes/AvisoAssinaturaAtiva";
import { ComoFunciona } from "./secoes/ComoFuncionaProduto";
import { Duvidas } from "./secoes/Duvidas";
import { EspecialidadesCarrossel } from "./secoes/EspecialidadesCarrossel";
import { Hero } from "./secoes/Hero";
import { OQueVoceTem } from "./secoes/OQueVoceTem";
import { PlanosPublico } from "./secoes/PlanosPublico";
import { RedePresencial } from "./secoes/RedePresencial";
import { RodapeLegal } from "./secoes/RodapeLegal";
import { SituacoesGrid } from "./secoes/SituacoesGrid";

// Página do produto Saúde por Assinatura — componente único pros dois modos (Prompt 2 v3):
// `app`, dentro de Assistências, e `publica`, a LP externa em /saude. Hero, "O que você tem",
// "A vida real não avisa.", "13 especialidades por vídeo.", "Na rede presencial, valor
// reduzido.", "Como funciona", Dúvidas e rodapé legal são exatamente os mesmos nos dois modos —
// só os planos (embutidos aqui no modo público, numa tela própria no modo app), o CTA fixo (rola
// até os planos em vez de navegar) e o chrome ao redor (PublicLayout em vez de SubPageLayout, só
// a logo no topo, sem menu/abas/voltar/sino/olho) mudam.
export default function SaudeProdutoPage({ modo }: { modo: ModoSaudeProduto }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planosRef = useRef<HTMLDivElement>(null);
  const [planosVisiveis, setPlanosVisiveis] = useState(false);
  const trackedRef = useRef(false);

  const assinaturaAtiva =
    modo === "app" && (ASSINATURA_ATIVA_SO_POR_PARAMETRO ? planoAtivoViaParametro() !== null : false);

  const refParam = searchParams.get("ref");
  const refValido = formatoDeCodigoValido(refParam);

  usarMetaTagsPublicas(modo === "publica");

  useEffect(() => {
    trackStep("saude_produto_visualizado", { modo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atribuição e medição de quem chega pela LP pública (IG-04, antes em BenemedLandingPage.tsx,
  // agora parte deste componente) — cookie (R3, 30 dias) + sessionStorage (defesa extra dentro
  // da mesma sessão) gravados uma vez só, no mount. Código ausente ou inválido: a página segue
  // igual, sem atribuição e sem erro visível (mesmo comportamento de antes).
  useEffect(() => {
    if (modo !== "publica" || trackedRef.current) return;
    trackedRef.current = true;
    if (refValido && refParam) {
      gravarAtribuicao(refParam);
      gravarRefNaSessao(refParam);
    }
    trackReferralLandingViewed(
      refValido,
      refValido ? (refParam as string) : undefined,
      searchParams.get("utm_source") ?? undefined,
      searchParams.get("utm_campaign") ?? undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  // Esconde o CTA fixo "Ver planos" assim que a seção de planos entra na tela — só existe
  // sentido de rolar até algo que ainda não está visível.
  useEffect(() => {
    if (modo !== "publica") return;
    const el = planosRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setPlanosVisiveis(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [modo]);

  const irParaPlanos = () => navigate("/assistencias/saude/planos");
  const irParaMeuPlano = () => navigate("/contratos");
  const rolarAtePlanos = () => planosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const conteudo = (
    <div className="space-y-6 pb-4">
      <Hero modo={modo} />
      {assinaturaAtiva && <AvisoAssinaturaAtiva onVerMeuPlano={irParaMeuPlano} />}
      <OQueVoceTem />
      <SituacoesGrid />
      <EspecialidadesCarrossel />
      <RedePresencial />
      <ComoFunciona modo={modo} />
      {modo === "publica" && (
        <div ref={planosRef}>
          <PlanosPublico refCode={refValido ? (refParam as string) : undefined} />
        </div>
      )}
      <Duvidas />
      <RodapeLegal modo={modo} />
      {/* Espaço reservado pro CTA fixo não cobrir o rodapé legal, acima da navegação inferior */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );

  if (modo === "app") {
    return (
      <SubPageLayout title="Saúde">
        {conteudo}
        <div className="fixed inset-x-0 bottom-[90px] z-30 px-4 md:relative md:inset-auto md:bottom-auto md:px-0 md:pt-2">
          <div className="mx-auto md:max-w-none">
            <Button className="h-14 w-full rounded-full shadow-lg" onClick={assinaturaAtiva ? irParaMeuPlano : irParaPlanos}>
              {assinaturaAtiva ? "Ver meu plano" : "Ver planos"}
            </Button>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <PublicLayout footer={!planosVisiveis ? <Button className="h-14 w-full rounded-full shadow-lg" onClick={rolarAtePlanos}>Ver planos</Button> : undefined}>
      {conteudo}
    </PublicLayout>
  );
}
