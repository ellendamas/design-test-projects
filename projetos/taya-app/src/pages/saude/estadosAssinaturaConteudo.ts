import type { EstadoAssinatura } from "./estadoAssinaturaDesignOnly";

// Ações que os botões dos estados podem disparar — cada tela que consome este conteúdo decide
// o que cada uma faz de verdade (navigate, etc.), este arquivo só guarda o texto e qual ação
// cada botão representa, pra não duplicar a tabela de estados em cada tela.
export type AcaoEstadoAssinatura = "acessar_benemed" | "pagar_pix" | "gerar_novo_pix" | "regularizar" | "ver_meu_plano" | "contratar_de_novo";

// Todas as 7 entradas continuam aqui (Prompt 1h, 23/10) mesmo "ativacao"/"cancelamento"/"atraso"
// não aparecendo mais na tela — só não são mais alcançáveis por `estadoAssinaturaEfetivo()`, que
// é o que toda tela nova deve usar pra ler o estado.
export const CHIP_ESTADO_ASSINATURA: Record<EstadoAssinatura, { label: string; corTexto: string; corPonto: string }> = {
  ativo: { label: "Ativo", corTexto: "text-green-700", corPonto: "bg-green-500" },
  ativacao: { label: "Em ativação", corTexto: "text-[#B45309]", corPonto: "bg-[#F59E0B]" },
  pendente: { label: "Pagamento pendente", corTexto: "text-[#B45309]", corPonto: "bg-[#F59E0B]" },
  atraso: { label: "Pagamento em atraso", corTexto: "text-red-700", corPonto: "bg-red-500" },
  cancelamento: { label: "Cancelamento solicitado", corTexto: "text-muted-foreground", corPonto: "bg-[#9CA3AF]" },
  cancelado: { label: "Cancelado", corTexto: "text-muted-foreground", corPonto: "bg-[#9CA3AF]" },
  encerrado: { label: "Encerrado", corTexto: "text-muted-foreground", corPonto: "bg-[#9CA3AF]" },
};

// Minha assinatura — mensagem extra (null = nenhuma, layout de hoje) e botão (null = nenhum).
export const MINHA_ASSINATURA_POR_ESTADO: Record<
  EstadoAssinatura,
  { mensagem: string | null; botao: { label: string; acao: AcaoEstadoAssinatura } | null }
> = {
  ativo: { mensagem: null, botao: { label: "Acessar meu plano", acao: "acessar_benemed" } },
  ativacao: { mensagem: "Estamos ativando seu plano. Isso leva até 48 horas úteis.", botao: null },
  pendente: { mensagem: "Ainda não recebemos o pagamento. Pague com Pix para ativar seu plano.", botao: { label: "Pagar com Pix", acao: "pagar_pix" } },
  atraso: { mensagem: "Não conseguimos fazer a cobrança deste mês. Regularize para continuar usando seu plano.", botao: { label: "Regularizar", acao: "regularizar" } },
  cancelamento: { mensagem: "Recebemos seu pedido de cancelamento. Nosso atendimento confirma por aqui.", botao: null },
  cancelado: { mensagem: "Seu plano foi cancelado. Você pode contratar de novo depois de 3 meses.", botao: null },
  encerrado: { mensagem: "Seu plano chegou ao fim. Contrate de novo para continuar usando.", botao: { label: "Contratar de novo", acao: "contratar_de_novo" } },
};

// Variante de `pendente` com o código Pix vencido (`?pixVencido=1`) — texto e botão diferentes
// só nesse cruzamento específico. Função em vez de mais uma chave no Record acima pra não
// duplicar as outras 6 entradas por causa de uma combinação só.
export function minhaAssinaturaConteudo(estado: EstadoAssinatura, pixVencido: boolean) {
  if (estado === "pendente" && pixVencido) {
    return {
      mensagem: "O código Pix venceu. Gere um novo para ativar seu plano.",
      botao: { label: "Gerar novo Pix", acao: "gerar_novo_pix" as const },
    };
  }
  return MINHA_ASSINATURA_POR_ESTADO[estado];
}

// "Cancelar assinatura" na lista de Minha assinatura só aparece nestes dois estados — na prática
// só "ativo" é alcançável hoje (Prompt 1h escondeu "ativacao"), mantido assim mesmo pra não
// apagar a regra original.
export const ESTADOS_COM_CANCELAR: readonly EstadoAssinatura[] = ["ativo", "ativacao"];

// Aviso do topo na página da Saúde e, quando aplicável, na tela de Planos. `cancelado` fica de
// fora do tipo de propósito: nesse estado não existe aviso nenhum.
export const AVISO_SAUDE_POR_ESTADO: Record<
  Exclude<EstadoAssinatura, "cancelado">,
  { titulo: string; texto: string; botao: { label: string; acao: AcaoEstadoAssinatura } }
> = {
  ativo: { titulo: "Você já tem um plano ativo", texto: "Veja os detalhes do seu plano em Contratos.", botao: { label: "Ver meu plano", acao: "ver_meu_plano" } },
  ativacao: { titulo: "Seu plano está em ativação", texto: "Isso leva até 48 horas úteis. Acompanhe em Contratos.", botao: { label: "Ver meu plano", acao: "ver_meu_plano" } },
  pendente: { titulo: "Falta o pagamento do seu plano", texto: "Pague com Pix para ativar.", botao: { label: "Pagar com Pix", acao: "pagar_pix" } },
  atraso: { titulo: "Seu pagamento está em atraso", texto: "Regularize para continuar usando seu plano.", botao: { label: "Regularizar", acao: "regularizar" } },
  cancelamento: { titulo: "Cancelamento solicitado", texto: "Acompanhe em Contratos.", botao: { label: "Ver meu plano", acao: "ver_meu_plano" } },
  encerrado: { titulo: "Seu plano chegou ao fim", texto: "Contrate de novo para continuar usando.", botao: { label: "Contratar de novo", acao: "contratar_de_novo" } },
};

// Mesma variante de Pix vencido, pro aviso da página da Saúde — aqui só o botão muda (título e
// texto do `pendente` continuam os mesmos nos dois casos, só o rótulo do botão troca).
export function avisoSaudeConteudo(estado: Exclude<EstadoAssinatura, "cancelado">, pixVencido: boolean) {
  const base = AVISO_SAUDE_POR_ESTADO[estado];
  if (estado === "pendente" && pixVencido) {
    return { ...base, botao: { label: "Gerar novo Pix", acao: "gerar_novo_pix" as const } };
  }
  return base;
}

// O card "Indique e ganhe" na página da Saúde só aparece em "ativo" (Prompt 1h, 23/10 — antes
// também aparecia em "ativacao", que não é mais alcançável pela tela).
export const ESTADOS_COM_INDIQUE_E_GANHE: readonly EstadoAssinatura[] = ["ativo"];
