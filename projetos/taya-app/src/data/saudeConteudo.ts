import { PARCEIRO_NOME } from "@/config/parceiro";

// Conteúdo tipado da página do produto Saúde por Assinatura — fonte única usada pelos dois
// modos (`app`, dentro de Assistências, e `publica`, a LP externa da etapa 2). Textos copiados
// exatamente de docs/saude-conteudo-fonte.md (versão 2, 21/10/2026); qualquer mudança de copy
// deve ser feita nos dois lugares juntos, pra não divergir.

export type ModoSaudeProduto = "app" | "publica";

// [A CONFIRMAR com o Bruno] — caminho real do cadastro quando vem da LP pública. Fica numa
// constante só, não espalhado pelos call sites, porque é o tipo de decisão que muda sem aviso
// quando o fluxo de cadastro for revisado de verdade (ex: um passo a mais, um domínio próprio).
export const CADASTRO_PATH_PUBLICO = "/cadastro";

export const HERO_CONTEUDO = {
  etiqueta: {
    app: "Saúde por Assinatura",
    publica: `Saúde por Assinatura na Pode Já`,
  } satisfies Record<ModoSaudeProduto, string>,
  titulo: "Cuide de quem você ama, sem pesar no bolso.",
  subtitulo: `Médico por vídeo a qualquer hora e descontos em remédios, consultas, exames e dentista. A partir de R$ 39,90 por mês.`,
  botaoPrincipalPublico: "Quero conhecer os planos",
  linkComoFunciona: "Como funciona",
  chips: ["Clínico geral 24h", "13 especialidades por vídeo", "Até 80% em remédios"] as const,
  /** Índice (0-based) dos chips acima que só aparecem no desktop — "13 especialidades por vídeo". */
  chipsSoDesktop: [1] as const,
  convitePublico: "Alguém que se importa com você te enviou este link.",
};

export const FAIXA_CONFIANCA = [
  "Sem carência",
  "Sem declaração de saúde",
  "Mais de 31 mil farmácias",
  "Contratação 100% online",
];

export type Situacao = {
  slot: string;
  momento: string;
  titulo: string;
  frase: string;
  tag: string;
};

export const SITUACOES_CONTEUDO = {
  subtitulo: "Momentos em que a Saúde por Assinatura ajuda.",
  itens: [
    { slot: "A2", momento: "3h da manhã", titulo: "A febre não baixa. E agora?", frase: "Fale com um médico por vídeo, a qualquer hora, sem sair de casa.", tag: "Clínico geral 24h" },
    { slot: "A3", momento: "Na farmácia", titulo: "A receita chegou e o valor assustou.", frase: "Até 80% de desconto em mais de 31 mil farmácias.", tag: "Até 80% em remédios" },
    { slot: "A4", momento: "Dor de dente", titulo: "Dor de dente não espera o fim do mês.", frase: "Dentista da rede parceira com valor reduzido, também no Familiar.", tag: "Dentista com valor reduzido" },
    { slot: "A5", momento: "Cuidar dos pais", titulo: "Seus pais também precisam de médico.", frase: "No Familiar, até 3 dependentes, sem comprovar vínculo e sem limite de idade.", tag: "Até 3 dependentes" },
  ] satisfies Situacao[],
  fraseFinal: "Não passe mais por isso.",
  cta: "Escolher meu plano",
};

export type Especialidade = {
  slot: string;
  nome: string;
  /** Nome completo pra leitor de tela, quando o nome visível é uma abreviação (ex: Otorrino). */
  nomeAcessivel?: string;
  selo?: string;
};

export const ESPECIALIDADES_CONTEUDO = {
  subtitulo: "Clínico geral 24 horas, todos os dias. Especialistas de segunda a sexta, das 9h às 18h, conforme a agenda.",
  itens: [
    { slot: "E01", nome: "Clínico Geral", selo: "24h, todos os dias" },
    { slot: "E02", nome: "Cardiologia" },
    { slot: "E03", nome: "Dermatologia" },
    { slot: "E04", nome: "Endocrinologia" },
    { slot: "E05", nome: "Gastroenterologia" },
    { slot: "E06", nome: "Geriatria" },
    { slot: "E07", nome: "Ginecologia" },
    { slot: "E08", nome: "Neurologia" },
    { slot: "E09", nome: "Ortopedia e Traumatologia" },
    { slot: "E10", nome: "Otorrino", nomeAcessivel: "Otorrinolaringologia" },
    { slot: "E11", nome: "Pediatria" },
    { slot: "E12", nome: "Psiquiatria" },
    { slot: "E13", nome: "Urologia" },
  ] satisfies Especialidade[],
};

export const REDE_PRESENCIAL_CONTEUDO = {
  subtitulo: "Consultas, exames, bem-estar e dentista na rede parceira. Você paga direto ao parceiro, com o valor reduzido.",
  itens: [
    { slot: "R1", titulo: "Especialidades médicas", exemplos: "Clínico geral, cardiologia, pediatria, ginecologia, ortopedia e mais" },
    { slot: "R2", titulo: "Exames e diagnósticos", exemplos: "Exames de laboratório e de imagem, eletrocardiograma, endoscopia, mamografia e raio-X" },
    { slot: "R3", titulo: "Bem-estar", exemplos: "Fisioterapia, nutricionista, pilates, acupuntura, massoterapia e estética" },
    { slot: "R4", titulo: "Dentista", exemplos: "Prevenção, restaurações, canal, gengiva, extrações e tratamento infantil" },
  ],
  nota: "A disponibilidade varia por cidade e por agenda.",
};

export const PASSOS_CONTEUDO = {
  passo1: { titulo: "Escolha o plano", sub: "Individual ou Familiar, no prazo que preferir." },
  passo2: {
    app: { titulo: "Confirme seus dados", sub: "Celular e e-mail, em poucos minutos." },
    publica: { titulo: `Crie sua conta na Pode Já`, sub: "Sem precisar de crédito." },
  } satisfies Record<ModoSaudeProduto, { titulo: string; sub: string }>,
  passo3: { titulo: "Pague e use", sub: "Pix. Ativa em até 48 horas úteis." },
};

export type PlanoConteudo = {
  etiqueta: string;
  paraQuem: string;
  itens: string[];
  cta: string;
};

export const PLANOS_CONTEUDO: Record<"mensal" | "familiar", PlanoConteudo> = {
  mensal: {
    etiqueta: "Saúde por Assinatura",
    paraQuem: "Para você.",
    itens: ["Clínico geral por vídeo 24h e orientação de saúde", "Descontos em medicamentos", "Descontos em consultas, exames, bem-estar e dentista"],
    cta: "Contratar Individual",
  },
  familiar: {
    etiqueta: "Saúde por Assinatura",
    paraQuem: "Para você e quem você quer cuidar.",
    itens: ["Os mesmos benefícios do Individual", "Você + até 3 dependentes, de qualquer idade e sem comprovar vínculo"],
    cta: "Contratar Familiar",
  },
};

export const PLANOS_BADGES = [
  "Cobrança mensal no cartão de crédito ou no Pix",
  "Permanência mínima de 3 meses; depois, cancelamento sem multa",
];

export const PLANOS_NOTA = "Bom saber: Saúde por Assinatura não é plano de saúde. Não cobre internação nem cirurgia, e a telemedicina não substitui o atendimento de urgência.";

export type FaqItemConteudo = { id?: string; q: string; a: string };

// As 6 primeiras ficam visíveis de cara; as demais entram em "Ver mais perguntas". A dúvida de
// id `faq-presencial` serve de âncora futura (link direto pra essa pergunta).
export const DUVIDAS_VISIVEIS: FaqItemConteudo[] = [
  { q: "É plano de saúde?", a: "Não. Saúde por Assinatura reúne telemedicina, orientação e descontos. Não cobre internação nem cirurgia." },
  { q: "E se for uma emergência?", a: "A telemedicina não substitui urgência e emergência. Procure um pronto-socorro ou ligue 192 (SAMU)." },
  { q: "Como funciona o atendimento por vídeo?", a: "O clínico geral atende 24 horas, todos os dias. Os especialistas atendem de segunda a sexta, das 9h às 18h, exceto feriados, conforme a agenda. Cada usuário ativo pode usar até 15 vezes por mês, e no Familiar o benefício vale para os dependentes." },
  { q: "Posso cancelar?", a: `Sim. Depois de 3 meses, sem multa. Peça ao atendimento da Pode Já, no app. O cancelamento vale na hora: os benefícios seguem até o fim do período pago, não há devolução do valor e só dá para contratar de novo depois de 3 meses.` },
  { q: "Como uso o desconto na farmácia?", a: "O desconto chega a até 80% e varia conforme o remédio e a farmácia. Ative o benefício no app na primeira vez que usar. Na farmácia, mostre documento com foto e CPF ou a carteirinha digital." },
  { q: `Preciso ter crédito na Pode Já?`, a: "Não. A contratação é opcional e não depende de crédito nem de outro produto." },
];

export const DUVIDAS_EXTRA: FaqItemConteudo[] = [
  { q: "Tem dentista?", a: "Sim, inclusive no Familiar. Odontologia, odontopediatria e ortodontia fazem parte da rede presencial. Você paga direto ao dentista, com o valor reduzido, e os procedimentos seguem as condições do parceiro." },
  { q: "Meu filho pode usar a telemedicina?", a: "Pode, no Familiar. O clínico geral atende a qualquer hora, e a pediatria atende de segunda a sexta, das 9h às 18h, conforme a agenda. Os dependentes podem ser de qualquer idade." },
  { q: "Em quanto tempo começo a usar?", a: "A ativação leva até 48 horas úteis depois do pagamento. O acesso chega por e-mail ou WhatsApp." },
  { id: "faq-presencial", q: "Quais especialidades e exames existem na rede presencial?", a: "A rede presencial tem dezenas de especialidades, como clínico geral, cardiologia, pediatria, neurologia, ginecologia, ortopedia, dermatologia, oftalmologia e odontologia, além de exames como hemograma, glicemia, raio-X e ressonância. Também tem serviços de bem-estar, como fisioterapia, nutricionista, pilates e acupuntura, e serviços odontológicos, como prevenção, restaurações e canal. Depende da rede e da agenda. Você paga direto ao parceiro, com o valor reduzido." },
  { q: "Posso incluir minha família?", a: "Sim, no Familiar: até 3 dependentes, sem comprovar vínculo e sem limite de idade. O cadastro de cada dependente é feito depois, no app do parceiro de saúde. Eles também usam a telemedicina e os descontos." },
  { q: "Como pago?", a: "Com Pix. Você autoriza o Pix automático uma vez, e a cobrança acontece todo mês no dia que você escolher." },
  { q: "Meus dados estão seguros?", a: "Tratamos seus dados conforme a LGPD. Veja a Política de Privacidade." },
  { q: "Quem presta o serviço?", a: `Parceiro de saúde: ${PARCEIRO_NOME}. A Pode Já oferece o plano, o cadastro e o atendimento.` },
];

export const FECHAMENTO_CONTEUDO = {
  titulo: "Hoje é um bom dia para cuidar de quem você ama.",
  texto: "Escolha seu plano e tenha um médico por vídeo a qualquer hora.",
  cta: "Escolher meu plano",
};

export const RODAPE_LEGAL_CONTEUDO = {
  linhaLegal: `Saúde por Assinatura não é plano de saúde, convênio ou operadora e não cobre internação nem cirurgia. Parceiro de saúde: ${PARCEIRO_NOME}. Os descontos variam conforme medicamento, parceiro e rede.`,
  razaoSocialPublico: "[Razão social e CNPJ do parceiro e da Pode Já: em confirmação]",
};

export const IG01_CONTEUDO = {
  titulo: "Indique e ganhe",
  texto: "Indique e receba 10% da primeira mensalidade de quem contratar pelo seu link.",
  cta: "Quero indicar",
};
