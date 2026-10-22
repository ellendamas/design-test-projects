// Mesmo card nos dois lugares que precisam dele: a página do produto (logo abaixo do banner)
// e a tela de planos (no lugar dos dois cartões, quando já existe alguma assinatura em algum
// estado diferente de "cancelado"). Prompt 1e (22/10): título/texto/botão guiados por prop —
// antes era fixo "Você já tem um plano ativo"; agora cada estado (AVISO_SAUDE_POR_ESTADO, em
// estadosAssinaturaConteudo.ts) passa o próprio conteúdo, sem duplicar a tabela de estados aqui.
export function AvisoAssinaturaAtiva({
  titulo,
  texto,
  botaoLabel,
  onBotao,
}: {
  titulo: string;
  texto: string;
  botaoLabel: string;
  onBotao: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-[#FFF3EE] p-5 text-center">
      <p className="text-sm font-bold text-foreground">{titulo}</p>
      <p className="text-sm text-muted-foreground">{texto}</p>
      <button
        type="button"
        onClick={onBotao}
        className="mt-1 h-11 rounded-full bg-[#FD5F31] px-6 text-sm font-semibold text-white"
      >
        {botaoLabel}
      </button>
    </div>
  );
}
