import {
  Baby,
  Bone,
  Brain,
  Drop,
  Ear,
  GenderFemale,
  Heartbeat,
  PersonSimpleWalk,
  Pulse,
  SmileyMeh,
  Stethoscope,
  SunDim,
  TestTube,
  type Icon,
} from "@phosphor-icons/react";
import { PeekCarousel } from "@/components/PeekCarousel";
import { ESPECIALIDADES_CONTEUDO } from "@/data/saudeConteudo";

const ICONE_POR_NOME: Record<string, Icon> = {
  "Clínico Geral": Stethoscope,
  Cardiologia: Heartbeat,
  Dermatologia: SunDim,
  Endocrinologia: TestTube,
  Gastroenterologia: Pulse,
  Geriatria: PersonSimpleWalk,
  Ginecologia: GenderFemale,
  Neurologia: Brain,
  "Ortopedia e Traumatologia": Bone,
  Otorrino: Ear,
  Pediatria: Baby,
  Psiquiatria: SmileyMeh,
  Urologia: Drop,
};

// Mesmo padrão dos cards de situação: Card branco, área de ícone em fundo pêssego, texto embaixo
// — trocado da tile escura em degradê com texto branco pequeno que a v1 usava aqui.
//
// Achado ao corrigir a responsividade (21/10): o card precisa de `position: relative` mesmo sem
// nada posicionado dentro dele visualmente — é o span `.sr-only` de `nomeAcessivel` (ex:
// "Otorrinolaringologia") que precisa dele. Sem um ancestral posicionado mais próximo, esse span
// `absolute` buscava o wrapper do PeekCarousel como containing block, e como esse wrapper não
// tem overflow-hidden (só a faixa rolável interna tem), o span "vazava" pra posição estática dele
// no fluxo não cortado do carrossel inteiro (até 1300px+), estourando a largura da página inteira
// em qualquer tela que usasse esse carrossel. Com `relative` aqui, o containing block vira o
// próprio card (que já tem `overflow-hidden`), e o vazamento some.
export function EspecialidadesCarrossel() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">13 especialidades por vídeo.</h2>
      <p className="mt-1 text-sm text-muted-foreground">{ESPECIALIDADES_CONTEUDO.subtitulo}</p>
      <div className="mt-4">
        <PeekCarousel scrollStep={132} ariaLabel="Especialidades disponíveis por vídeo">
          {ESPECIALIDADES_CONTEUDO.itens.map((item) => {
            const Icone = ICONE_POR_NOME[item.nome] ?? Stethoscope;
            return (
              <div
                key={item.slot}
                className="relative w-[118px] min-w-[118px] shrink-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative flex h-[90px] items-center justify-center bg-[#FFF3EE]">
                  <Icone size={32} className="text-[#FD5F31]" />
                  {item.selo && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-[#D94E28] shadow">
                      {item.selo}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold leading-tight text-foreground">
                    <span aria-hidden={!!item.nomeAcessivel}>{item.nome}</span>
                    {item.nomeAcessivel && <span className="sr-only">{item.nomeAcessivel}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </PeekCarousel>
      </div>
    </section>
  );
}
