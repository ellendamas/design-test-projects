# Parâmetros de URL — Jornada Consignado CLT

> **Ambiente de design apenas.**
> Todos os parâmetros são simulações controladas por query string.
> Devem ser substituídos por dados reais da API antes do deploy em produção.

---

## `/painel` — Home

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?clt=` | `none` · `consultando` · `oferta` · `contrato` | Estado do card CLT na home |

```
/painel?clt=none          → card padrão, CTA "Consultar crédito CLT"
/painel?clt=consultando   → card sem destaque, highlight "Consultando sua oferta..."
/painel?clt=oferta        → card laranja, "Você tem até R$ 32.533,83 disponíveis"
/painel?clt=contrato      → card com parcela ativa, navega para /contratos
```

---

## `/consignado-clt/oferta` — Dashboard do produto

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?estado=` | `consultando` · `oferta` · `contrato` | Estado exibido na dashboard |

```
/consignado-clt/oferta?estado=consultando
/consignado-clt/oferta?estado=oferta
/consignado-clt/oferta?estado=contrato
```

---

## `/consignado-clt/loading` — Loading do leilão

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?resultado=` | `negativo` | Simula retorno sem oferta → redireciona para `/consignado-clt/sem-oferta` |

```
/consignado-clt/loading?resultado=negativo  → tela de sem oferta com cross-sell
```

---

## `/consignado-clt/dados` — Endereço e conta bancária

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?endereco=` | `0` – `5` | Número de endereços salvos simulados |
| `?conta=` | `0` – `5` | Número de contas bancárias salvas simuladas |
| `?passo=` | `banco` | Pula direto para o passo de conta bancária (ignora endereço) |

**Comportamento dos seletores:**
- `0` → nenhum cadastro, abre formulário direto
- `1` → 1 item salvo, já pré-selecionado
- `2`–`5` → lista com o último marcado como "Último utilizado" e pré-selecionado

```
/consignado-clt/dados?endereco=0&conta=0      → ambos sem cadastro (formulários diretos)
/consignado-clt/dados?endereco=1&conta=1      → 1 de cada, pré-selecionados
/consignado-clt/dados?endereco=3&conta=2      → 3 endereços + 2 contas
/consignado-clt/dados?passo=banco&conta=3     → cai direto nas 3 contas (bypassa endereço)
/consignado-clt/dados?endereco=5&conta=5      → limite máximo (5 de cada)
```

---

## `/minha-conta/dados-bancarios` — Configurações de conta

| Parâmetro | Valores | Efeito |
|-----------|---------|--------|
| `?conta=` | `0` – `5` | Número de contas bancárias salvas simuladas |

```
/minha-conta/dados-bancarios?conta=0   → sem conta (formulário direto)
/minha-conta/dados-bancarios?conta=3   → 3 contas, última pré-selecionada
```

---

## Fluxo completo — caminhos de teste

### Caminho feliz (com oferta)
```
1. /painel?clt=oferta
2. → /consignado-clt/simular
3. → /consignado-clt/revisao
4. → /consignado-clt/dados?endereco=2&conta=2
5. → /consignado-clt/assinar   (tela Unico)
6. → /consignado-clt/confirmacao
```

### Caminho negativo (sem margem)
```
1. /painel?clt=consultando
2. → /consignado-clt/loading?resultado=negativo
3. → /consignado-clt/sem-oferta  (cross-sell Saque Fácil)
```

### Timeout no leilão
```
1. /consignado-clt/loading  (aguardar 30s)
2. → exibe CTAs de saída: "Voltar para o início" ou "Aguardar aqui"
3. → /consignado-clt/aguardando
```
