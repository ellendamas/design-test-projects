import { PeekCarousel } from "./PeekCarousel";

// Banner de cross-sell — imagem de fundo + overlay pro contraste do texto, igual ao
// tratamento do hero da página de Assistências. Título, descrição e preço são textos reais
// no código (não vêm embutidos numa imagem exportada), pra dar pra trocar o copy sem
// depender de reexportar asset. Quando o item não tem preço (produtos sem valor fixo
// divulgado ainda), mostra um texto de CTA curto no lugar da pílula.
export type CrossSellBannerItem = {
  key: string;
  imagem: string;
  titulo: string;
  descricao: string;
  preco?: string;
  rota: string;
};

// Assets de cross-sell (public/images/cross-sell-*.png) já vêm com a foto composta à direita
// e uma área sólida à esquerda reservada pro texto — por isso o overlay aqui é um gradiente
// horizontal na cor da marca (mesmo tratamento do hero da página de Assistências), não um
// escurecimento genérico: garante contraste do texto em cima da área sólida independente da
// cor de fundo original do asset, e deixa a foto visível à direita.
function CrossSellBannerCard({ item, onNavegar }: { item: CrossSellBannerItem; onNavegar: (rota: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavegar(item.rota)}
      className="relative block aspect-[351/177] w-[280px] min-w-[280px] shrink-0 overflow-hidden rounded-2xl text-left shadow-sm"
      style={{ scrollSnapAlign: "start" }}
    >
      <img
        src={item.imagem}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-right"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #D94E28 0%, rgba(217, 78, 40, 0.55) 45%, rgba(217, 78, 40, 0.05) 75%)",
        }}
      />
      <div className="relative z-10 flex h-full max-w-[75%] flex-col justify-center gap-1 p-4">
        <h3 className="text-sm font-bold leading-snug text-white line-clamp-2">{item.titulo}</h3>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/85">{item.descricao}</p>
        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#D94E28]">
          {item.preco ?? "Conhecer"}
        </span>
      </div>
    </button>
  );
}

export function CrossSellCarousel({ items, onNavegar }: { items: CrossSellBannerItem[]; onNavegar: (rota: string) => void }) {
  return (
    <PeekCarousel scrollStep={300}>
      {items.map((item) => (
        <CrossSellBannerCard key={item.key} item={item} onNavegar={onNavegar} />
      ))}
    </PeekCarousel>
  );
}
