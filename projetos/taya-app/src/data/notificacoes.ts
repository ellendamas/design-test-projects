export type NotificacaoTipo = "transacional" | "lembrete" | "oferta" | "sistema";

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  grupo: "hoje" | "semana" | "anteriores";
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
