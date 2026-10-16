import { useEffect, useState } from "react";

// Mesmo hook de src/pages/benchmark/a/useReducedMotion.ts, duplicado aqui porque a Versão B
// fica isolada da pasta a/ (ver convenção estabelecida no briefing da Versão A). Usado pra
// desligar o efeito de "subida" das bolhas de chat quando o usuário pede menos movimento.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
