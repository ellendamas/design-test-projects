import { useEffect } from "react";

const TITULO = "Saúde por Assinatura | Pode Já";
const DESCRICAO = "Médico por vídeo a qualquer hora e descontos em remédios, consultas, exames e dentista. A partir de R$ 39,90 por mês.";
const IMAGEM_COMPARTILHAMENTO = "/images/assistencia-saude-nova.jpg";

function upsertMeta(attr: "name" | "property", key: string, content: string): HTMLMetaElement {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
  return tag;
}

// Título, descrição e imagem de compartilhamento da LP pública (/saude, Prompt 2 v3, seção 5) —
// não existe nenhum padrão de SSR/meta tag nesse app (SPA client-side só), então isso é uma
// troca direta no <head> via useEffect, restaurada no unmount pra não vazar pras telas do app
// se esse componente algum dia for montado/desmontado dentro de uma navegação sem reload de
// página inteira.
export function usarMetaTagsPublicas(ativo: boolean): void {
  useEffect(() => {
    if (!ativo || typeof document === "undefined") return;

    const tituloAnterior = document.title;
    document.title = TITULO;
    const metaDescricao = upsertMeta("name", "description", DESCRICAO);
    const metaOgImage = upsertMeta("property", "og:image", IMAGEM_COMPARTILHAMENTO);
    const metaOgTitle = upsertMeta("property", "og:title", TITULO);
    const metaOgDescricao = upsertMeta("property", "og:description", DESCRICAO);

    return () => {
      document.title = tituloAnterior;
      metaDescricao.remove();
      metaOgImage.remove();
      metaOgTitle.remove();
      metaOgDescricao.remove();
    };
  }, [ativo]);
}
