import { CaretRight } from "@phosphor-icons/react";

// Banner de cross-sell pro Crédito Fácil, destaque único (não card de carrossel), altura fixa de
// 141px, aparecendo dentro da seção "Outros produtos disponíveis para você" (CP-12/CP-04 do
// Crédito Pessoal). Mesmo fundo (imagem + gradiente laranja da marca Pode Já) da tela de
// introdução do produto, sem logo do parceiro: o foco aqui é o copy. Ver journey-spec:
// credito-facil-contorno-journey-spec.md
export function CreditoFacilBanner({
  valorEstimado,
  onClick,
}: {
  valorEstimado: number;
  onClick: () => void;
}) {
  const valorFormatado = valorEstimado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[141px] w-full items-center overflow-hidden rounded-2xl text-left shadow-sm"
    >
      <img
        src="/images/banner-intro-credito-facil.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #D94E28 0%, rgba(217, 78, 40, 0.75) 45%, rgba(217, 78, 40, 0.15) 85%)",
        }}
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pl-4 pr-3">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
          Simule até {valorFormatado} com o Crédito Fácil
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
          Dinheiro na conta em minutos, mesmo sem carteira assinada
        </p>
        <span className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-white sm:text-sm">
          Simular agora
          <CaretRight size={12} weight="bold" />
        </span>
      </div>
    </button>
  );
}
