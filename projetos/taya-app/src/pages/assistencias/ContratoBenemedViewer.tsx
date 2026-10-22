import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { CONTRATO_BENEMED_BLOCOS, type BlocoContrato } from "./contratoBenemedConteudo";

// Renderiza "**negrito**" como <strong>, sem precisar de biblioteca de markdown — o texto fonte
// só usa esse recurso, confirmado ao gerar contratoBenemedConteudo.ts a partir da fonte.
function TextoComNegrito({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return <strong key={i} className="font-semibold">{parte.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{parte}</Fragment>;
      })}
    </>
  );
}

function Bloco({ bloco }: { bloco: BlocoContrato }) {
  if (bloco.tipo === "titulo") {
    return (
      <h4 className="mt-5 text-sm font-bold text-foreground first:mt-0">
        <TextoComNegrito texto={bloco.texto} />
      </h4>
    );
  }
  if (bloco.tipo === "item") {
    return (
      <li className="ml-4 list-disc text-sm leading-relaxed text-muted-foreground marker:text-[#FD5F31]">
        <TextoComNegrito texto={bloco.texto} />
      </li>
    );
  }
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      <TextoComNegrito texto={bloco.texto} />
    </p>
  );
}

// Agrupa "item" consecutivos numa única <ul>, pra não quebrar a lista em vários blocos soltos.
function agruparBlocos(blocos: BlocoContrato[]) {
  const grupos: (BlocoContrato | BlocoContrato[])[] = [];
  for (const b of blocos) {
    const ultimo = grupos[grupos.length - 1];
    if (b.tipo === "item" && Array.isArray(ultimo)) {
      ultimo.push(b);
    } else if (b.tipo === "item") {
      grupos.push([b]);
    } else {
      grupos.push(b);
    }
  }
  return grupos;
}

const GRUPOS = agruparBlocos(CONTRATO_BENEMED_BLOCOS);

// IG-07 — contrato "Termos da assinatura" (Prompt 1g, 22/10), aberto a partir de "Confirme seus
// dados" nos dois planos (Individual e Familiar: mesmo contrato, sem versão separada por plano).
// "Li e aceito" fecha e marca a caixa de aceite; "Fechar" só fecha, sem marcar nada — a página
// que abre este componente decide o que cada botão faz de verdade (ver ConfirmarDadosPage.tsx).
export function ContratoBenemedViewer({
  aberto,
  onFechar,
  onAceitar,
}: {
  aberto: boolean;
  onFechar: () => void;
  onAceitar: () => void;
}) {
  return (
    <ResponsiveSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Termos da assinatura"
      dialogClassName="max-w-lg"
      footer={
        <div className="space-y-2">
          <Button className="h-12 w-full rounded-full" onClick={onAceitar}>
            Li e aceito
          </Button>
          <button
            type="button"
            onClick={onFechar}
            className="flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
          >
            Fechar
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-[620px] space-y-2">
        {GRUPOS.map((grupo, i) =>
          Array.isArray(grupo) ? (
            <ul key={i} className="space-y-2 py-1">
              {grupo.map((item, j) => <Bloco key={j} bloco={item} />)}
            </ul>
          ) : (
            <Bloco key={i} bloco={grupo} />
          ),
        )}
      </div>
    </ResponsiveSheet>
  );
}
