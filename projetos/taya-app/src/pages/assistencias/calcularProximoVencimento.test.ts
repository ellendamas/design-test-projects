// Testes da regra de vencimento (Prompt 1f, seção 1). Roda sem dependência nova, com o runner
// nativo do Node (24+): `node --test src/pages/assistencias/calcularProximoVencimento.test.ts`
// a partir de projetos/taya-app. Importa direto do arquivo fonte (sem alias "@/", que só existe
// no Vite/tsconfig do app, não no Node puro).
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularProximoVencimento, formatarDataBR, parseDataISOLocal } from "./shared.ts";

const casos: { contratacao: string; dia: 5 | 10 | 15 | 20 | 25; esperado: string }[] = [
  { contratacao: "2026-10-22", dia: 5, esperado: "05/12/2026" },
  { contratacao: "2026-10-22", dia: 25, esperado: "25/11/2026" },
  { contratacao: "2026-10-22", dia: 20, esperado: "20/12/2026" },
  { contratacao: "2026-10-22", dia: 10, esperado: "10/12/2026" },
  { contratacao: "2026-10-22", dia: 15, esperado: "15/12/2026" },
  { contratacao: "2026-10-25", dia: 25, esperado: "25/11/2026" },
  { contratacao: "2026-12-31", dia: 5, esperado: "05/02/2027" },
];

for (const { contratacao, dia, esperado } of casos) {
  test(`contratação ${contratacao.split("-").reverse().join("/")}, dia ${dia} -> ${esperado}`, () => {
    const resultado = calcularProximoVencimento(parseDataISOLocal(contratacao), dia);
    assert.equal(formatarDataBR(resultado), esperado);
  });
}

test("formatarDataBR preserva zero à esquerda em dia e mês", () => {
  assert.equal(formatarDataBR(new Date(2027, 1, 5)), "05/02/2027");
});

test("parseDataISOLocal não desvia de fuso (sem o -1 dia do construtor de string ISO)", () => {
  const data = parseDataISOLocal("2026-01-01");
  assert.equal(data.getFullYear(), 2026);
  assert.equal(data.getMonth(), 0);
  assert.equal(data.getDate(), 1);
});
