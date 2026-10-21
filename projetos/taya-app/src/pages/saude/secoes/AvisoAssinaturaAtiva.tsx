// Mesmo card nos dois lugares que precisam dele: a página do produto (logo abaixo do banner)
// e a tela de planos (no lugar dos dois cartões, quando já existe assinatura ativa).
export function AvisoAssinaturaAtiva({ onVerMeuPlano }: { onVerMeuPlano: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-[#FFF3EE] p-5 text-center">
      <p className="text-sm font-bold text-foreground">Você já tem um plano ativo</p>
      <p className="text-sm text-muted-foreground">Veja os detalhes do seu plano em Contratos.</p>
      <button
        type="button"
        onClick={onVerMeuPlano}
        className="mt-1 h-11 rounded-full bg-[#FD5F31] px-6 text-sm font-semibold text-white"
      >
        Ver meu plano
      </button>
    </div>
  );
}
