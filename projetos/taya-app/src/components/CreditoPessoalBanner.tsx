import { CaretRight } from "@phosphor-icons/react";

// Banner de cross-sell pro Crédito Pessoal, modelo passado pela Ellen em 18/11/2026 (Figma).
// Vem como destaque único (não card de carrossel) nas telas de inelegibilidade do Consignado
// CLT: pré-consentimento (carteira assinada) e pós-consentimento (outros motivos). Altura fixa
// de 141px (a mesma de quando era card do carrossel de cross-sell): só a largura é fluida.
export function CreditoPessoalBanner({ onNavegar }: { onNavegar: (rota: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavegar("/credito-pessoal")}
      className="relative flex h-[141px] w-full items-center overflow-hidden rounded-2xl text-left shadow-sm"
    >
      <img src="/images/banner-credito-pessoal-fundo.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pl-4 pr-1">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">Crédito Pessoal</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
          Dinheiro na conta em minutos, sem precisar de carteira assinada
        </p>
        <span className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-white sm:text-sm">
          Simular agora
          <CaretRight size={12} weight="bold" />
        </span>
      </div>

      <div className="relative z-10 h-full w-[90px] shrink-0 sm:w-[120px]">
        <img src="/images/banner-credito-pessoal-blob.svg" alt="" className="absolute bottom-[-10%] right-[-10%] h-[85%] w-[85%] object-contain" />
        <img src="/images/pessoa-credito-pessoal.png" alt="" className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom" />
      </div>
    </button>
  );
}
