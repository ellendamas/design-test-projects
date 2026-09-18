export type NotificacaoTipo = "transacional" | "lembrete" | "oferta" | "sistema";

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  grupo: "hoje" | "semana" | "anteriores";
  /** Quando presente, o card de notificação fica clicável e navega pra essa rota. */
  rota?: string;
}

export const notificacoesMock: Notificacao[] = [
  {
    id: "n-001",
    tipo: "transacional",
    titulo: "Parcela debitada com sucesso",
    descricao: "Sua parcela de maio no valor de R$ 627,13 foi descontada em folha normalmente.",
    data: "Hoje, 08:32",
    lida: false,
    grupo: "hoje",
  },
  {
    id: "n-002",
    tipo: "lembrete",
    titulo: "Seu próximo desconto se aproxima",
    descricao: "Seu próximo desconto em folha é dia 28/05. Tudo certo por aqui.",
    data: "Hoje, 07:15",
    lida: false,
    grupo: "hoje",
  },
  {
    id: "n-003",
    tipo: "oferta",
    titulo: "Nova condição disponível para você",
    descricao: "Identificamos uma nova condição para antecipar seu FGTS. Quer dar uma olhada?",
    data: "Ontem, 14:20",
    lida: true,
    grupo: "semana",
  },
  {
    id: "n-004",
    tipo: "sistema",
    titulo: "Endereço atualizado",
    descricao: "Seus dados de endereço foram atualizados com sucesso.",
    data: "Seg, 10:05",
    lida: true,
    grupo: "semana",
  },
];

// DESIGN ONLY — ativada via ?clt=leilao_aprovado no painel (ver NotificacoesContext,
// que lê a URL direto por estar fora do <BrowserRouter>).
// TODO: notificação push real para dispositivo — pendente integração com backend
export const notificacaoLeilaoMock: Notificacao = {
  id: "leilao-clt-001",
  tipo: "oferta",
  titulo: "Oferta de crédito aprovada!",
  descricao: "Você tem uma oferta de Crédito Consignado CLT disponível. Acesse para assinar.",
  data: "Agora",
  lida: false,
  grupo: "hoje",
  rota: "/leilao",
};
