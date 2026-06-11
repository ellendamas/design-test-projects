# Parâmetros de URL — Jornada Antecipação FGTS

> **Ambiente de design apenas.**
> Todos os parâmetros são simulações controladas por query string.
> Devem ser substituídos por dados reais da API antes do deploy em produção.

---

## `/painel` — Home (card FGTS)

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?fgts=` | `none` · `autorizado` · `contrato` | Controla o card no "Para você agora" |

O **card do produto FGTS** (grade de serviços) é sempre igual, independente do status:
- Highlight: "Receba seu saldo em até 15 minutos"
- CTA: "Antecipar agora" → `/fgts`

O parâmetro `?fgts=` afeta apenas a seção **"Para você agora"** no header:

```
/painel?fgts=none        → card FGTS padrão na grade, sem card no "Para você agora"
/painel?fgts=autorizado  → card FGTS padrão na grade + card no "Para você agora":
                           "Seu saldo FGTS está disponível!" · R$ 5.841,09 · CTA "Simular agora" → /fgts/simular
/painel?fgts=contrato    → card FGTS padrão na grade + card no "Para você agora":
                           "Próxima parcela FGTS em setembro" · R$ 4.703,82 · CTA "Ver contrato" → /contratos/fgts-001
```

> Todos os valores monetários são mock — TODO: receber da API BMP.

---

## `/fgts` — Landing do produto (F2)

Sem parâmetros de design. CTA fixo → `/fgts/copiloto`.

---

## `/fgts/copiloto` — Copiloto de autorização (F3/F3a/F3b)

Sem parâmetros de URL — sub-passos controlados por estado interno (`useState`).

| Sub-passo | Trigger | Destino |
|-----------|---------|---------|
| `intro` | estado inicial | — |
| `guia` | "Abrir app do FGTS" | — |
| `retorno` | "Já fiz os dois passos" | — |
| → loading | "Consultar meu saldo" ou "Já autorizei" | `/fgts/loading` |

---

## `/fgts/loading` — Consultando saldo (F4)

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?resultado=` | `sem-saldo` | Redireciona imediatamente para `/fgts/sem-saldo` |

```
/fgts/loading                     → loading normal (3 etapas animadas) → /fgts/saldo-disponivel
/fgts/loading?resultado=sem-saldo → redireciona para tela negativa
```

---

## `/fgts/saldo-disponivel` — Saldo encontrado (F4a)

Sem parâmetros de URL. Exibe saldo mock com animação spring, pills informativos e CTA para o simulador.

```
/fgts/saldo-disponivel   → saldo mock R$ 5.841,09, CTA "Simular agora" → /fgts/simular
```

---

## `/fgts/sem-saldo` — Sem saldo elegível (F4b)

Sem parâmetros de design. Cross-sell Saque Fácil, Consignado CLT, Crédito Pessoal (em breve).

---

## `/fgts/simular` — Simulador (F5)

Sem parâmetros de URL — saldo e taxa são mocks internos (TODO: API BMP).

```
/fgts/simular   → saldo mock R$ 5.842,30, chips 1–10 parcelas anuais
```

---

## `/fgts/revisao` — Revisão da oferta (F6)

Recebe dados via `location.state` passado pelo simulador. Se acessado diretamente, usa fallback mock.

```
/fgts/revisao   → usa fallback mock se sem state
```

---

## `/fgts/dados` — Dados para contratação (F7)

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?rg=` | `sim` | Pula o sub-passo de dados pessoais (simula RG já coletado) |
| `?endereco=` | `0`–`5` | Número de endereços salvos simulados |
| `?conta=` | `0`–`5` | Número de contas bancárias salvas simuladas |
| `?passo=` | `banco` | Pula direto para o passo de conta bancária |

**Comportamento dos seletores:**
- `0` → nenhum cadastro, abre formulário direto
- `1` → 1 item salvo, já pré-selecionado
- `2`–`5` → lista com o último marcado como "Último utilizado" e pré-selecionado

```
/fgts/dados                             → todos os formulários do zero (dados pessoais + endereço + banco)
/fgts/dados?rg=sim&endereco=2&conta=2   → tudo pré-preenchido (pula dados pessoais, 2 endereços, 2 contas)
/fgts/dados?rg=sim&endereco=0&conta=0   → só RG cadastrado, endereço e conta do zero
/fgts/dados?passo=banco&conta=3         → pula direto para seleção de conta (3 contas salvas)
```

---

## `/fgts/assinar` — Assinatura (F8)

Sem parâmetros de URL — sub-passos controlados por estado interno (`useState`).

| Sub-passo | Trigger | Destino |
|-----------|---------|---------|
| `contrato` | estado inicial | — |
| `unico_intro` | "Li e aceito o contrato" | — |
| `biometria` | "Continuar para verificação" | auto → `/fgts/confirmacao` após 1.5s |

---

## `/fgts/confirmacao` — Confirmação e sucesso (F9)

Recebe dados via `location.state`. Usa fallbacks mock se acessado diretamente.

---

## Fluxo completo — caminhos de teste

### Caminho feliz (com saldo, tudo do zero)
```
1. /painel?fgts=none
2. → /fgts                (landing)
3. → /fgts/copiloto       (intro → guia → retorno)
4. → /fgts/loading           (3 etapas animadas)
5. → /fgts/saldo-disponivel  (saldo disponível + CTA simular)
6. → /fgts/simular           (saldo em destaque, chips de parcelas)
6. → /fgts/revisao        (breakdown, consentimento)
7. → /fgts/dados          (dados pessoais + endereço + banco)
8. → /fgts/assinar        (contrato → unico_intro → biometria mock 1.5s)
9. → /fgts/confirmacao    (sucesso + card resumo)
```

### Caminho feliz (pré-preenchido — teste mais rápido)
```
1. /fgts/saldo-disponivel
2. → /fgts/simular
2. → /fgts/revisao
3. → /fgts/dados?rg=sim&endereco=2&conta=2
4. → /fgts/assinar
5. → /fgts/confirmacao
```

### Caminho negativo (sem saldo)
```
1. /fgts/loading?resultado=sem-saldo
2. → /fgts/sem-saldo      (accordion de causas, cross-sell)
```

### Timeout no loading (30s)
```
1. /fgts/loading          (aguardar 30s)
2. → exibe CTAs: "Tentar novamente" ou "Voltar para o início"
```

### Card com autorização prévia
```
1. /painel?fgts=autorizado
2. → /fgts/simular
```

### Card com contrato ativo
```
1. /painel?fgts=contrato
2. → /contratos
```
