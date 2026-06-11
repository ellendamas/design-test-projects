import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CaretDown,
  CheckCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type SubPasso = "intro" | "guia" | "retorno";

// ---------------------------------------------------------------------------
// Timeline de passos
// ---------------------------------------------------------------------------

function Timeline({ passos }: { passos: { texto: string; detalhe?: string }[] }) {
  return (
    <div className="relative">
      {passos.map((passo, index) => (
        <div key={index} className="flex gap-3">
          {/* Coluna da linha */}
          <div className="flex flex-col items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF0E7] text-xs font-bold text-[#E8590A]">
              {index + 1}
            </div>
            {index < passos.length - 1 && (
              <div className="my-1 w-px flex-1 bg-border" />
            )}
          </div>
          {/* Conteúdo */}
          <div className="pb-4">
            <p className="text-sm font-medium text-foreground">{passo.texto}</p>
            {passo.detalhe && (
              <p className="mt-0.5 text-xs text-muted-foreground">{passo.detalhe}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-passo: intro (F3)
// ---------------------------------------------------------------------------

function SubPassoIntro({ onAbrirApp, onJaAutorizei }: { onAbrirApp: () => void; onJaAutorizei: () => void }) {
  const passos = [
    { num: 1, texto: "Você abre o app do FGTS", tempo: "~30 segundos" },
    { num: 2, texto: "Autoriza a BMP a consultar seu saldo", tempo: "~1 minuto" },
    { num: 3, texto: "Volta aqui e a gente cuida do resto", tempo: "imediato" },
  ];

  return (
    <div className="space-y-4">
      {/* Card principal */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        {/* Logos combinados */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8590A]">
            <span className="text-sm font-bold text-white">s.</span>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-xs font-bold text-white">FGTS</span>
          </div>
        </div>

        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ETAPA NECESSÁRIA
        </p>
        <p className="mb-2 text-center text-xl font-semibold text-foreground">
          Precisamos de 2 minutos no app do FGTS
        </p>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          Para consultar seu saldo e oferecer as melhores condições, precisamos que você
          autorize nossa parceira BMP a acessar seus dados no FGTS. É seguro, rápido e
          exigido pela Caixa Econômica Federal.
        </p>
      </div>

      {/* Card de credibilidade BMP */}
      <div className="rounded-xl bg-muted p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#E8590A]" />
          <div>
            <p className="text-xs font-medium text-foreground">BMP SOCIEDADE DE CREDITO DIRETO S.A — autorizada pelo Banco Central</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              A BMP SOCIEDADE DE CREDITO DIRETO S.A é nossa parceira financeira regulamentada. A autorização é exigida
              pela Caixa para qualquer antecipação de FGTS.
              {/* TODO: adicionar link de verificação no BACEN */}
            </p>
          </div>
        </div>
      </div>

      {/* Card "O que vai acontecer" */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-foreground">O que vai acontecer</p>
        <div className="space-y-3">
          {passos.map((p) => (
            <div key={p.num} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FEF0E7] text-sm font-bold text-[#E8590A]">
                {p.num}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{p.texto}</p>
                <p className="text-xs text-muted-foreground">{p.tempo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="sticky bottom-20 z-40 space-y-1 bg-background pb-6 pt-3 md:bottom-0">
        <button
          type="button"
          onClick={onAbrirApp}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
        >
          Abrir app do FGTS
        </button>
        <button
          type="button"
          onClick={onJaAutorizei}
          className="w-full py-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Já autorizei
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-passo: guia (F3a)
// ---------------------------------------------------------------------------

const passosAcc1 = [
  { texto: "Abra o app do FGTS" },
  { texto: 'Toque em "Mais" no menu inferior' },
  { texto: 'Selecione "Sistemática de saque"' },
  { texto: 'Escolha "Saque-Aniversário"' },
  { texto: "Confirme a opção" },
];

const passosAcc2 = [
  { texto: 'No app do FGTS, toque em "Mais"' },
  { texto: 'Selecione "Autorizar movimentações"' },
  { texto: 'Encontre "BMP SOCIEDADE DE CREDITO DIRETO S.A"' },
  { texto: 'Toque em "Autorizar"' },
  { texto: "Confirme com sua senha do FGTS" },
];

function SubPassoGuia({ onConcluiu }: { onConcluiu: () => void }) {
  const navigate = useNavigate();
  const [accordionAberto, setAccordionAberto] = useState<number | null>(0);

  const accordions = [
    {
      titulo: "Optar pelo Saque Aniversário (se ainda não fez)",
      tempo: "~2 min",
      conteudo: (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-xs text-green-700">
              Se já optou pelo Saque Aniversário, pule este passo.
            </p>
          </div>
          <Timeline passos={passosAcc1} />
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs leading-relaxed text-amber-800">
              <strong>Atenção:</strong> ao optar pelo Saque Aniversário, você não poderá
              sacar o saldo total em caso de demissão sem justa causa durante
              os primeiros 2 anos.
            </p>
          </div>
        </div>
      ),
    },
    {
      titulo: "Autorizar a BMP a consultar seu saldo",
      tempo: "~1 min",
      conteudo: (
        <div className="space-y-3">
          <Timeline passos={passosAcc2} />
          <div className="rounded-xl bg-muted p-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Procure exatamente por "BMP SOCIEDADE DE CREDITO DIRETO S.A" na lista de instituições autorizadas.
              {/* TODO: confirmar nome exato com backend antes do deploy */}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header contextual */}
      <div className="rounded-xl bg-[#FEF0E7] px-4 py-3">
        <p className="text-sm font-medium text-[#A33D05]">
          Siga os passos abaixo no app do FGTS
        </p>
        <p className="mt-0.5 text-xs text-[#A33D05]/70">
          Deixe os dois apps abertos ao mesmo tempo
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-2">
        {accordions.map((acc, i) => {
          const open = accordionAberto === i;
          return (
            <div key={i} className="rounded-2xl border border-border bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setAccordionAberto(open ? null : i)}
              >
                <div className="flex flex-1 items-center gap-2 pr-2">
                  <span className="text-sm font-medium text-foreground">{acc.titulo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{acc.tempo}</span>
                </div>
                <CaretDown
                  size={16}
                  className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && <div className="px-4 pb-4">{acc.conteudo}</div>}
            </div>
          );
        })}
      </div>

      {/* Rodapé */}
      <div className="sticky bottom-20 z-40 space-y-1 bg-background pb-6 pt-3 md:bottom-0">
        <button
          type="button"
          onClick={onConcluiu}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
        >
          Já fiz os dois passos
        </button>
        <button
          type="button"
          onClick={() => navigate("/duvidas")}
          className="w-full py-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Estou com dificuldade
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-passo: retorno (F3b)
// ---------------------------------------------------------------------------

function SubPassoRetorno({ onConsultar }: { onConsultar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-8 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
      >
        <CheckCircle size={32} className="text-green-600" weight="fill" />
      </motion.div>

      <div className="space-y-2">
        <p className="text-2xl font-semibold text-foreground">Ótimo, você voltou!</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Agora vamos consultar seu saldo na Caixa. Isso leva alguns segundos.
        </p>
      </div>

      <div className="sticky bottom-20 z-40 w-full bg-background pb-6 pt-3 md:bottom-0">
        <button
          type="button"
          onClick={onConsultar}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
        >
          Consultar meu saldo
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function FGTSCopilotoPage() {
  const navigate = useNavigate();
  const [subPasso, setSubPasso] = useState<SubPasso>("intro");

  const abrirAppFGTS = () => {
    setSubPasso("guia");
    // TODO: integrar deep link real
    // Android: window.location.href = 'intent://fgts.caixa.gov.br/#Intent;scheme=https;package=br.gov.caixa.fgts.trabalhador;end'
    // iOS: window.location.href = 'br.gov.caixa.fgts.trabalhador://'
    // Fallback: usuário abre manualmente seguindo o guia
  };

  return (
    <SubPageLayout title="Autorizar consulta">
      <div className="pb-6">
        {subPasso === "intro" && (
          <SubPassoIntro
            onAbrirApp={abrirAppFGTS}
            onJaAutorizei={() => navigate("/fgts/loading")}
          />
        )}
        {subPasso === "guia" && (
          <SubPassoGuia onConcluiu={() => setSubPasso("retorno")} />
        )}
        {subPasso === "retorno" && (
          <SubPassoRetorno onConsultar={() => navigate("/fgts/loading")} />
        )}
      </div>
    </SubPageLayout>
  );
}
