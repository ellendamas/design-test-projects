import { HERO_CONTEUDO } from "@/data/saudeConteudo";
import type { ModoSaudeProduto } from "@/data/saudeConteudo";

// Mesmo padrão do banner-hero do hub de Assistências (AssistenciasPage, App.tsx): foto em tela
// cheia, degradê escuro por cima pra garantir contraste do texto, conteúdo com padding interno.
// Sem chips, sem ilustração — a v1 desta página usava um hero em dois painéis com ilustração,
// corrigido aqui porque o app inteiro usa banner com foto, não ilustração. Título e subtítulo
// são os mesmos nos dois modos (Prompt 2 v3, seção 1); só a etiqueta muda (HERO_CONTEUDO.etiqueta
// já tinha os dois textos desde o Prompt 1, por isso só passar o modo basta).
export function Hero({ modo }: { modo: ModoSaudeProduto }) {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-2xl">
      <img
        src="/images/assistencia-saude-nova.jpg"
        alt="Saúde por Assinatura"
        width={1200}
        height={800}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div
        className="absolute inset-0 hidden md:block"
        style={{ background: "linear-gradient(90deg, rgba(23,19,17,0.65) 0%, rgba(23,19,17,0.35) 50%, rgba(23,19,17,0.10) 100%)" }}
      />
      <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">
          {HERO_CONTEUDO.etiqueta[modo]}
        </p>
        <h1 className="mb-2 max-w-[420px] text-2xl font-bold leading-snug text-white">{HERO_CONTEUDO.titulo}</h1>
        <p className="max-w-[420px] text-sm text-white/85">{HERO_CONTEUDO.subtitulo}</p>
      </div>
    </div>
  );
}
