import { ILUSTRACAO_POR_SLOT } from "@/components/ilustracoes/SituacaoIlustracoes";
import { PeekCarousel } from "@/components/PeekCarousel";
import { SITUACOES_CONTEUDO, type Situacao } from "@/data/saudeConteudo";

// Mesmo padrão dos cards de "Benefícios a caminho" do hub (imagem no topo, corpo branco embaixo)
// dentro de um PeekCarousel, em vez do grid de 4 colunas da v1 (texto caía pra 11/12px na coluna
// de ~560px do app) e do ícone sobre fundo pêssego que a v1 também usava aqui.
//
// Largura em 78% da coluna (via PeekCarousel, que dá o contexto de largura) pra borda do
// próximo card aparecer sem cortar o texto no meio (ajuste pedido depois de ver "Dentista da
// rede par..." cortado em 220px fixos). Altura automática: o PeekCarousel não define
// align-items, então o default do flexbox (stretch) já iguala todos os cards à altura do maior
// da linha sozinho — só precisa de `flex flex-col` aqui, com a tag em `mt-auto` pra ficar
// sempre ancorada na base, mesmo quando o card fica mais alto que o conteúdo pede.
function SituacaoCard({ item }: { item: Situacao }) {
  const Ilustracao = ILUSTRACAO_POR_SLOT[item.slot];
  return (
    <div
      className="flex w-[78%] min-w-[230px] max-w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* aspect-[320/200] espelha o viewBox das ilustrações (SituacaoIlustracoes.tsx): a altura
          acompanha a largura real do card (que varia de 230 a 300px entre mobile e desktop) em
          vez de uma altura fixa em px — essa altura fixa deixava o desenho pequeno demais nos
          cards mais largos. Mesmo padrão de CrossSellCarousel.tsx (`aspect-[351/177]`). */}
      <div className="aspect-[320/200] w-full shrink-0 overflow-hidden">{Ilustracao && <Ilustracao className="h-full w-full" />}</div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.momento}</p>
        <p className="mt-1 text-sm font-bold leading-snug text-foreground">{item.titulo}</p>
        <p className="mt-1 text-sm leading-snug text-[#374151]">{item.frase}</p>
        <p className="mt-auto pt-1.5 text-xs font-semibold text-[#FD5F31]">{item.tag}</p>
      </div>
    </div>
  );
}

export function SituacoesGrid() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">A vida real não avisa.</h2>
      <p className="mt-1 text-sm text-muted-foreground">{SITUACOES_CONTEUDO.subtitulo}</p>
      <div className="mt-4">
        <PeekCarousel scrollStep={232} ariaLabel="Momentos em que a Saúde por Assinatura ajuda">
          {SITUACOES_CONTEUDO.itens.map((item) => (
            <SituacaoCard key={item.slot} item={item} />
          ))}
        </PeekCarousel>
      </div>
    </section>
  );
}
