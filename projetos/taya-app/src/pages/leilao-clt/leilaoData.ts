// Dados mock da jornada Leilão CLT — TODO: substituir pelos dados reais decodificados do token do link
export const OFERTA_LEILAO = {
  valor: 32533.83,
  parcelas: 48,
  valorParcela: 891.2,
  taxaMensal: 2.49,
};

// Lead mock — nome/CPF já verificados via CTPS Digital, viriam decodificados do token do link
// TODO: autenticação via token do link — definição pendente com time técnico
export const LEAD_MOCK = {
  nome: "Ana Souza",
  cpf: "123.456.789-00",
};

export function dataExpiracaoExtenso(diasAPartirDeHoje: number): string {
  const data = new Date();
  data.setDate(data.getDate() + diasAPartirDeHoje);
  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
