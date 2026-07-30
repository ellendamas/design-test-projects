// Fonte de verdade única para todas as FAQs do app.
// Cada produto importa sua chave. A tela de Dúvidas importa tudo.

export type FaqItem = { q: string; a: string };

export const FAQ: Record<string, FaqItem[]> = {
  "consignado-clt": [
    {
      q: "Quem pode contratar?",
      a: "Qualquer trabalhador com carteira assinada (CLT) ativa. A contratação é 100% digital, sem precisar ir a nenhuma agência.",
    },
    {
      q: "Como funciona o desconto em folha?",
      a: "A parcela é descontada direto no seu salário antes de você receber. Isso garante taxas menores, porque o risco de inadimplência é quase zero.",
    },
    {
      q: "Precisa de aprovação da minha empresa?",
      a: "Não. A consulta é feita diretamente na Carteira de Trabalho Digital. Sua empresa não é notificada nem precisa autorizar nada.",
    },
    {
      q: "Quanto tempo leva para receber?",
      a: "Após a aprovação, o valor cai na sua conta em até 1 dia útil. Em muitos casos, o crédito aparece no mesmo dia.",
    },
  ],

  fgts: [
    {
      q: "O que é o Saque Aniversário?",
      a: "É uma modalidade do FGTS que permite sacar uma parte do saldo todo ano, no mês do seu aniversário. Você precisa optar por ela no app do FGTS para poder antecipar.",
    },
    {
      q: "Preciso optar pelo Saque Aniversário antes?",
      a: "Sim. Se você ainda não optou, a gente te guia pelo processo — leva menos de 2 minutos no app do FGTS.",
    },
    {
      q: "Quem pode antecipar?",
      a: "Qualquer trabalhador com FGTS ativo que tenha optado pelo Saque Aniversário. Não há consulta ao Serasa ou análise de crédito.",
    },
    {
      q: "Quanto tempo leva para receber?",
      a: "Após a aprovação, o valor cai na sua conta em até 15 minutos.",
    },
  ],

  "credito-pessoal": [
    {
      q: "Quem pode contratar?",
      a: "Qualquer pessoa física com CPF regular, maior de 18 anos e com renda comprovável. Não é necessário ter vínculo empregatício CLT nem FGTS.",
    },
    {
      q: "Precisa de garantia?",
      a: "Não. O Crédito Pessoal da Zema Financeira é um crédito sem garantia real — não é preciso colocar bens como garantia para contratar.",
    },
    {
      q: "Em quanto tempo o dinheiro cai?",
      a: "Após a aprovação e assinatura do contrato, o valor é transferido em até 1 dia útil. Na maioria dos casos, o crédito aparece no mesmo dia.",
    },
    {
      q: "Afeta meu score de crédito?",
      a: "A consulta inicial é feita de forma simplificada. Em caso de aprovação e contratação, o contrato é registrado nas bureaus de crédito conforme exigido pelo Banco Central.",
    },
  ],

  assistencias: [
    {
      q: "Quem pode contratar?",
      a: "Todos os clientes cadastrados no Pode Já com CPF validado.",
    },
    {
      q: "Preciso contratar todas as categorias?",
      a: "Não. Você escolhe apenas as assistências que fazem sentido para você e sua família.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "Uma mensalidade acessível debitada diretamente pelo app. Sem fidelidade, sem surpresa.",
    },
    {
      q: "Posso incluir minha família?",
      a: "Sim. Algumas categorias permitem até 8 dependentes sem necessidade de grau de parentesco.",
    },
  ],

  energia: [
    {
      q: "Isso é gratuito?",
      a: "Sim. Você não paga nada para fazer a análise. A economia começa a aparecer diretamente na sua conta de luz.",
    },
    {
      q: "Precisa trocar algo em casa?",
      a: "Não. Nenhuma obra, nenhum equipamento novo. Tudo acontece na negociação da sua energia, sem impacto no seu dia a dia.",
    },
    {
      q: "Funciona para apartamento?",
      a: "Sim, funciona para residências, apartamentos e comércios de pequeno porte em todo o Brasil.",
    },
    {
      q: "Quanto tempo leva para começar a economizar?",
      a: "Após a análise, o processo costuma levar de 30 a 60 dias para a economia aparecer na sua fatura.",
    },
  ],

  "seguro-vida": [
    {
      q: "Quem pode contratar?",
      a: "Pessoas entre 18 e 65 anos, residentes no Brasil.",
    },
    {
      q: "Como acionar o seguro?",
      a: "Em caso de sinistro, entre em contato pelo nosso canal de atendimento. Nossa equipe vai te orientar em cada etapa.",
    },
  ],
};

// Mapeamento de chave → label de categoria para exibição na tela de Dúvidas
export const FAQ_CATEGORIAS: Record<string, string> = {
  "consignado-clt": "Crédito Consignado CLT",
  fgts: "Antecipação FGTS",
  "credito-pessoal": "Crédito Pessoal",
  assistencias: "Assistências",
  energia: "Energia",
  "seguro-vida": "Seguro de Vida",
};
