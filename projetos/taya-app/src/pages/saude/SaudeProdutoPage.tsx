import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import type { ModoSaudeProduto } from "@/data/saudeConteudo";
import { formatoDeCodigoValido, gravarAtribuicao, gravarRefNaSessao } from "@/pages/referral/shared";
import { trackReferralLandingViewed } from "@/pages/referral/trackReferral";
import { trackStep } from "@/utils/analytics";
import { ReferralCard } from "@/pages/referral/ReferralCard";
import { ASSINATURA_ATIVA_SO_POR_PARAMETRO, estadoAssinaturaViaParametro, planoAtivoViaParametro } from "./estadoAssinaturaDesignOnly";
import { AVISO_SAUDE_POR_ESTADO, ESTADOS_COM_INDIQUE_E_GANHE, type AcaoEstadoAssinatura } from "./estadosAssinaturaConteudo";
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
  // Sem plano ativo, não existe estado. Com plano ativo e sem ?assinaturaEstado= na URL, o
  // padrão é "ativo" — mesmo comportamento de antes deste parâmetro existir.
  const estado = assinaturaAtiva ? estadoAssinaturaViaParametro() ?? "ativo" : null;

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
  const irParaPagamentoPix = () => navigate("/assistencias/saude/pagamento", { state: { plano: planoAtivoViaParametro() ?? undefined } });

  // Mapeia a ação do botão do estado (estadosAssinaturaConteudo.ts) pra navegação de verdade —
  // "acessar_benemed" não aparece no aviso desta página (só em Minha assinatura), então não
  // precisa de caso aqui.
  const executarAcaoEstado = (acao: AcaoEstadoAssinatura) => {
    if (acao === "pagar_pix" || acao === "regularizar") irParaPagamentoPix();
    else irParaMeuPlano();
  };

  // "cancelado" não tem aviso nenhum (pedido explícito do brief) — some tanto o card quanto o
  // card de indicação, como se não houvesse assinatura pra mostrar aqui.
  const avisoEstado = estado && estado !== "cancelado" ? AVISO_SAUDE_POR_ESTADO[estado] : null;

  const conteudo = (
    <div className="space-y-6 pb-4">
      <Hero modo={modo} />
      {avisoEstado && estado && (
        <>
          <AvisoAssinaturaAtiva
            titulo={avisoEstado.titulo}
            texto={avisoEstado.texto}
            botaoLabel={avisoEstado.botao.label}
            onBotao={() => executarAcaoEstado(avisoEstado.botao.acao)}
          />
          {/* IG-01 — Prompt 1d (22/10) trouxe o card pra cá; Prompt 1e (22/10) restringiu a
              exibição aos estados "ativo" e "ativacao" (ESTADOS_COM_INDIQUE_E_GANHE). */}
          {ESTADOS_COM_INDIQUE_E_GANHE.includes(estado) && <ReferralCard origin="saude_plano_ativo" />}
        </>
      )}
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

  // CTA fixo segue o mesmo botão do aviso quando ele existe (mesma ação, só repetida fixa no
  // rodapé) — sem aviso (sem plano, ou "cancelado"), volta a ser "Ver planos".
  const ctaFixoLabel = avisoEstado ? avisoEstado.botao.label : "Ver planos";
  const ctaFixoOnClick = avisoEstado ? () => executarAcaoEstado(avisoEstado.botao.acao) : irParaPlanos;

  if (modo === "app") {
    return (
      <SubPageLayout title="Saúde">
        {conteudo}
        {/* Flutuante nas duas larguras: fixed no mobile (acima da navegação inferior, por isso o
            bottom-[90px]) e sticky no desktop — como o botão já vive dentro da coluna
            centralizada que o SubPageLayout cria pros children (md:max-w-[640px]), sticky
            herda a largura certa sozinho, sem precisar calcular o deslocamento do menu lateral
            como um fixed exigiria. Pedido explícito: antes só flutuava no mobile, no desktop
            virava um botão comum no fim da página. */}
        <div className="fixed inset-x-0 bottom-[90px] z-30 px-4 md:sticky md:inset-x-auto md:bottom-6 md:px-0">
          <div className="mx-auto md:max-w-none">
            <Button className="h-14 w-full rounded-full shadow-lg" onClick={ctaFixoOnClick}>
              {ctaFixoLabel}
            </Button>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <PublicLayout
      footerTransparente
      footer={!planosVisiveis ? <Button className="h-14 w-full rounded-full shadow-lg" onClick={rolarAtePlanos}>Ver planos</Button> : undefined}
    >
      {conteudo}
    </PublicLayout>
  );
}
